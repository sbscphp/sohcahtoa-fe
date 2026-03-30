"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  Text,
  Group,
  Button,
  Menu,
  Divider,
  Skeleton,
  Alert,
} from "@mantine/core";
import { adminRoutes } from "@/lib/adminRoutes";
import { DetailItem } from "@/app/admin/_components/DetailItem";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { ConfirmationModal } from "@/app/admin/_components/ConfirmationModal";
import { SuccessModal } from "@/app/admin/_components/SuccessModal";
import FormModal, { type FormField } from "@/app/admin/_components/FormModal";
import {
  useBranchDetails,
  formatBranchStatusForBadge,
  formatBranchCreatedAt,
} from "../../hooks/useBranchDetails";
import { usePutData } from "@/app/_lib/api/hooks";
import { adminApi } from "@/app/admin/_services/admin-api";
import { adminKeys } from "@/app/_lib/api/query-keys";
import { notifications } from "@mantine/notifications";
import type { ApiError, ApiResponse } from "@/app/_lib/api/client";

import { BranchAgentsTable } from "../[id]_branchDetailComponents/BranchAgentsTable";
import { BranchTransactionsTable } from "../[id]_branchDetailComponents/BranchTransactionsTable";

type TabKey = "agents" | "transactions";

const EDIT_BRANCH_STATES = [
  { value: "Lagos", label: "Lagos" },
  { value: "Abuja", label: "Abuja" },
  { value: "Kano", label: "Kano" },
  { value: "Rivers", label: "Rivers" },
  { value: "Oyo", label: "Oyo" },
  { value: "Enugu", label: "Enugu" },
  { value: "Kaduna", label: "Kaduna" },
  { value: "Delta", label: "Delta" },
  { value: "Ogun", label: "Ogun" },
  { value: "Anambra", label: "Anambra" },
];

const editBranchFields: FormField[] = [
  { name: "branchName", label: "Branch Name", type: "text", required: true, placeholder: "e.g. Yaba" },
  { name: "branchEmail", label: "Email Address", type: "email", required: true, placeholder: "e.g. yababranch@sohcahtoa.com" },
  { name: "state", label: "State", type: "select", required: true, placeholder: "Select state", options: EDIT_BRANCH_STATES },
  { name: "address", label: "Address", type: "textarea", required: true, placeholder: "e.g. No 14, Unilag Rd, Yaba Lagos.", minRows: 2 },
  { name: "branchManager", label: "Branch Manager", type: "text", required: true, placeholder: "e.g. Bashorun Dauda" },
  { name: "managerEmail", label: "Email Address", type: "email", required: true, placeholder: "e.g. bashorun@sohcahtoa.com" },
  { name: "phone", label: "Phone Number", type: "tel", required: true, placeholder: "+234 8138989206" },
];

export default function BranchDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

  if (!id) {
    return (
      <Alert color="red" title="Invalid branch">
        Missing branch id in the URL.
      </Alert>
    );
  }

  return <BranchDetailPageInner key={id} branchId={id} />;
}

