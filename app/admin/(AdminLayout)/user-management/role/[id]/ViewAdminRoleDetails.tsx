"use client";

import { useState } from "react";
import {
  Button,
  Card,
  Group,
  Skeleton,
  Stack,
  Text,
  Menu,
  Accordion,
  Checkbox,
  Switch,
} from "@mantine/core";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { ConfirmationModal } from "@/app/admin/_components/ConfirmationModal";
import { SuccessModal } from "@/app/admin/_components/SuccessModal";
import { CustomerStatus } from "../../../customer/[id]/page";
import { useParams, useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useAdminRoleDetails } from "../../hooks/useAdminRoleDetails";
import { adminRoutes } from "@/lib/adminRoutes";
import { useDeleteData } from "@/app/_lib/api/hooks";
import { adminApi } from "@/app/admin/_services/admin-api";
import { useQueryClient } from "@tanstack/react-query";
import { adminKeys } from "@/app/_lib/api/query-keys";
import { notifications } from "@mantine/notifications";
import type { ApiError, ApiResponse } from "@/app/_lib/api/client";
import EmptySection from "@/app/admin/_components/EmptySection";
import { EditRoleModal } from "../../_userManagementComponents/roles/EditRoleModal";

export default function ViewAdminRoleDetails() {
  const params = useParams<{ id: string }>();
  const roleId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const { role, isLoading } = useAdminRoleDetails(roleId);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [statusOverride, setStatusOverride] = useState<CustomerStatus | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteSuccessOpen, setDeleteSuccessOpen] = useState(false);

  const status: CustomerStatus =
    statusOverride ?? (role?.isActive ? "Active" : "Deactivated");
  const isActive = status === "Active";
  const actionVerb = isActive ? "Deactivate" : "Reactivate";
  const pastTenseVerb = isActive ? "Deactivated" : "Reactivated";

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

  const normalizeAction = (action: string) => {
    const normalized = action.replace(/^can\./, "");
    const text = normalized.charAt(0).toUpperCase() + normalized.slice(1);
    return `Can ${text}`;
  };

  const permissionsData = role?.permissions ?? {};
  const permissionCount = Object.values(permissionsData).reduce((total, moduleScopes) => {
    const scopeActions = Object.values(moduleScopes ?? {});
    return (
      total +
      scopeActions.reduce(
        (scopeTotal, actions) => scopeTotal + (Array.isArray(actions) ? actions.length : 0),
        0
      )
    );
  }, 0);

  const handleConfirm = () => {
    setStatusOverride((prev) => {
      const current = prev ?? (role?.isActive ? "Active" : "Deactivated");
      return current === "Active" ? "Deactivated" : "Active";
    });
    setConfirmOpen(false);
    setSuccessOpen(true);
  };

  const deleteRoleMutation = useDeleteData(
    (id: string) => adminApi.management.roles.delete(id),
    {
      onSuccess: async () => {
        setDeleteConfirmOpen(false);
        setDeleteSuccessOpen(true);
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: [...adminKeys.management.roles.all()],
          }),
          queryClient.invalidateQueries({
            queryKey: [...adminKeys.management.roles.stats()],
          }),
          ...(roleId
            ? [
                queryClient.invalidateQueries({
                  queryKey: [...adminKeys.management.roles.detail(roleId)],
                }),
              ]
            : []),
        ]);
      },
      onError: (error) => {
        const apiResponse = (error as unknown as ApiError).data as ApiResponse;
        notifications.show({
          title: "Delete Role Failed",
          message:
            apiResponse?.error?.message ??
            error.message ??
            "Unable to delete admin role. Please try again.",
          color: "red",
        });
      },
    }
  );

  const handleDeleteConfirm = () => {
    if (!roleId || deleteRoleMutation.isPending) return;
    deleteRoleMutation.mutate(roleId);
  };

  return (
    <>
      <Card radius="lg" p="xl">
        <Stack gap="xl">
          {/* Header */}
          <Group justify="space-between" align="flex-start">
            <Stack gap={4}>
              {isLoading ? (
                <Skeleton height={24} width={260} />
              ) : (
                <Text fw={600} size="lg">
                  {role?.name ?? "—"}
                </Text>
              )}

              <Group gap="sm">
                <Text size="xs" c="dimmed">
                  <b>Date Created:</b> {formatDateTime(role?.createdAt)}
                </Text>
                <StatusBadge status={status} />
              </Group>
            </Stack>

            {/* Take Action */}
            <Menu position="bottom-end" radius="md">
              <Menu.Target>
                <Button color="orange" radius="xl">
                  Take Action
                </Button>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item onClick={() => setEditOpen(true)}>Edit</Menu.Item>

                <Menu.Item onClick={() => setConfirmOpen(true)}>
                  {actionVerb}
                </Menu.Item>
                <Menu.Item color="red" onClick={() => setDeleteConfirmOpen(true)}>
                  Delete
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>

          {/* Role Details */}
          <Text fw={600} c="orange" size="sm">
            Role Details
          </Text>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-y-6 gap-x-12">
            <DetailItem label="Permissions" value={String(permissionCount)} loading={isLoading} />
            <DetailItem label="Users" value={String(role?._count?.users ?? 0)} loading={isLoading} />
            <DetailItem label="Branch" value={role?.branch ?? "—"} loading={isLoading} />
            <DetailItem label="Department" value={role?.departmentId ?? "—"} loading={isLoading} />
            <div>
              <Text size="xs" c="dimmed" mb={4}>
                Set As Default Role
              </Text>
              <div className=" flex items-center gap-2">
                {isLoading ? (
                  <Skeleton height={24} width={120} />
                ) : (
                  <>
                    <Switch checked={Boolean(role?.isDefault)} readOnly color="orange" />
                    <Text size="sm" fw={500}>
                      {role?.isDefault ? "On" : "Off"}
                    </Text>
                  </>
                )}
              </div>
            </div>
            <DetailItem label="Role ID" value={role?.id ?? "—"} loading={isLoading} />
            <DetailItem
              label="Description"
              value={role?.description ?? "—"}
              loading={isLoading}
            />
          </div>

          {/* Permissions */}
          <Text fw={600} c="orange" size="sm">
            Permissions
          </Text>

          {isLoading ? (
            <Skeleton height={120} radius="md" />
          ) : permissionCount === 0 ? (
            <EmptySection
              format="compact"
              title="No Applicable Permissions"
              description="This role currently has no permissions assigned."
            />
          ) : (
            <Accordion radius="md" variant="separated">
              {Object.entries(permissionsData).map(([moduleKey, scopes]) => {
                const moduleChecked = Object.values(scopes ?? {}).some(
                  (actions) => Array.isArray(actions) && actions.length > 0
                );

                return (
                  <Accordion.Item key={moduleKey} value={moduleKey}>
                    <Accordion.Control
                      icon={<Checkbox variant="outline" checked={moduleChecked} readOnly color="orange" />}
                      chevron={<ChevronDown size={18} />}
                    >
                      <Text size="sm" fw={500}>
                        {moduleKey}
                      </Text>
                    </Accordion.Control>

                    <Accordion.Panel>
                      <Stack gap="xs" ml="lg">
                        {Object.entries(scopes ?? {}).map(([scopeKey, actions]) => (
                          <Group
                            key={`${moduleKey}-${scopeKey}`}
                            justify="space-between"
                            py="sm"
                            className="border-b border-[#E1E0E0]"
                          >
                            <Text size="sm">{scopeKey}</Text>
                            <Group gap="xl">
                              {(Array.isArray(actions) ? actions : []).map((action) => (
                                <Checkbox
                                  key={`${moduleKey}-${scopeKey}-${action}`}
                                  labelPosition="left"
                                  variant="outline"
                                  radius="xl"
                                  label={normalizeAction(action)}
                                  checked
                                  readOnly
                                />
                              ))}
                            </Group>
                          </Group>
                        ))}
                      </Stack>
                    </Accordion.Panel>
                  </Accordion.Item>
                );
              })}
            </Accordion>
          )}
        </Stack>
      </Card>

      {/* Confirm Modal */}
      <ConfirmationModal
        opened={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={`${actionVerb} Role ?`}
        message={`Are you sure you want to ${actionVerb.toLowerCase()} this role?`}
        primaryButtonText={`Yes, ${actionVerb} Role`}
        secondaryButtonText="No, Close"
        onPrimary={handleConfirm}
      />

      {/* Success Modal */}
      <SuccessModal
        opened={successOpen}
        onClose={() => setSuccessOpen(false)}
        title={`Role ${pastTenseVerb}`}
        message={`Role has been successfully ${pastTenseVerb.toLowerCase()}.`}
        primaryButtonText="Manage Roles"
        onPrimaryClick={() => router.push(adminRoutes.adminUserManagement())}
        secondaryButtonText="No, Close"
      />

      {/* Delete Role Confirmation Modal */}
      <ConfirmationModal
        opened={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete Admin Role ?"
        message="Are you sure, Delete this admin role ? Kindly note that this action is irreversible, all admin users under this role would be reassigned to the default admin role"
        primaryButtonText="Yes, Delete Admin Role"
        secondaryButtonText="No, Close"
        onPrimary={handleDeleteConfirm}
        loading={deleteRoleMutation.isPending}
      />

      {/* Delete Role Success Modal */}
      <SuccessModal
        opened={deleteSuccessOpen}
        onClose={() => setDeleteSuccessOpen(false)}
        title="Admin Role Deleted"
        message="Admin role has been successfully deleted."
        primaryButtonText="Manage User"
        onPrimaryClick={() => router.push(adminRoutes.adminUserManagement())}
        secondaryButtonText="No, Close"
      />

      {roleId ? (
        <EditRoleModal
          opened={editOpen}
          onClose={() => setEditOpen(false)}
          roleId={roleId}
          role={role}
        />
      ) : null}
    </>
  );
}

/* --------------------------------------------
 Reusable Detail Item
--------------------------------------------- */
function DetailItem({
  label,
  value,
  loading = false,
}: {
  label: string;
  value: string;
  loading?: boolean;
}) {
  return (
    <div>
      <Text size="xs" c="dimmed" mb={4}>
        {label}
      </Text>
      {loading ? <Skeleton height={16} width={140} /> : <Text size="sm" fw={500}>{value}</Text>}
    </div>
  );
}
