"use client";

import {
  Modal,
  Text,
  TextInput,
  Select,
  Group,
  Stack,
  Divider,
  Button,
  Switch,
  Checkbox,
  Accordion,
} from "@mantine/core";
import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { useForm } from "@mantine/form";
import { useManagementLookups } from "../../hooks/useManagementLookups";
import { usePutData } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import {
  adminApi,
  type AdminRoleDetails,
  type CreateRolePayload,
} from "@/app/admin/_services/admin-api";
import { notifications } from "@mantine/notifications";
import type { ApiError, ApiResponse } from "@/app/_lib/api/client";
import { useQueryClient } from "@tanstack/react-query";
import { ConfirmationModal } from "@/app/admin/_components/ConfirmationModal";
import { SuccessModal } from "@/app/admin/_components/SuccessModal";
import { useRouter } from "next/navigation";
import { adminRoutes } from "@/lib/adminRoutes";

interface EditRoleModalProps {
  opened: boolean;
  roleId: string;
  role: AdminRoleDetails | null;
  onClose: () => void;
}

const PERMISSION_ACTIONS = ["can.view", "can.create", "can.edit", "can.delete"] as const;
type PermissionAction = (typeof PERMISSION_ACTIONS)[number];
type RolePermissionScope = "MODULE" | "ROLES" | "USERS";

const roleModules = [
  { key: "TRANSACTIONS", label: "Transactions", scopes: ["MODULE"] },
  { key: "CUSTOMERS", label: "Customers", scopes: ["MODULE"] },
  { key: "AGENTS", label: "Agents", scopes: ["MODULE"] },
  { key: "SETTLEMENTS", label: "Settlements", scopes: ["MODULE"] },
  { key: "RATES", label: "Rates", scopes: ["MODULE"] },
  { key: "USER_MANAGEMENT", label: "User Management", scopes: ["ROLES", "USERS"] },
  { key: "WORKFLOW", label: "Workflow", scopes: ["MODULE"] },
  { key: "COMPLIANCE", label: "Compliance", scopes: ["MODULE"] },
  { key: "REPORTS", label: "Reports", scopes: ["MODULE"] },
  { key: "AUDIT", label: "Audit", scopes: ["MODULE"] },
] as const;

type ModuleKey = (typeof roleModules)[number]["key"];
type PermissionState = Record<ModuleKey, Record<RolePermissionScope, Record<PermissionAction, boolean>>>;

const createInitialPermissions = (): PermissionState =>
  Object.fromEntries(
    roleModules.map((roleModule) => [
      roleModule.key,
      Object.fromEntries(
        roleModule.scopes.map((scope) => [
          scope,
          Object.fromEntries(PERMISSION_ACTIONS.map((action) => [action, false])) as Record<
            PermissionAction,
            boolean
          >,
        ])
      ),
    ])
  ) as PermissionState;

const actionLabelMap: Record<PermissionAction, string> = {
  "can.view": "Can View",
  "can.create": "Can Create",
  "can.edit": "Can Edit",
  "can.delete": "Can Delete",
};

const normalizeAction = (action: string): PermissionAction | null => {
  const raw = action.trim().toLowerCase();
  const withPrefix = raw.startsWith("can.") ? raw : `can.${raw}`;
  return PERMISSION_ACTIONS.includes(withPrefix as PermissionAction)
    ? (withPrefix as PermissionAction)
    : null;
};

