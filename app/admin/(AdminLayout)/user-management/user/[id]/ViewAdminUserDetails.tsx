"use client";

import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { Button, Card, Divider, Group, Skeleton, Stack, Text, Menu } from "@mantine/core";
import UserActivitiesTable from "./UserActivitiesTable";
import { EditUserModal } from "./EditUserModal";
import { useState } from "react";
import { ConfirmationModal } from "@/app/admin/_components/ConfirmationModal";
import { SuccessModal } from "@/app/admin/_components/SuccessModal";
import { UserStatus } from "../../hooks/useAdminUserDetails";
import { useParams, useRouter } from "next/navigation";
import { useAdminUserDetails } from "../../hooks/useAdminUserDetails";
import { DetailItem } from "@/app/admin/_components/DetailItem";
import { usePatchData } from "@/app/_lib/api/hooks";
import {
  adminApi,
  type UpdateAdminUserStatusPayload,
} from "@/app/admin/_services/admin-api";
import { useQueryClient } from "@tanstack/react-query";
import { adminKeys } from "@/app/_lib/api/query-keys";
import { notifications } from "@mantine/notifications";
import type { ApiError, ApiResponse } from "@/app/_lib/api/client";

const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

/**
 * Maps the current user status to the verb for the next action.
 *   ACTIVE      → "Deactivate"
 *   PENDING     → "Activate"
 *   DEACTIVATED → "Reactivate"
 */
type PendingAction = "Activate" | "Deactivate" | "Reactivate";

function getActionVerb(status: UserStatus): PendingAction {
  if (status === "ACTIVE") return "Deactivate";
  if (status === "PENDING") return "Activate";
  return "Reactivate";
}

function getPastTense(action: PendingAction): string {
  if (action === "Activate") return "Activated";
  if (action === "Deactivate") return "Deactivated";
  return "Reactivated";
}

/** The payload value isActive should be true when we are activating/reactivating */
function isActivePayload(action: PendingAction): boolean {
  return action === "Activate" || action === "Reactivate";
}

export default function ViewAdminUserDetails() {
  const queryClient = useQueryClient();
  const params = useParams<{ id: string }>();
  const userId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const router = useRouter();

  const { user, isLoading } = useAdminUserDetails(userId);

  // The real status always comes from the server; default only while loading.
  const currentStatus: UserStatus = user?.status ?? "PENDING";

  const [editOpen, setEditOpen] = useState(false);

  /**
   * pendingAction is set only when the confirmation modal is open.
   * It is the action the user intends to take (derived from currentStatus at
   * click time). We keep it until the success modal closes so the success
   * message is always consistent.
   */
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  // Derived labels — only meaningful while a pendingAction exists.
  const actionVerb = pendingAction ?? getActionVerb(currentStatus);
  const pastTenseVerb = pendingAction ? getPastTense(pendingAction) : "";

  const toggleStatusMutation = usePatchData(
    (payload: UpdateAdminUserStatusPayload) =>
      adminApi.management.users.updateStatus(userId!, payload),
    {
      onSuccess: async () => {
        notifications.show({
          title: "Status Updated",
          message: `Admin user has been ${pastTenseVerb.toLowerCase()} successfully.`,
          color: "green",
        });
        setIsConfirmOpen(false);
        setIsSuccessOpen(true);
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: [...adminKeys.management.users.all()],
          }),
          ...(userId
            ? [
                queryClient.invalidateQueries({
                  queryKey: [...adminKeys.management.users.detail(userId)],
                }),
              ]
            : []),
        ]);
      },
      onError: (error) => {
        const apiResponse = (error as unknown as ApiError).data as ApiResponse;
        notifications.show({
          title: "Update Failed",
          message:
            apiResponse?.error?.message ??
            error.message ??
            "Unable to update user status. Please try again.",
          color: "red",
        });
      },
    }
  );

  const handleToggleClick = () => {
    // Snapshot the action from the *current* server status at click time.
    setPendingAction(getActionVerb(currentStatus));
    setIsConfirmOpen(true);
  };

  const handleConfirmClose = () => {
    // User cancelled — discard the pending action and close.
    setIsConfirmOpen(false);
    setPendingAction(null);
  };

  const handleConfirm = () => {
    if (!userId || !pendingAction || toggleStatusMutation.isPending) return;
    toggleStatusMutation.mutate({
      isActive: isActivePayload(pendingAction),
      reason: "",
    });
  };

  const handleSuccessClose = () => {
    setIsSuccessOpen(false);
    // Only clear the pending action now so the success modal message stays
    // correct while it is still visible.
    setPendingAction(null);
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

  const userDetails = {
    fullName: user?.fullName ?? "",
    email: user?.email ?? "",
    phoneNumber: user?.phoneNumber ?? "",
    altPhoneNumber: user?.altPhoneNumber ?? "",
    position: user?.position ?? "",
    branch: user?.branch ?? "",
    departmentId: user?.departmentId ?? "",
    departmentName: user?.departmentName ?? "",
    roleName: user?.roleName ?? "",
    roleId: user?.roleId ?? "",
  };

  const handleViewAllCustomers = () => {
    router.push("/admin/user-management");
  };

  // The menu label always reflects what action would happen next, derived
  // directly from the real server status — never from transient local state.
  const menuActionLabel = getActionVerb(currentStatus);

  return (
    <>
      <div className="space-y-6">
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
                  <StatusBadge status={capitalize(currentStatus)} />
                </Group>
              </Stack>

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
                    {menuActionLabel}
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>

            <Text fw={600} c="orange" size="sm">
              User Details
            </Text>

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

      {editOpen && (
        <EditUserModal
          opened={editOpen}
          onClose={() => setEditOpen(false)}
          userId={userId}
          user={userDetails}
        />
      )}

      <ConfirmationModal
        opened={isConfirmOpen}
        onClose={handleConfirmClose}
        title={`${actionVerb} User?`}
        message={`Are you sure you want to ${actionVerb.toLowerCase()} this admin user? ${
          actionVerb === "Deactivate"
            ? "System access will be temporarily suspended until the admin user is reactivated."
            : "System access will be restored and this admin user will be able to access the system according to their role and related permissions."
        }`}
        primaryButtonText={`Yes, ${actionVerb} User`}
        secondaryButtonText="No, Close"
        onPrimary={handleConfirm}
        loading={toggleStatusMutation.isPending}
      />

      <SuccessModal
        opened={isSuccessOpen}
        onClose={handleSuccessClose}
        title={`User ${pastTenseVerb}`}
        message={`Admin user has been successfully ${pastTenseVerb.toLowerCase()}.`}
        primaryButtonText="Manage Users"
        onPrimaryClick={handleViewAllCustomers}
        secondaryButtonText="No, Close"
      />
    </>
  );
}