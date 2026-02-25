"use client";

import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { Button, Card, Divider, Group, Skeleton, Stack, Text, Menu } from "@mantine/core";
import UserActivitiesTable from "./UserActivitiesTable";
import { EditUserModal } from "./EditUserModal";
import { useState } from "react";
import { ConfirmationModal } from "@/app/admin/_components/ConfirmationModal";
import { SuccessModal } from "@/app/admin/_components/SuccessModal";
import { CustomerStatus } from "../../../customer/[id]/page";
import { useParams, useRouter } from "next/navigation";
import { useAdminUserDetails } from "../../hooks/useAdminUserDetails";
import { DetailItem } from "@/app/admin/_components/DetailItem";

export default function ViewAdminUserDetails() {
  const params = useParams<{ id: string }>();
  const userId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const router = useRouter();
  const { user, isLoading } = useAdminUserDetails(userId);
  const [statusOverride, setStatusOverride] = useState<CustomerStatus | null>(null);
  const status: CustomerStatus = statusOverride ?? (user?.isActive ? "Active" : "Deactivated");
  const [editOpen, setEditOpen] = useState(false);
  const isCurrentlyActive = status === "Active";
  const actionVerb = isCurrentlyActive ? "Deactivate" : "Reactivate";
  const pastTenseVerb = isCurrentlyActive ? "Deactivated" : "Reactivated";
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const handleToggleClick = () => {
    setIsConfirmOpen(true);
  };

  const handleConfirm = () => {
    setStatusOverride((prev) => {
      const currentStatus = prev ?? (user?.isActive ? "Active" : "Deactivated");
      return currentStatus === "Active" ? "Deactivated" : "Active";
    });
    setIsConfirmOpen(false);
    setIsSuccessOpen(true);
  };

  const formatDateTime = (iso?: string | null) => {
    if (!iso) return "—";
    const d = new Date(iso);
    const date = d.toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const time = d.toLocaleTimeString("en-NG", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return `${date} | ${time}`;
  };

  // Single source of truth for user details shown in edit modal
  const userDetails = {
    fullName: user?.fullName ?? "",
    email: user?.email ?? "",
    phoneNumber: user?.phoneNumber ?? "",
    altPhoneNumber: user?.altPhoneNumber ?? "",
    position: user?.position ?? "",
    branch: user?.branch ?? "",
    departmentId: user?.departmentId ?? "",
    roleId: user?.roleId ?? "",
  };

  const handleViewAllCustomers = () => {
    router.push("/admin/user-management");
  };

  return (
    <>
      <div className="space-y-6">
        {/* Main Card */}
        <Card radius="lg" p="lg">
          <Stack gap="xl">
            {/* Header */}
            <Group justify="space-between" align="flex-start">
              <Stack gap={4}>
                {isLoading ? (
                  <Skeleton height={24} width={220} />
                ) : (
                  <Text fw={600} size="lg">
                    {user?.fullName ?? "—"}
                  </Text>
                )}

                <Group gap="sm">
                  <Text size="xs" c="dimmed">
                    Date Created: {formatDateTime(user?.createdAt)}
                  </Text>
                  <StatusBadge status={status} />
                </Group>
              </Stack>

              {/* Take Action */}
              <Menu position="bottom-end" radius="md" shadow="sm">
                <Menu.Target>
                  <Button color="orange" radius="xl">
                    Take Action
                  </Button>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Item onClick={() => setEditOpen(true)}>Edit</Menu.Item>

                  <Divider />

                  <Menu.Item color="red" onClick={handleToggleClick}>
                    {isCurrentlyActive ? "Deactivate" : "Reactivate"}
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>

            {/* Section Title */}
            <Text fw={600} c="orange" size="sm">
              User Details
            </Text>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-y-6 gap-x-10">
              <DetailItem label="User ID" value={user?.id ?? "—"} loading={isLoading} />
              <DetailItem
                label="Role"
                value={user?.roleName ?? user?.roleId ?? "—"}
                loading={isLoading}
              />
              <DetailItem label="Position" value={user?.position ?? "—"} loading={isLoading} />
              <DetailItem
                label="Last Active"
                value={formatDateTime(user?.updatedAt)}
                loading={isLoading}
              />
              <DetailItem label="Email Address" value={user?.email ?? "—"} loading={isLoading} />
              <DetailItem
                label="Phone Number"
                value={user?.phoneNumber ?? "—"}
                loading={isLoading}
              />
              <DetailItem label="Branch" value={user?.branch ?? "—"} loading={isLoading} />
              <DetailItem
                label="Department"
                value={user?.departmentName ?? user?.departmentId ?? "—"}
                loading={isLoading}
              />
            </div>
          </Stack>
        </Card>
      </div>

      <div className="my-6">
        <UserActivitiesTable userId={userId} />
      </div>

      {/* ✅ Edit User Modal */}
      {editOpen && (
        <EditUserModal
          opened={editOpen}
          onClose={() => setEditOpen(false)}
          userId={userId}
          user={userDetails}
        />
      )}

      {/* Deactivate / Reactivate confirmation modal */}
      <ConfirmationModal
        opened={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title={`${actionVerb} User ?`}
        message={`Are you sure, ${actionVerb.toLowerCase()} this admin user? Kindly note that system access would be ${
          isCurrentlyActive
            ? "temporarily suspended, until the admin user is reactivated"
            : "restored therefore this admin user would now be able to access the system according to their role and related permissions"
        }`}
        primaryButtonText={`Yes, ${actionVerb} User`}
        secondaryButtonText="No, Close"
        onPrimary={handleConfirm}
      />

      {/* Success modal */}
      <SuccessModal
        opened={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        title={`Customer ${pastTenseVerb}`}
        message={`Admin user has been successfully ${pastTenseVerb.toLowerCase()}.`}
        primaryButtonText="Manage User"
        onPrimaryClick={handleViewAllCustomers}
        secondaryButtonText="No, Close"
      />
    </>
  );
}