export function EditRoleModal({ opened, roleId, role, onClose }: EditRoleModalProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<"details" | "permissions">("details");
  const [isDefault, setIsDefault] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<CreateRolePayload | null>(null);
  const [permissions, setPermissions] = useState<PermissionState>(createInitialPermissions);

  const { options: branchOptions, isLoading: branchesLoading } = useManagementLookups("branch", "name");
  const { options: departmentOptions, isLoading: departmentsLoading } = useManagementLookups("department");

  const form = useForm({
    initialValues: {
      name: "",
      description: "",
      branch: "",
      departmentId: "",
    },
    validate: {
      name: (value) => (value.trim().length ? null : "Role Name is required"),
      description: (value) => {
        const trimmed = value.trim();
        if (!trimmed.length) return "Description is required";
        if (trimmed.length > 32) return "Description must not exceed 32 characters";
        return null;
      },
      branch: (value) => (value ? null : "Branch is required"),
      departmentId: (value) => (value ? null : "Department is required"),
    },
  });

  const hydratedPermissions = useMemo(() => {
    const next = createInitialPermissions();
    if (!role) return next;

    for (const roleModule of roleModules) {
      const incomingScopes = role.permissions?.[roleModule.key] ?? {};
      for (const scope of roleModule.scopes) {
        const incomingActions = Array.isArray(incomingScopes?.[scope]) ? incomingScopes[scope] : [];
        for (const incomingAction of incomingActions) {
          const normalized = normalizeAction(incomingAction);
          if (normalized) {
            next[roleModule.key][scope][normalized] = true;
          }
        }
      }
    }

    return next;
  }, [role]);

  useEffect(() => {
    if (!opened || !role) return;
    form.setValues({
      name: role.name ?? "",
      description: role.description ?? "",
      branch: role.branch ?? "",
      departmentId: role.departmentId ?? "",
    });
    form.clearErrors();
    const frameId = window.requestAnimationFrame(() => {
      setIsDefault(Boolean(role.isDefault));
      setStep("details");
      setIsConfirmOpen(false);
      setPendingPayload(null);
      setPermissions(hydratedPermissions);
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [opened, role, hydratedPermissions]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = () => {
    setIsConfirmOpen(false);
    setPendingPayload(null);
    setStep("details");
    onClose();
  };

  const isModuleChecked = (moduleKey: ModuleKey, scopes: readonly RolePermissionScope[]) =>
    scopes.every((scope) =>
      PERMISSION_ACTIONS.every((action) => permissions[moduleKey][scope][action])
    );

  const isModuleIndeterminate = (moduleKey: ModuleKey, scopes: readonly RolePermissionScope[]) => {
    const values = scopes.flatMap((scope) =>
      PERMISSION_ACTIONS.map((action) => permissions[moduleKey][scope][action])
    );
    return values.some(Boolean) && !values.every(Boolean);
  };

  const toggleModule = (
    moduleKey: ModuleKey,
    scopes: readonly RolePermissionScope[],
    checked: boolean
  ) => {
    setPermissions((prev) => ({
      ...prev,
      [moduleKey]: Object.fromEntries(
        scopes.map((scope) => [
          scope,
          Object.fromEntries(PERMISSION_ACTIONS.map((action) => [action, checked])) as Record<
            PermissionAction,
            boolean
          >,
        ])
      ) as PermissionState[ModuleKey],
    }));
  };

  const updateRoleMutation = usePutData(
    (payload: CreateRolePayload) => adminApi.management.roles.update(roleId, payload),
    {
      onSuccess: async () => {
        setIsConfirmOpen(false);
        setIsSuccessOpen(true);
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: [...adminKeys.management.roles.all()] }),
          queryClient.invalidateQueries({ queryKey: [...adminKeys.management.roles.stats()] }),
          queryClient.invalidateQueries({
            queryKey: [...adminKeys.management.roles.detail(roleId)],
          }),
        ]);
      },
      onError: (error) => {
        const apiResponse = (error as unknown as ApiError).data as ApiResponse;
        notifications.show({
          title: "Update Role Failed",
          message:
            apiResponse?.error?.message ??
            error.message ??
            "Unable to update role. Please try again.",
          color: "red",
        });
      },
    }
  );

  const goToPermissions = () => {
    const validation = form.validate();
    if (validation.hasErrors) return;
    setStep("permissions");
  };

  const handlePrepareSave = () => {
    const validation = form.validate();
    if (validation.hasErrors) {
      setStep("details");
      return;
    }

    const departmentName =
      departmentOptions.find((option) => option.value === form.values.departmentId)?.label ?? "";

    if (!departmentName) {
      form.setFieldError("departmentId", "Department is required");
      setStep("details");
      return;
    }

    const permissionsPayload = Object.fromEntries(
      roleModules
        .map((roleModule) => {
          const scopePayload = Object.fromEntries(
            roleModule.scopes
              .map((scope) => {
                const selectedActions = PERMISSION_ACTIONS.filter(
                  (action) => permissions[roleModule.key][scope][action]
                );
                return [scope, selectedActions] as const;
              })
              .filter(([, actions]) => actions.length > 0)
          );

          return [roleModule.key, scopePayload] as const;
        })
        .filter(([, scopePayload]) => Object.keys(scopePayload).length > 0)
    );

    const payload: CreateRolePayload = {
      name: form.values.name.trim(),
      description: form.values.description.trim(),
      branch: form.values.branch,
      department: departmentName,
      isDefault,
      permissions: permissionsPayload,
    };

    setPendingPayload(payload);
    setIsConfirmOpen(true);
  };

  const handleConfirmSave = () => {
    if (!pendingPayload || updateRoleMutation.isPending) return;
    updateRoleMutation.mutate(pendingPayload);
  };

  return (
    <>
      <Modal
        opened={opened}
        onClose={handleClose}
        title={
          <Text className="text-body-heading-300! text-xl! font-bold! leading-tight!">
            Edit Role
          </Text>
        }
        closeButtonProps={{
          icon: (
            <X
              size={20}
              className="bg-[#e69fb6]! text-pink-500! font-bold! rounded-full! p-1! hover:bg-[#e69fb6]/80! transition-all! duration-300!"
            />
          ),
        }}
        radius="md"
        size="xl"
        centered
      >
        <Divider my="xs" />

        {step === "details" ? (
          <Stack gap="md" mt="lg">
            <Group grow>
              <TextInput label="Role Name" placeholder="Role Name" required {...form.getInputProps("name")} />

              <Stack gap={4}>
                <TextInput
                  label="Description"
                  placeholder="Short description of role"
                  required
                  {...form.getInputProps("description")}
                />
                <Text size="xs" c="dimmed">
                  Not more than 32 character counts
                </Text>
              </Stack>
            </Group>

            <Group grow>
              <Select
                label="Branch Applicable"
                placeholder="Select an Option"
                required
                data={branchOptions}
                disabled={branchesLoading}
                searchable
                value={form.values.branch}
                onChange={(value) => form.setFieldValue("branch", value ?? "")}
                error={form.errors.branch}
              />

              <Stack gap={4}>
                <Select
                  label="Department Applicable"
                  placeholder="Select an Option"
                  required
                  data={departmentOptions}
                  disabled={departmentsLoading}
                  searchable
                  value={form.values.departmentId}
                  onChange={(value) => form.setFieldValue("departmentId", value ?? "")}
                  error={form.errors.departmentId}
                />
                <Text size="xs" c="dimmed">
                  A corresponding department within a branch
                </Text>
              </Stack>
            </Group>

            <div
              className={`rounded-xl border p-4 ${
                isDefault ? "border-[#EA580C] bg-[#FFF7ED]" : "border-gray-200 bg-[#F9FAFB]"
              }`}
            >
              <div className="flex gap-2">
                <Switch
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.currentTarget.checked)}
                  color="orange"
                />

                <Stack gap={6}>
                  <Text fw={600} size="sm">
                    Set Role as Default
                  </Text>

                  <Text size="xs" c="dimmed">
                    1. If another role is deactivated, its admin user will be temporarily reassigned
                    to this role.
                  </Text>
                  <Text size="xs" c="dimmed">
                    2. If another role is deleted, its admin user will be permanently reassigned to
                    this role until given a new one.
                  </Text>
                </Stack>
              </div>
            </div>
          </Stack>
        ) : (
          <Stack gap="md" mt="lg">
            <Accordion chevronPosition="right" radius="md" variant="separated">
              {roleModules.map((roleModule) => (
                <Accordion.Item key={roleModule.key} value={roleModule.key}>
                  <Accordion.Control>
                    <Checkbox
                      checked={isModuleChecked(roleModule.key, roleModule.scopes)}
                      indeterminate={isModuleIndeterminate(roleModule.key, roleModule.scopes)}
                      onChange={(e) => toggleModule(roleModule.key, roleModule.scopes, e.currentTarget.checked)}
                      label={roleModule.label}
                      color="orange"
                    />
                  </Accordion.Control>
                  <Accordion.Panel>
                    <Stack gap={0}>
                      {roleModule.scopes.map((scope) => (
                        <Group
                          key={`${roleModule.key}-${scope}`}
                          justify="space-between"
                          py="sm"
                          className="border-b border-[#E1E0E0]"
                        >
                          <Text size="sm">{scope}</Text>

                          <Group gap="xl">
                            {PERMISSION_ACTIONS.map((action) => (
                              <Checkbox
                                key={`${roleModule.key}-${scope}-${action}`}
                                labelPosition="left"
                                label={actionLabelMap[action]}
                                color="orange"
                                checked={permissions[roleModule.key][scope][action]}
                                onChange={(e) => {
                                  const checked = e.currentTarget?.checked ?? false;
                                  setPermissions((prev) => ({
                                    ...prev,
                                    [roleModule.key]: {
                                      ...prev[roleModule.key],
                                      [scope]: {
                                        ...prev[roleModule.key][scope],
                                        [action]: checked,
                                      },
                                    },
                                  }));
                                }}
                              />
                            ))}
                          </Group>
                        </Group>
                      ))}
                    </Stack>
                  </Accordion.Panel>
                </Accordion.Item>
              ))}
            </Accordion>
          </Stack>
        )}

        <Divider my="lg" />

        <Group justify="flex-end">
          <Button variant="outline" radius="xl" onClick={handleClose} disabled={updateRoleMutation.isPending}>
            Close
          </Button>

          <Button
            color="orange"
            radius="xl"
            onClick={step === "details" ? goToPermissions : handlePrepareSave}
            loading={step === "permissions" ? updateRoleMutation.isPending : false}
          >
            {step === "details" ? "Continue" : "Save Changes"}
          </Button>
        </Group>
      </Modal>

      <ConfirmationModal
        opened={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Save Changes ?"
        message="Are you sure, save and update this changes? Kindly note that this new changes would override the existing data."
        primaryButtonText="Yes, Save and Update Changes"
        secondaryButtonText="No, Close"
        onPrimary={handleConfirmSave}
        loading={updateRoleMutation.isPending}
      />

      <SuccessModal
        opened={isSuccessOpen}
        onClose={() => {
          setIsSuccessOpen(false);
          handleClose();
        }}
        title="New Changes Saved"
        message="New Changes has been successfully Saved and Updated"
        primaryButtonText="Manage User"
        onPrimaryClick={() => {
          setIsSuccessOpen(false);
          handleClose();
          router.push(adminRoutes.adminUserManagement());
        }}
        secondaryButtonText="No, Close"
      />
    </>
  );
}
