"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
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
import { notifications } from "@mantine/notifications";
import { DetailItem } from "@/app/admin/_components/DetailItem";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
// import { CustomButton } from "@/app/admin/_components/CustomButton";
import { ConfirmationModal } from "@/app/admin/_components/ConfirmationModal";
import { SuccessModal } from "@/app/admin/_components/SuccessModal";
import FormModal, { type FormField } from "@/app/admin/_components/FormModal";
import { FranchiseDetailTabbedTables } from "./_franchiseDetailComponents/FranchiseDetailTabbedTables";
import {
  useFranchiseDetails,
  formatFranchiseStatusForBadge,
  formatFranchiseCreatedAt,
} from "../../hooks/useFranchiseDetails";
import { useOutletStates } from "../../hooks/useOutletStates";
import { usePutData } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import type { ApiError, ApiResponse } from "@/app/_lib/api/client";
import {
  adminApi,
  type UpdateFranchisePayload,
  type UpdateFranchiseStatusPayload,
} from "@/app/admin/_services/admin-api";

function buildUpdatePayload(data: Record<string, unknown>): UpdateFranchisePayload {
  return {
    franchiseName: String(data.franchiseName ?? "").trim(),
    state: String(data.state ?? "").trim(),
    address: String(data.address ?? "").trim(),
    contactPersonName: String(data.contactPerson ?? "").trim(),
    email: String(data.emailAddress ?? "").trim(),
    phoneNumber: String(data.phoneNumber1 ?? "").trim(),
    altPhoneNumber: String(data.phoneNumber2 ?? "").trim(),
  };
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function FranchiseDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

  if (!id) {
    return (
      <Alert color="red" title="Invalid franchise">
        Missing franchise id in the URL.
      </Alert>
    );
  }

  return <FranchiseDetailPageInner key={id} franchiseId={id} />;
}

