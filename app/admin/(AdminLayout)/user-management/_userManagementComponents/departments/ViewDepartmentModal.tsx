"use client";

import {
  Modal,
  Text,
  TextInput,
  Select,
  Switch,
  Stack,
  Group,
  Button,
  Divider,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { usePutData } from "@/app/_lib/api/hooks";
import {
  adminApi,
  type CreateDepartmentPayload,
} from "@/app/admin/_services/admin-api";
import { ConfirmationModal } from "@/app/admin/_components/ConfirmationModal";
import { SuccessModal } from "@/app/admin/_components/SuccessModal";
import { notifications } from "@mantine/notifications";
import type { ApiError, ApiResponse } from "@/app/_lib/api/client";
import { useQueryClient } from "@tanstack/react-query";
import { adminKeys } from "@/app/_lib/api/query-keys";
import { useManagementLookups } from "../../hooks/useManagementLookups";
import type { DepartmentItem } from "../../hooks/useDepartments";

interface ViewEditDepartmentModalProps {
  opened: boolean;
  onClose: () => void;
  mode: "view" | "edit";
  department: DepartmentItem | null;
}

export function ViewDepartmentModal({
  opened,
  onClose,
  mode,
  department,
}: ViewEditDepartmentModalProps) {
  const queryClient = useQueryClient();
  const isEdit = mode === "edit";

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const { options: branchOptions, isLoading: branchesLoading } =
    useManagementLookups("branch", "name");

  const form = useForm({
    initialValues: {
      name: "",
      departmentEmail: "",
      branch: "",
      description: "",
      isDefault: false,
    },
    validate: isEdit
      ? {
          name: (value) =>
            value.trim().length ? null : "Department Name is required",
          branch: (value) => (value ? null : "Branch is required"),
          description: (value) =>
            value.trim().length > 32
              ? "Description must not exceed 32 characters"
              : null,
        }
      : {},
  });

  // Sync form values when department or mode changes
  useEffect(() => {
    if (department) {
      form.setValues({
        name: department.name ?? "",
        departmentEmail: department.departmentEmail ?? "",
        branch: department.branch ?? "",
        description: department.description ?? "",
        isDefault: department.isDefault ?? false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [department, opened]);

  const resetAll = () => {
    form.reset();
    setIsConfirmOpen(false);
  };

  const handleClose = () => {
    resetAll();
    onClose();
  };

  const handleSubmit = () => {
    if (!isEdit) return;
    const validation = form.validate();
    if (validation.hasErrors) return;
    setIsConfirmOpen(true);
  };

  const handleConfirmUpdate = () => {
    if (!department?.id) return;
    const payload: CreateDepartmentPayload = {
      name: form.values.name.trim(),
      departmentEmail: form.values.departmentEmail.trim() || null,
      branch: form.values.branch,
      description: form.values.description.trim() || null,
      isDefault: form.values.isDefault,
    };
    updateDepartmentMutation.mutate({ id: department.id, data: payload });
  };

  const updateDepartmentMutation = usePutData(
    ({ id, data }: { id: string; data: CreateDepartmentPayload }) =>
      adminApi.management.departments.update(id, data),
    {
      onSuccess: async () => {
        setIsConfirmOpen(false);
        setIsSuccessOpen(true);
        resetAll();
        onClose();
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: [...adminKeys.management.departments.all()],
          }),
          queryClient.invalidateQueries({
            queryKey: [...adminKeys.management.departments.stats()],
          }),
        ]);
      },
      onError: (error) => {
        const apiResponse = (error as unknown as ApiError).data as ApiResponse;
        notifications.show({
          title: "Update Department Failed",
          message:
            apiResponse?.error?.message ??
            error.message ??
            "Unable to update department. Please try again.",
          color: "red",
        });
      },
    }
  );

  const titleText = isEdit ? "Edit Department" : "View Department Details";

  return (
    <>
      <Modal
        opened={opened}
        onClose={handleClose}
        title={
          <Text className="text-body-heading-300! text-xl! font-bold! leading-tight!">
            {titleText}
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

        <Stack gap="md" mt="lg">
          <Group grow>
            <TextInput
              label="Department Name"
              placeholder="Department Name"
              required={isEdit}
              readOnly={!isEdit}
              {...(isEdit ? form.getInputProps("name") : { value: form.values.name })}
            />

            <TextInput
              label="Department Email Address (Optional)"
              placeholder="Department Email Address (Optional)"
              readOnly={!isEdit}
              {...(isEdit
                ? form.getInputProps("departmentEmail")
                : { value: form.values.departmentEmail })}
            />
          </Group>

          <Group grow>
            {isEdit ? (
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
            ) : (
              <TextInput
                label="Branch Applicable"
                value={form.values.branch}
                readOnly
              />
            )}

            <Stack gap={4}>
              <TextInput
                label="Short description (Optional)"
                placeholder={isEdit ? "Short description" : ""}
                readOnly={!isEdit}
                {...(isEdit
                  ? form.getInputProps("description")
                  : { value: form.values.description })}
              />
              <Text size="xs" c="dimmed">
                Not more than 32 character counts
              </Text>
            </Stack>
          </Group>

          <div
            className={`rounded-xl border p-4 ${
              form.values.isDefault
                ? "border-[#EA580C] bg-[#FFF7ED]"
                : "border-gray-200 bg-[#F9FAFB]"
            }`}
          >
            <div className="flex gap-2">
              <Switch
                checked={form.values.isDefault}
                onChange={
                  isEdit
                    ? (e) => form.setFieldValue("isDefault", e.currentTarget.checked)
                    : undefined
                }
                readOnly={!isEdit}
                color="orange"
                size="md"
              />

              <Stack gap={6}>
                <Text fw={600} size="sm">
                  Set Department as Default
                </Text>

                <Text size="sm" c="dimmed">
                  1. If another department is deactivated, its admin user will
                  be temporarily moved here
                </Text>
                <Text size="sm" c="dimmed">
                  2. If another department is deleted, its admin user will be
                  permanently moved here until assigned to a new department.
                </Text>
              </Stack>
            </div>
          </div>

          {isEdit && (
            <>
              <Divider my="lg" />

              <Group justify="flex-end">
                <Button
                  variant="outline"
                  radius="xl"
                  onClick={handleClose}
                  disabled={updateDepartmentMutation.isPending || isConfirmOpen}
                >
                  No, close
                </Button>

                <Button
                  color="orange"
                  radius="xl"
                  onClick={handleSubmit}
                  disabled={updateDepartmentMutation.isPending}
                >
                  Save
                </Button>
              </Group>
            </>
          )}
        </Stack>
      </Modal>

      {isEdit && (
        <>
          <ConfirmationModal
            opened={isConfirmOpen}
            onClose={() => setIsConfirmOpen(false)}
            title="Update Department ?"
            message="Are you sure you want to update this department? The changes will take effect immediately."
            primaryButtonText="Yes, Update Department"
            secondaryButtonText="No, Close"
            onPrimary={handleConfirmUpdate}
            loading={updateDepartmentMutation.isPending}
          />

          <SuccessModal
            opened={isSuccessOpen}
            onClose={() => setIsSuccessOpen(false)}
            title="Department Updated"
            message="Department has been successfully updated."
            primaryButtonText="Done"
            onPrimaryClick={() => setIsSuccessOpen(false)}
          />
        </>
      )}
    </>
  );
}
