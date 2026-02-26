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

interface CreateRoleModalProps {
  opened: boolean;
  onClose: () => void;
  onSave?: (data: unknown) => void;
}

export function CreateRoleModal({
  opened,
  onClose,
  onSave,
}: CreateRoleModalProps) {
  const [step, setStep] = useState<"details" | "permissions">("details");
  const [isDefault, setIsDefault] = useState(false);
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

  const modules = [
    "Transaction Management",
    "Customer Management",
    "Outlet Management",
    "Settlement",
    "Workflow",
  ];
  const subFeatures = [
    "Sub-Feature 01",
    "Sub-Feature 02",
    "Sub-Feature 03",
    "Sub-Feature 04",
    "Sub-Feature 05",
  ];

  const [moduleEnabled, setModuleEnabled] = useState<Record<string, boolean>>(
    Object.fromEntries(modules.map((moduleName) => [moduleName, false]))
  );
  const [permissions, setPermissions] = useState<
    Record<string, Record<string, { canView: boolean; canEdit: boolean }>>
  >(
    Object.fromEntries(
      modules.map((moduleName) => [
        moduleName,
        Object.fromEntries(
          subFeatures.map((feature) => [
            feature,
            { canView: false, canEdit: false },
          ])
        ),
      ])
    )
  );

  const resetAll = () => {
    form.reset();
    setIsDefault(false);
    setStep("details");
    setModuleEnabled(Object.fromEntries(modules.map((moduleName) => [moduleName, false])));
    setPermissions(
      Object.fromEntries(
        modules.map((moduleName) => [
          moduleName,
          Object.fromEntries(
            subFeatures.map((feature) => [
              feature,
              { canView: false, canEdit: false },
            ])
          ),
        ])
      )
    );
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

  const handleCreateRole = () => {
    onSave?.({
      ...form.values,
      isDefault,
      permissions,
      moduleEnabled,
    });
    handleClose();
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
              data={[
                "Sohcahtoa Lagos State Branch",
                "Abuja Branch",
                "Port Harcourt Branch",
              ]}
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
            {modules.map((moduleName) => (
              <Accordion.Item key={moduleName} value={moduleName}>
                <Accordion.Control>
                  <Checkbox
                    checked={moduleEnabled[moduleName]}
                    onChange={(e) => {
                      const checked = e.currentTarget?.checked ?? false;
                      setModuleEnabled((prev) => ({
                        ...prev,
                        [moduleName]: checked,
                      }));
                    }}
                    label={moduleName}
                    color="orange"
                  />
                </Accordion.Control>
                <Accordion.Panel>
                  <Stack gap={0}>
                    {subFeatures.map((feature) => (
                      <Group
                        key={feature}
                        justify="space-between"
                        py="sm"
                        className="border-b border-[#E1E0E0]"
                      >
                        <Text size="sm">{feature}</Text>

                        <Group gap="xl">
                          <Checkbox
                            labelPosition="left"
                            label="Can View"
                            color="orange"
                            checked={permissions[moduleName][feature].canView}
                            onChange={(e) => {
                              const checked = e.currentTarget?.checked ?? false;
                              setPermissions((prev) => ({
                                ...prev,
                                [moduleName]: {
                                  ...prev[moduleName],
                                  [feature]: {
                                    ...prev[moduleName][feature],
                                    canView: checked,
                                  },
                                },
                              }));
                            }}
                          />
                          <Checkbox
                            labelPosition="left"
                            label="Can edit"
                            color="orange"
                            checked={permissions[moduleName][feature].canEdit}
                            onChange={(e) => {
                              const checked = e.currentTarget?.checked ?? false;
                              setPermissions((prev) => ({
                                ...prev,
                                [moduleName]: {
                                  ...prev[moduleName],
                                  [feature]: {
                                    ...prev[moduleName][feature],
                                    canEdit: checked,
                                  },
                                },
                              }));
                            }}
                          />
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
        <Button variant="outline" radius="xl" onClick={handleClose}>
          Close
        </Button>

        <Button
          color="orange"
          radius="xl"
          onClick={step === "details" ? goToPermissions : handleCreateRole}
        >
          Continue
        </Button>
      </Group>
    </Modal>
  );
}