function BranchDetailPageInner({ branchId }: { branchId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { branch, isLoading, isError, error } = useBranchDetails(branchId);

  const [activeOverride, setActiveOverride] = useState<boolean | null>(null);
  const effectiveIsActive = activeOverride ?? branch?.isActive ?? true;

  const [activeTab, setActiveTab] = useState<TabKey>("agents");

  const [deactivateConfirmOpen, setDeactivateConfirmOpen] = useState(false);
  const [reactivateConfirmOpen, setReactivateConfirmOpen] = useState(false);
  const [deactivateSuccessOpen, setDeactivateSuccessOpen] = useState(false);
  const [reactivateSuccessOpen, setReactivateSuccessOpen] = useState(false);

  const [editModalOpened, setEditModalOpened] = useState(false);
  const [editConfirmOpen, setEditConfirmOpen] = useState(false);
  const [editSuccessOpen, setEditSuccessOpen] = useState(false);
  const [pendingEditData, setPendingEditData] = useState<Record<string, any> | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  const editFormInitialValues = useMemo(
    () => ({
      branchName: branch?.name ?? "",
      branchEmail: branch?.branchEmail ?? "",
      state: branch?.state ?? "",
      address: branch?.address ?? "",
      branchManager: branch?.branchManager ?? "",
      managerEmail: branch?.email ?? "",
      phone: branch?.phoneNumber ?? "",
    }),
    [branch]
  );

  const statusBadgeLabel = branch ? formatBranchStatusForBadge(branch.status) : "--";
  const createdLabel = branch ? formatBranchCreatedAt(branch.createdAt) : "--";

  const updateStatusMutation = usePutData(
    (payload: { status: boolean }) =>
      adminApi.outlet.branches.updateStatus(branchId, payload),
    {
      onError: (err) => {
        const apiResponse = (err as unknown as ApiError).data as ApiResponse | undefined;
        notifications.show({
          title: "Update Branch Status Failed",
          message:
            apiResponse?.error?.message ??
            apiResponse?.message ??
            err.message ??
            "Unable to update branch status. Please try again.",
          color: "red",
        });
      },
    }
  );

  const formModalKey = `${branch?.id ?? "edit"}-${branch?.updatedAt ?? ""}`;

  const handleEditSubmit = (data: Record<string, any>) => {
    setPendingEditData(data);
    setEditModalOpened(false);
    setEditConfirmOpen(true);
  };

  const handleEditConfirmSave = async () => {
    setEditLoading(true);
    if (pendingEditData) {
      // TODO: persist pendingEditData via API
      await new Promise((r) => setTimeout(r, 600));
    }
    setEditLoading(false);
    setEditConfirmOpen(false);
    setEditSuccessOpen(true);
    setPendingEditData(null);
  };

  const handleDeactivateConfirm = async () => {
    try {
      await updateStatusMutation.mutateAsync({ status: false });
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [...adminKeys.outlet.branches.detail(branchId)],
        }),
        queryClient.invalidateQueries({
          queryKey: [...adminKeys.outlet.branches.all()],
        }),
      ]);
      setActiveOverride(false);
      setDeactivateConfirmOpen(false);
      setDeactivateSuccessOpen(true);
      notifications.show({
        title: "Branch Deactivated",
        message: "Branch has been successfully deactivated.",
        color: "green",
      });
    } catch {
      // Notification is handled in mutation onError.
    }
  };

  const handleReactivateConfirm = async () => {
    try {
      await updateStatusMutation.mutateAsync({ status: true });
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [...adminKeys.outlet.branches.detail(branchId)],
        }),
        queryClient.invalidateQueries({
          queryKey: [...adminKeys.outlet.branches.all()],
        }),
      ]);
      setActiveOverride(true);
      setReactivateConfirmOpen(false);
      setReactivateSuccessOpen(true);
      notifications.show({
        title: "Branch Reactivated",
        message: "Branch has been successfully reactivated.",
        color: "green",
      });
    } catch {
      // Notification is handled in mutation onError.
    }
  };

  return (
    <div className="space-y-6">
      {isError && (
        <Alert color="red" title="Could not load branch">
          {error?.message ?? "Unable to load branch details. Please try again."}
        </Alert>
      )}

      {/* Header card */}
      <div className="rounded-2xl bg-white shadow-sm">
        <div className="flex flex-col gap-6 p-6 md:p-8">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton height={32} width="60%" />
              <Skeleton height={20} width="40%" />
              <Divider className="my-2" />
              <Skeleton height={24} width={180} />
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} height={56} />
                ))}
              </div>
            </div>
          ) : branch ? (
            <>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <Text size="xl" fw={600} className="text-gray-900">
                    {branch.name}
                  </Text>
                  <Group gap={8} className="flex-wrap text-sm text-gray-600">
                    <span>Date Created: {createdLabel}</span>
                    <StatusBadge status={statusBadgeLabel} />
                  </Group>
                </div>

                <Menu position="bottom-end" shadow="md" width={160}>
                  <Menu.Target>
                    <Button radius="xl" size="md" color="#DD4F05">
                      Take Action
                    </Button>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item
                      onClick={() =>
                        router.push(adminRoutes.adminOutletBranchEditDetails(branchId))
                      }
                    >
                      Edit
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item
                      onClick={() =>
                        effectiveIsActive
                          ? setDeactivateConfirmOpen(true)
                          : setReactivateConfirmOpen(true)
                      }
                    >
                      {effectiveIsActive ? "Deactivate" : "Reactivate"}
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </div>

              <Divider className="my-2" />

              <section className="space-y-4">
                <Text fw={600} className="text-orange-500">
                  Branch Details
                </Text>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <DetailItem label="Branch ID" value={branch.id} />
                  <DetailItem label="Total Agents" value="--" />
                  <DetailItem
                    label="Manager Email"
                    value={branch.email?.trim() ? branch.email : "--"}
                  />
                  <DetailItem label="Branch Manager" value={branch.branchManager} />
                  <DetailItem label="State" value={branch.state} />
                  <DetailItem
                    label="Branch Email"
                    value={branch.branchEmail?.trim() ? branch.branchEmail : "--"}
                  />
                  <DetailItem label="Address" value={branch.address} />
                  <DetailItem label="Phone Number" value={branch.phoneNumber} />
                  {branch.franchiseId ? (
                    <DetailItem label="Franchise ID" value={branch.franchiseId} />
                  ) : null}
                </div>
              </section>
            </>
          ) : !isError ? (
            <Text c="dimmed" size="sm">
              No branch data found.
            </Text>
          ) : null}
        </div>
      </div>

      {/* Tabs + Agents / Transactions */}
      <div className="rounded-2xl bg-white shadow-sm p-6">
        <div className="flex gap-6 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab("agents")}
            className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
              activeTab === "agents"
                ? "text-primary-500 font-semibold"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Agents
            {activeTab === "agents" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("transactions")}
            className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
              activeTab === "transactions"
                ? "text-primary-500 font-semibold"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Transactions
            {activeTab === "transactions" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500" />
            )}
          </button>
        </div>

        {activeTab === "agents" ? (
          <BranchAgentsTable branchId={branchId} />
        ) : (
          <BranchTransactionsTable branchId={branchId} />
        )}
      </div>

      {/* Edit Branch Details modal */}
      <FormModal
        key={formModalKey}
        opened={editModalOpened}
        onClose={() => setEditModalOpened(false)}
        title="Edit Branch Details"
        description="View and manage branch details"
        fields={editBranchFields}
        initialValues={editFormInitialValues}
        onSubmit={handleEditSubmit}
        submitLabel="Save Changes"
        cancelLabel="Close"
        size="lg"
      />

      {/* Edit save confirmation */}
      <ConfirmationModal
        opened={editConfirmOpen}
        onClose={() => setEditConfirmOpen(false)}
        title="Save Changes ?"
        message="Are you sure, save and update this changes? Kindly note that this new changes would override the existing data."
        primaryButtonText="Yes, Save and Update Changes"
        secondaryButtonText="No, Close"
        onPrimary={handleEditConfirmSave}
        onSecondary={() => setEditConfirmOpen(false)}
        loading={editLoading}
      />

      {/* Edit success */}
      <SuccessModal
        opened={editSuccessOpen}
        onClose={() => setEditSuccessOpen(false)}
        title="New Changes Saved"
        message="New Changes has been successfully Saved and Updated"
        primaryButtonText="Manage Branch"
        secondaryButtonText="No, Close"
        onPrimaryClick={() => setEditSuccessOpen(false)}
        onSecondaryClick={() => setEditSuccessOpen(false)}
      />

      {/* Deactivate confirmation */}
      <ConfirmationModal
        opened={deactivateConfirmOpen}
        onClose={() => setDeactivateConfirmOpen(false)}
        title="Deactivate Branch ?"
        message="Are you sure, Deactivate this branch? Kindly note that system access would be temporarily suspended, until the branch is reactivated"
        primaryButtonText="Yes, Deactivate Branch"
        secondaryButtonText="No, Close"
        onPrimary={handleDeactivateConfirm}
        onSecondary={() => setDeactivateConfirmOpen(false)}
        loading={updateStatusMutation.isPending}
      />

      {/* Reactivate confirmation */}
      <ConfirmationModal
        opened={reactivateConfirmOpen}
        onClose={() => setReactivateConfirmOpen(false)}
        title="Reactivate Branch ?"
        message="Are you sure, Reactivate this branch? Kindly note that system access would be restored therefore this admin user would now be able to access the system according to their role and related permissions"
        primaryButtonText="Yes, Reactivate Branch"
        secondaryButtonText="No, Close"
        onPrimary={handleReactivateConfirm}
        onSecondary={() => setReactivateConfirmOpen(false)}
        loading={updateStatusMutation.isPending}
      />

      {/* Deactivate success */}
      <SuccessModal
        opened={deactivateSuccessOpen}
        onClose={() => setDeactivateSuccessOpen(false)}
        title="Branch Deactivated"
        message="Branch has been successfully deactivated"
        primaryButtonText="Manage Branch"
        secondaryButtonText="No, Close"
        onPrimaryClick={() => setDeactivateSuccessOpen(false)}
        onSecondaryClick={() => setDeactivateSuccessOpen(false)}
      />

      {/* Reactivate success */}
      <SuccessModal
        opened={reactivateSuccessOpen}
        onClose={() => setReactivateSuccessOpen(false)}
        title="Branch Reactivated"
        message="Branch has been successfully Reactivated"
        primaryButtonText="Manage Branch"
        secondaryButtonText="No, Close"
        onPrimaryClick={() => setReactivateSuccessOpen(false)}
        onSecondaryClick={() => setReactivateSuccessOpen(false)}
      />
    </div>
  );
}
