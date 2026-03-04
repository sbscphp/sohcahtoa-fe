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
import { useState } from "react";
import { X } from "lucide-react";
import { useForm } from "@mantine/form";
import { useManagementLookups } from "../../hooks/useManagementLookups";
import { useCreateData } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import {
  adminApi,
  type CreateRolePayload,
} from "@/app/admin/_services/admin-api";
import { notifications } from "@mantine/notifications";
import type { ApiError, ApiResponse } from "@/app/_lib/api/client";
import { useQueryClient } from "@tanstack/react-query";

interface CreateRoleModalProps {
  opened: boolean;
  onClose: () => void;
}

export function CreateRoleModal({
  opened,
  onClose,
}: CreateRoleModalProps) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<"details" | "permissions">("details");
  const [isDefault, setIsDefault] = useState(false);
  const { options: branchOptions, isLoading: branchesLoading } =
    useManagementLookups("branch", "name");
  const { options: departmentOptions, isLoading: departmentsLoading } =
    useManagementLookups("department");

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

  const PERMISSION_ACTIONS = ["can.view", "can.create", "can.edit", "can.delete"] as const;
  type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

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

  const createInitialPermissions = () =>
    Object.fromEntries(
      roleModules.map((module) => [
        module.key,
        Object.fromEntries(
          module.scopes.map((scope) => [
            scope,
            Object.fromEntries(
              PERMISSION_ACTIONS.map((action) => [action, false])
            ) as Record<PermissionAction, boolean>,
          ])
        ),
      ])
    ) as Record<
      (typeof roleModules)[number]["key"],
      Record<string, Record<PermissionAction, boolean>>
    >;

  const [permissions, setPermissions] = useState(createInitialPermissions);

  const actionLabelMap: Record<PermissionAction, string> = {
    "can.view": "Can View",
    "can.create": "Can Create",
    "can.edit": "Can Edit",
    "can.delete": "Can Delete",
  };

  const resetAll = () => {
    form.reset();
    setIsDefault(false);
    setStep("details");
    setPermissions(createInitialPermissions());
  };

  const handleClose = () => {
    resetAll();
    onClose();
  };

  const goToPermissions = () => {
    const validation = form.validate();
    if (validation.hasErrors) return;
    setStep("permissions");
  };

  const isModuleChecked = (moduleKey: ModuleKey, scopes: readonly string[]) =>
    scopes.every((scope) =>
      PERMISSION_ACTIONS.every((action) => permissions[moduleKey][scope][action])
    );

  const isModuleIndeterminate = (moduleKey: ModuleKey, scopes: readonly string[]) => {
    const values = scopes.flatMap((scope) =>
      PERMISSION_ACTIONS.map((action) => permissions[moduleKey][scope][action])
    );
    return values.some(Boolean) && !values.every(Boolean);
  };

  const toggleModule = (moduleKey: ModuleKey, scopes: readonly string[], checked: boolean) => {
    setPermissions((prev) => ({
      ...prev,
      [moduleKey]: Object.fromEntries(
        scopes.map((scope) => [
          scope,
          Object.fromEntries(
            PERMISSION_ACTIONS.map((action) => [action, checked])
          ) as Record<PermissionAction, boolean>,
        ])
      ),
    }));
  };

  const createRoleMutation = useCreateData(adminApi.management.roles.create, {
    onSuccess: async () => {
      notifications.show({
        title: "Role Created",
        message: "Role has been created successfully.",
        color: "green",
      });
      handleClose();
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [...adminKeys.management.roles.all()],
        }),
        queryClient.invalidateQueries({
          queryKey: [...adminKeys.management.roles.stats()],
        }),
      ]);
    },
    onError: (error) => {
      const apiResponse = (error as unknown as ApiError).data as ApiResponse;
      notifications.show({
        title: "Create Role Failed",
        message:
          apiResponse?.error?.message ??
          error.message ??
          "Unable to create role. Please try again.",
        color: "red",
      });
    },
  });

  const handleCreateRole = () => {
    const validation = form.validate();
    if (validation.hasErrors) {
      setStep("details");
      return;
    }

    const departmentName =
      departmentOptions.find((option) => option.value === form.values.departmentId)
        ?.label ?? "";

    if (!departmentName) {
      form.setFieldError("departmentId", "Department is required");
      setStep("details");
      return;
    }

    const permissionsPayload = Object.fromEntries(
      roleModules
        .map((module) => {
          const scopePayload = Object.fromEntries(
            module.scopes
              .map((scope) => {
                const selectedActions = PERMISSION_ACTIONS.filter(
                  (action) => permissions[module.key][scope][action]
                );
                return [scope, selectedActions] as const;
              })
              .filter(([, actions]) => actions.length > 0)
          );

          return [module.key, scopePayload] as const;
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

    createRoleMutation.mutate(payload);
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Text className="text-body-heading-300! text-xl! font-bold! leading-tight!">
          Create a New Role
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
            <TextInput
              label="Role Name"
              placeholder="Role Name"
              required
              {...form.getInputProps("name")}
            />

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
                onChange={(value) =>
                  form.setFieldValue("departmentId", value ?? "")
                }
                error={form.errors.departmentId}
              />
              <Text size="xs" c="dimmed">
                A corresponding department within a branch
              </Text>
            </Stack>
          </Group>

          <div
            className={`rounded-xl border p-4 ${
              isDefault
                ? "border-[#EA580C] bg-[#FFF7ED]"
                : "border-gray-200 bg-[#F9FAFB]"
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
                  1. If another role is deactivated, its admin user will be
                  temporarily reassigned to this role.
                </Text>
                <Text size="xs" c="dimmed">
                  2. If another role is deleted, its admin user will be
                  permanently reassigned to this role until given a new one.
                </Text>
              </Stack>
            </div>
          </div>
        </Stack>
      ) : (
        <Stack gap="md" mt="lg">
          <Accordion chevronPosition="right" radius="md" variant="separated">
            {roleModules.map((module) => (
              <Accordion.Item key={module.key} value={module.key}>
                <Accordion.Control>
                  <Checkbox
                    checked={isModuleChecked(module.key, module.scopes)}
                    indeterminate={isModuleIndeterminate(module.key, module.scopes)}
                    onChange={(e) => {
                      const checked = e.currentTarget.checked ?? false;
                      toggleModule(module.key, module.scopes, checked);
                    }}
                    label={module.label}
                    color="orange"
                  />
                </Accordion.Control>
                <Accordion.Panel>
                  <Stack gap={0}>
                    {module.scopes.map((scope) => (
                      <Group
                        key={`${module.key}-${scope}`}
                        justify="space-between"
                        py="sm"
                        className="border-b border-[#E1E0E0]"
                      >
                        <Text size="sm">{scope}</Text>

                        <Group gap="xl">
                          {PERMISSION_ACTIONS.map((action) => (
                            <Checkbox
                              key={`${module.key}-${scope}-${action}`}
                              labelPosition="left"
                              label={actionLabelMap[action]}
                              color="orange"
                              checked={permissions[module.key][scope][action]}
                              onChange={(e) => {
                                const checked = e.currentTarget.checked ?? false;
                                setPermissions((prev) => ({
                                  ...prev,
                                  [module.key]: {
                                    ...prev[module.key],
                                    [scope]: {
                                      ...prev[module.key][scope],
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
        <Button
          variant="outline"
          radius="xl"
          onClick={handleClose}
          disabled={createRoleMutation.isPending}
        >
          Close
        </Button>

        <Button
          color="orange"
          radius="xl"
          onClick={step === "details" ? goToPermissions : handleCreateRole}
          loading={step === "permissions" ? createRoleMutation.isPending : false}
        >
          {step === "details" ? "Continue" : "Create Role"}
        </Button>
      </Group>
    </Modal>
  );
}
