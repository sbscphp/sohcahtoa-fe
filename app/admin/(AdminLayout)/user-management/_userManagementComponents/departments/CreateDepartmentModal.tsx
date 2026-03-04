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
import { useState } from "react";
import { X } from "lucide-react";
import { useCreateData } from "@/app/_lib/api/hooks";
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

interface CreateDepartmentModalProps {
  opened: boolean;
  onClose: () => void;
}

export function CreateDepartmentModal({
  opened,
  onClose,
}: CreateDepartmentModalProps) {
  const queryClient = useQueryClient();
  const [isDefault, setIsDefault] = useState(false);
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
    },
    validate: {
      name: (value) =>
        value.trim().length ? null : "Department Name is required",
      branch: (value) => (value ? null : "Branch is required"),
      description: (value) =>
        value.trim().length > 32
          ? "Description must not exceed 32 characters"
          : null,
    },
  });

  const resetAll = () => {
    form.reset();
    setIsDefault(false);
  };

  const handleClose = () => {
    setIsConfirmOpen(false);
    resetAll();
    onClose();
  };

  const handleSubmit = () => {
    const validation = form.validate();
    if (validation.hasErrors) return;
    setIsConfirmOpen(true);
  };

  const handleConfirmCreate = () => {
    const payload: CreateDepartmentPayload = {
      name: form.values.name.trim(),
      departmentEmail: form.values.departmentEmail.trim() || null,
      branch: form.values.branch,
      description: form.values.description.trim() || null,
      isDefault,
    };
    createDepartmentMutation.mutate(payload);
  };

  const createDepartmentMutation = useCreateData(adminApi.management.departments.create, {
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
        title: "Create Department Failed",
        message:
          apiResponse?.error?.message ??
          error.message ??
          "Unable to create department. Please try again.",
        color: "red",
      });
    },
  });

  return (
    <>
      <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Text className="text-body-heading-300! text-xl! font-bold! leading-tight!">
          Create New Department
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
            required
            {...form.getInputProps("name")}
          />

          <TextInput
            label="Department Email Address (Optional)"
            placeholder="Department Email Address (Optional)"
            {...form.getInputProps("departmentEmail")}
          />
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
            <TextInput
              label="Short description (Optional)"
              placeholder="Short description"
              {...form.getInputProps("description")}
            />
            <Text size="xs" c="dimmed">
              Not more than 32 character counts
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
              size="md"
            />

            <Stack gap={6}>
              <Text fw={600} size="sm">
                Set Department as Default
              </Text>

              <Text size="sm" c="dimmed">
                1. If another department is deactivated, its admin user will be
                temporarily moved here
              </Text>
              <Text size="sm" c="dimmed">
                2. If another department is deleted, its admin user will be
                permanently moved here until assigned to a new department.
              </Text>
            </Stack>
          </div>
        </div>

        <Divider my="lg" />

        <Group justify="flex-end">
          <Button
            variant="outline"
            radius="xl"
            onClick={handleClose}
            disabled={createDepartmentMutation.isPending || isConfirmOpen}
          >
            No, close
          </Button>

          <Button
            color="orange"
            radius="xl"
            onClick={handleSubmit}
            disabled={createDepartmentMutation.isPending}
          >
            Save
          </Button>
        </Group>
      </Stack>
      </Modal>
      <ConfirmationModal
        opened={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Create a New Department ?"
        message="Are you sure, create a new department ? Kindly note that this department would now be available under this specific branch"
        primaryButtonText="Yes, Create Department"
        secondaryButtonText="No, Close"
        onPrimary={handleConfirmCreate}
        loading={createDepartmentMutation.isPending}
      />

      <SuccessModal
        opened={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        title="Department Created"
        message="Department has been successfully Created"
        primaryButtonText="Manage Department"
        onPrimaryClick={() => setIsSuccessOpen(false)}
      />
    </>
  );
}
