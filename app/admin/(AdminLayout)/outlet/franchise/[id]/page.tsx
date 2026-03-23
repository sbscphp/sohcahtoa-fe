"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  Text,
  Group,
  Button,
  Menu,
  Divider,
  Skeleton,
  Alert,
} from "@mantine/core";
import { DetailItem } from "@/app/admin/_components/DetailItem";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { CustomButton } from "@/app/admin/_components/CustomButton";
import { ConfirmationModal } from "@/app/admin/_components/ConfirmationModal";
import { SuccessModal } from "@/app/admin/_components/SuccessModal";
import FormModal, { type FormField } from "@/app/admin/_components/FormModal";
import { FranchiseDetailTabbedTables } from "./_franchiseDetailComponents/FranchiseDetailTabbedTables";
import {
  useFranchiseDetails,
  formatFranchiseStatusForBadge,
  formatFranchiseCreatedAt,
} from "../../hooks/useFranchiseDetails";

const EDIT_FRANCHISE_STATES = [
  { value: "Lagos State", label: "Lagos State" },
  { value: "Abuja", label: "Abuja" },
  { value: "Kano", label: "Kano" },
  { value: "Rivers", label: "Rivers" },
  { value: "Oyo", label: "Oyo" },
  { value: "Enugu", label: "Enugu" },
  { value: "Kaduna", label: "Kaduna" },
  { value: "Delta", label: "Delta" },
  { value: "Ogun", label: "Ogun" },
  { value: "Anambra", label: "Anambra" },
  { value: "Osun", label: "Osun" },
];

const editFranchiseFields: FormField[] = [
  { name: "franchiseName", label: "Franchise Name", type: "text", required: true, placeholder: "e.g. Sterling Exchange" },
  { name: "state", label: "State", type: "select", required: true, placeholder: "Select state", options: EDIT_FRANCHISE_STATES },
  { name: "address", label: "Address", type: "text", required: true, placeholder: "Enter address" },
  { name: "contactPerson", label: "Contact Person", type: "text", required: true, placeholder: "e.g. Adekunle, Ibrahim Olamide" },
  { name: "emailAddress", label: "Email Address", type: "email", required: true, placeholder: "e.g. olamide@sohcahtoa.com" },
  { name: "phoneNumber1", label: "Phone Number 1", type: "tel", required: true, placeholder: "+234 8056283635" },
  { name: "phoneNumber2", label: "Phone Number 2", type: "tel", required: true, placeholder: "+234 000000000" },
];

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
  const { franchise, isLoading, isError, error } = useFranchiseDetails(franchiseId);

  /** Local override after mock deactivate/reactivate until refetch is wired; cleared when franchise id from route changes */
  const [activeOverride, setActiveOverride] = useState<boolean | null>(null);
  const effectiveIsActive = activeOverride ?? franchise?.isActive ?? true;

  const [deactivateConfirmOpen, setDeactivateConfirmOpen] = useState(false);
  const [reactivateConfirmOpen, setReactivateConfirmOpen] = useState(false);
  const [deactivateSuccessOpen, setDeactivateSuccessOpen] = useState(false);
  const [reactivateSuccessOpen, setReactivateSuccessOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [editModalOpened, setEditModalOpened] = useState(false);
  const [editConfirmOpen, setEditConfirmOpen] = useState(false);
  const [editSuccessOpen, setEditSuccessOpen] = useState(false);
  const [pendingEditData, setPendingEditData] = useState<Record<string, unknown> | null>(null);
  const [editLoading, setEditLoading] = useState(false);

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

  const branchStatsSummary = useMemo(() => {
    if (!franchise?.branchStats) return "--";
    const { total, active, pending, deactivated } = franchise.branchStats;
    return `${total} total (${active} active, ${pending} pending, ${deactivated} deactivated)`;
  }, [franchise]);

  const handleEditSubmit = (data: Record<string, unknown>) => {
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
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setActiveOverride(false);
    setDeactivateConfirmOpen(false);
    setDeactivateSuccessOpen(true);
    setLoading(false);
  };

  const handleReactivateConfirm = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setActiveOverride(true);
    setReactivateConfirmOpen(false);
    setReactivateSuccessOpen(true);
    setLoading(false);
  };

  const statusBadgeLabel = franchise ? formatFranchiseStatusForBadge(franchise.status) : "--";
  const createdLabel = franchise ? formatFranchiseCreatedAt(franchise.createdAt) : "--";

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
                  <CustomButton buttonType="secondary" size="md" radius="xl">
                    View Updates
                  </CustomButton>
                  <Menu position="bottom-end" shadow="md" width={160}>
                    <Menu.Target>
                      <Button radius="xl" size="md" color="#DD4F05">
                        Take Action
                      </Button>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item onClick={() => setEditModalOpened(true)}>
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
        key={franchise?.id ?? "edit"}
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
        loading={editLoading}
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
        loading={loading}
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
        loading={loading}
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