function FranchiseDetailPageInner({ franchiseId }: { franchiseId: string }) {
  const queryClient = useQueryClient();
  const { franchise, isLoading, isError, error } = useFranchiseDetails(franchiseId);
  const {
    states,
    isLoading: isStatesLoading,
    isError: isStatesError,
    error: statesError,
  } = useOutletStates();

  const hasStateOptions = states.length > 0;

  /** Local override after mock deactivate/reactivate until refetch is wired; cleared when franchise id from route changes */
  const [activeOverride, setActiveOverride] = useState<boolean | null>(null);
  const effectiveIsActive = activeOverride ?? franchise?.isActive ?? true;

  const [deactivateConfirmOpen, setDeactivateConfirmOpen] = useState(false);
  const [reactivateConfirmOpen, setReactivateConfirmOpen] = useState(false);
  const [deactivateSuccessOpen, setDeactivateSuccessOpen] = useState(false);
  const [reactivateSuccessOpen, setReactivateSuccessOpen] = useState(false);

  const [editModalOpened, setEditModalOpened] = useState(false);
  const [editConfirmOpen, setEditConfirmOpen] = useState(false);
  const [editSuccessOpen, setEditSuccessOpen] = useState(false);
  const [pendingEditData, setPendingEditData] = useState<Record<string, unknown> | null>(null);

  const editFranchiseFields = useMemo<FormField[]>(
    () => [
      {
        name: "franchiseName",
        label: "Franchise Name",
        type: "text",
        required: true,
        placeholder: "e.g. Sterling Exchange",
      },
      {
        name: "state",
        label: "State",
        type: "select",
        required: true,
        placeholder: isStatesLoading ? "Loading states..." : "Select state",
        options: states,
        disabled: isStatesLoading || !hasStateOptions,
      },
      { name: "address", label: "Address", type: "text", required: true, placeholder: "Enter address" },
      {
        name: "contactPerson",
        label: "Contact Person",
        type: "text",
        required: true,
        placeholder: "e.g. Adekunle, Ibrahim Olamide",
      },
      {
        name: "emailAddress",
        label: "Email Address",
        type: "email",
        required: true,
        placeholder: "e.g. olamide@sohcahtoa.com",
      },
      {
        name: "phoneNumber1",
        label: "Phone Number 1",
        type: "tel",
        required: true,
        placeholder: "+234 8056283635",
      },
      {
        name: "phoneNumber2",
        label: "Phone Number 2",
        type: "tel",
        required: false,
        placeholder: "+234 000000000",
      },
    ],
    [hasStateOptions, isStatesLoading, states]
  );

  const editFormInitialValues = useMemo(
    () => ({
      franchiseName: franchise?.franchiseName ?? "",
      state: franchise?.state ?? "",
      address: franchise?.address ?? "",
      contactPerson: franchise?.contactPerson ?? "",
      emailAddress: franchise?.email ?? "",
      phoneNumber1: franchise?.phoneNumber ?? "",
      phoneNumber2: franchise?.altPhoneNumber ?? "",
    }),
    [franchise]
  );

  const updateFranchiseMutation = usePutData(
    ({ id, payload }: { id: string; payload: UpdateFranchisePayload }) =>
      adminApi.outlet.franchises.update(id, payload),
    {
      onError: (err) => {
        const apiResponse = (err as unknown as ApiError).data as ApiResponse | undefined;
        notifications.show({
          title: "Update Franchise Failed",
          message:
            apiResponse?.error?.message ??
            err.message ??
            "Unable to update franchise. Please try again.",
          color: "red",
        });
      },
    }
  );

  const updateFranchiseStatusMutation = usePutData(
    (payload: UpdateFranchiseStatusPayload) =>
      adminApi.outlet.franchises.updateStatus(franchiseId, payload),
    {
      onError: (err) => {
        const apiResponse = (err as unknown as ApiError).data as ApiResponse | undefined;
        notifications.show({
          title: "Update Franchise Status Failed",
          message:
            apiResponse?.error?.message ??
            apiResponse?.message ??
            err.message ??
            "Unable to update franchise status. Please try again.",
          color: "red",
        });
      },
    }
  );

  const branchStatsSummary = useMemo(() => {
    if (!franchise?.branchStats) return "--";
    const { total, active, pending, deactivated } = franchise.branchStats;
    return `${total} total (${active} active, ${pending} pending, ${deactivated} deactivated)`;
  }, [franchise]);

  const openEditModal = () => {
    if (isStatesError) {
      notifications.show({
        title: "Unable to Load States",
        message:
          statesError?.message ??
          "States could not be fetched. You cannot edit a franchise until states are available.",
        color: "red",
      });
      return;
    }
    if (!hasStateOptions && !isStatesLoading) {
      notifications.show({
        title: "State Required",
        message:
          "State options are unavailable. Please try again when states are loaded.",
        color: "red",
      });
      return;
    }
    setEditModalOpened(true);
  };

  const handleEditSubmit = (data: Record<string, unknown>) => {
    const email = String(data.emailAddress ?? "").trim();
    if (!isValidEmail(email)) {
      notifications.show({
        title: "Invalid Email Address",
        message: "Enter a valid email address before saving changes.",
        color: "red",
      });
      return;
    }

    setPendingEditData(data);
    setEditModalOpened(false);
    setEditConfirmOpen(true);
  };

  const handleEditConfirmSave = async () => {
    if (!pendingEditData) return;
    const payload = buildUpdatePayload(pendingEditData);
    if (!isValidEmail(payload.email)) {
      notifications.show({
        title: "Invalid Email Address",
        message: "Enter a valid email address before updating this franchise.",
        color: "red",
      });
      setEditConfirmOpen(false);
      setEditModalOpened(true);
      return;
    }

    try {
      await updateFranchiseMutation.mutateAsync({ id: franchiseId, payload });
      await queryClient.invalidateQueries({
        queryKey: [...adminKeys.outlet.franchises.detail(franchiseId)],
      });
      await queryClient.invalidateQueries({
        queryKey: [...adminKeys.outlet.franchises.all()],
      });
      setEditConfirmOpen(false);
      setEditSuccessOpen(true);
      setPendingEditData(null);
    } catch {
      setEditConfirmOpen(false);
    }
  };

  const handleDeactivateConfirm = async () => {
    try {
      await updateFranchiseStatusMutation.mutateAsync({ status: false });
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [...adminKeys.outlet.franchises.detail(franchiseId)],
        }),
        queryClient.invalidateQueries({
          queryKey: [...adminKeys.outlet.franchises.all()],
        }),
      ]);
      setActiveOverride(false);
      setDeactivateConfirmOpen(false);
      setDeactivateSuccessOpen(true);
      notifications.show({
        title: "Franchise Deactivated",
        message: "Franchise has been successfully deactivated.",
        color: "green",
      });
    } catch {
      // Notification handled in mutation onError.
    }
  };

  const handleReactivateConfirm = async () => {
    try {
      await updateFranchiseStatusMutation.mutateAsync({ status: true });
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [...adminKeys.outlet.franchises.detail(franchiseId)],
        }),
        queryClient.invalidateQueries({
          queryKey: [...adminKeys.outlet.franchises.all()],
        }),
      ]);
      setActiveOverride(true);
      setReactivateConfirmOpen(false);
      setReactivateSuccessOpen(true);
      notifications.show({
        title: "Franchise Reactivated",
        message: "Franchise has been successfully reactivated.",
        color: "green",
      });
    } catch {
      // Notification handled in mutation onError.
    }
  };

  const statusBadgeLabel = franchise ? formatFranchiseStatusForBadge(franchise.status) : "--";
  const createdLabel = franchise ? formatFranchiseCreatedAt(franchise.createdAt) : "--";
  const formModalKey = `${franchise?.id ?? "edit"}-${franchise?.updatedAt ?? ""}`;

  return (
    <div className="space-y-6">
      {isError && (
        <Alert color="red" title="Could not load franchise">
          {error?.message ?? "Unable to load franchise details. Please try again."}
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
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} height={56} />
                ))}
              </div>
            </div>
          ) : franchise ? (
            <>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <Text size="xl" fw={600} className="text-gray-900">
                    {franchise.franchiseName}
                  </Text>
                  <Group gap={8} className="flex-wrap text-sm text-gray-600">
                    <span>Date Created: {createdLabel}</span>
                    <StatusBadge status={statusBadgeLabel} />
                  </Group>
                </div>

                <Group gap="sm">
                  {/* <CustomButton buttonType="secondary" size="md" radius="xl">
                    View Updates
                  </CustomButton> */}
                  <Menu position="bottom-end" shadow="md" width={160}>
                    <Menu.Target>
                      <Button radius="xl" size="md" color="#DD4F05">
                        Take Action
                      </Button>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item onClick={openEditModal}>Edit</Menu.Item>
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
                </Group>
              </div>

              <Divider className="my-2" />

              <section className="space-y-4">
                <Text fw={600} className="text-orange-500">
                  Franchise Details
                </Text>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <DetailItem label="Franchise ID" value={franchise.id} />
                  <DetailItem label="State" value={franchise.state} />
                  <DetailItem label="Address" value={franchise.address} />
                  <DetailItem label="Contact Person" value={franchise.contactPerson} />
                  <DetailItem label="Branches" value={branchStatsSummary} />
                  <DetailItem label="Email Address" value={franchise.email} />
                  <DetailItem label="Phone Number" value={franchise.phoneNumber} />
                  <DetailItem
                    label="Alt Phone"
                    value={franchise.altPhoneNumber?.trim() ? franchise.altPhoneNumber : "--"}
                  />
                </div>
              </section>
            </>
          ) : !isError ? (
            <Text c="dimmed" size="sm">
              No franchise data found.
            </Text>
          ) : null}
        </div>
      </div>

      <FranchiseDetailTabbedTables franchiseId={franchiseId} />

      <FormModal
        key={formModalKey}
        opened={editModalOpened}
        onClose={() => setEditModalOpened(false)}
        title="Edit Franchise Details"
        description="View and manage franchise details"
        fields={editFranchiseFields}
        initialValues={editFormInitialValues}
        onSubmit={handleEditSubmit}
        submitLabel="Save Changes"
        cancelLabel="Close"
        size="lg"
      />

      <ConfirmationModal
        opened={editConfirmOpen}
        onClose={() => setEditConfirmOpen(false)}
        title="Save Changes ?"
        message="Are you sure, save and update this changes? Kindly note that this new changes would override the existing data."
        primaryButtonText="Yes, Save and Update Changes"
        secondaryButtonText="No, Close"
        onPrimary={handleEditConfirmSave}
        onSecondary={() => setEditConfirmOpen(false)}
        loading={updateFranchiseMutation.isPending}
      />

      <SuccessModal
        opened={editSuccessOpen}
        onClose={() => setEditSuccessOpen(false)}
        title="New Changes Saved"
        message="New Changes has been successfully Saved and Updated"
        primaryButtonText="Manage Franchise"
        secondaryButtonText="No, Close"
        onPrimaryClick={() => setEditSuccessOpen(false)}
        onSecondaryClick={() => setEditSuccessOpen(false)}
      />

      <ConfirmationModal
        opened={deactivateConfirmOpen}
        onClose={() => setDeactivateConfirmOpen(false)}
        title="Deactivate Franchise ?"
        message="Are you sure, Deactivate this franchise? Kindly note that system access would be temporarily suspended, until the franchise is reactivated"
        primaryButtonText="Yes, Deactivate Franchise"
        secondaryButtonText="No, Close"
        onPrimary={handleDeactivateConfirm}
        onSecondary={() => setDeactivateConfirmOpen(false)}
        loading={updateFranchiseStatusMutation.isPending}
      />

      <ConfirmationModal
        opened={reactivateConfirmOpen}
        onClose={() => setReactivateConfirmOpen(false)}
        title="Reactivate Franchise ?"
        message="Are you sure, Reactivate this franchise? Kindly note that system access would be restored therefore this admin user would now be able to access the system according to their role and related permissions"
        primaryButtonText="Yes, Reactivate Franchise"
        secondaryButtonText="No, Close"
        onPrimary={handleReactivateConfirm}
        onSecondary={() => setReactivateConfirmOpen(false)}
        loading={updateFranchiseStatusMutation.isPending}
      />

      <SuccessModal
        opened={deactivateSuccessOpen}
        onClose={() => setDeactivateSuccessOpen(false)}
        title="Franchise Deactivated"
        message="Franchise has been successfully deactivated"
        primaryButtonText="Manage Franchise"
        secondaryButtonText="No, Close"
        onPrimaryClick={() => setDeactivateSuccessOpen(false)}
        onSecondaryClick={() => setDeactivateSuccessOpen(false)}
      />

      <SuccessModal
        opened={reactivateSuccessOpen}
        onClose={() => setReactivateSuccessOpen(false)}
        title="Franchise Reactivated"
        message="Admin user has been successfully Reactivated"
        primaryButtonText="Manage Franchise"
        secondaryButtonText="No, Close"
        onPrimaryClick={() => setReactivateSuccessOpen(false)}
        onSecondaryClick={() => setReactivateSuccessOpen(false)}
      />
    </div>
  );
}
