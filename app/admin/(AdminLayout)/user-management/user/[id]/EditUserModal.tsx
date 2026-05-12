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
} from "@mantine/core";
import { X } from "lucide-react";
import { useForm } from "@mantine/form";
import { usePatchData } from "@/app/_lib/api/hooks";
import {
  adminApi,
  type UpdateAdminUserPayload,
} from "@/app/admin/_services/admin-api";
import { notifications } from "@mantine/notifications";
import type { ApiError, ApiResponse } from "@/app/_lib/api/client";
import { useQueryClient } from "@tanstack/react-query";
import { adminKeys } from "@/app/_lib/api/query-keys";
import { useManagementLookups } from "../../hooks/useManagementLookups";
import { useMemo } from "react";

interface EditUserModalProps {
  opened: boolean;
  onClose: () => void;
  userId?: string;
  user: {
    fullName: string;
    email: string;
    phoneNumber?: string;
    altPhoneNumber?: string;
    position?: string;
    branch: string;
    departmentName?: string;
    roleName?: string;
  };
}

export function EditUserModal({
  opened,
  onClose,
  userId,
  user,
}: EditUserModalProps) {
  const queryClient = useQueryClient();
  const { options: roleOptions, isLoading: rolesLoading } =
    useManagementLookups("role");
  const { options: departmentOptions, isLoading: departmentsLoading } =
    useManagementLookups("department");
  const { options: branchOptions, isLoading: branchesLoading } =
    useManagementLookups("branch", "name");
  const departments = useMemo(
    () => departmentOptions.map((option) => option.label),
    [departmentOptions]
  );
  const roles = useMemo(
    () => roleOptions.map((option) => option.label),
    [roleOptions]
  );

  const form = useForm({
    initialValues: {
      fullName: user.fullName ?? "",
      email: user.email ?? "",
      phoneNumber: user.phoneNumber ?? "",
      altPhoneNumber: user.altPhoneNumber ?? "",
      branch: user.branch ?? "",
      departmentName: user.departmentName ?? "",
      position: user.position ?? "",
      roleName: user.roleName ?? "",
    },
    validate: {
      fullName: (value) =>
        value.trim().length ? null : "Full Name is required",
      email: (value) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
          ? null
          : "Valid email is required",
      phoneNumber: (value) =>
        value.trim().length ? null : "Phone Number 1 is required",
      branch: (value) => (value ? null : "Branch is required"),
      departmentName: (value) => (value ? null : "Department is required"),
      roleName: (value) => (value ? null : "Admin Role is required"),
    },
  });

  console.log(form.values);

  const updateUserMutation = usePatchData(
    (payload: UpdateAdminUserPayload) => adminApi.management.users.update(userId!, payload),
    {
      onSuccess: async () => {
        notifications.show({
          title: "User Updated",
          message: "Admin user has been updated successfully.",
          color: "green",
        });
        onClose();
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
          title: "Update User Failed",
          message:
            apiResponse?.error?.message ??
            error.message ??
            "Unable to update admin user. Please try again.",
          color: "red",
        });
      },
    }
  );

  const handleSubmit = (values: typeof form.values) => {
    if (!userId) return;
    const payload: UpdateAdminUserPayload = {
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      phoneNumber: values.phoneNumber.trim(),
      altPhoneNumber: values.altPhoneNumber.trim() || null,
      position: values.position.trim() || null,
      branch: values.branch,
      department: values.departmentName,
      role: values.roleName,
    };
    updateUserMutation.mutate(payload);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size="xl"
      radius="md"
      title={
        <Text className="text-body-heading-300! text-xl! font-bold! leading-tight!">
          Edit User Details
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
    >
      <Divider my="xs" />

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md" mt="lg">
          <Group grow>
            <TextInput
              label="Full Name"
              placeholder="Enter Full Name"
              required
              {...form.getInputProps("fullName")}
            />

            <TextInput
              label="Email Address"
              placeholder="example@email.com"
              required
              {...form.getInputProps("email")}
            />
          </Group>

          <Group grow>
            <TextInput
              label="Phone Number 1"
              placeholder="+234 00 0000 0000"
              required
              {...form.getInputProps("phoneNumber")}
            />

            <TextInput
              label="Phone Number 2 (optional)"
              placeholder="+234 00 0000 0000"
              {...form.getInputProps("altPhoneNumber")}
            />
          </Group>

          <Group grow>
            <Select
              label="Branch"
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
                label="Department"
                placeholder="Select an Option"
                required
                data={departments}
                disabled={departmentsLoading}
                searchable
                {...form.getInputProps("departmentName")}
              />
              <Text size="xs" c="dimmed">
                A corresponding department within a branch
              </Text>
            </Stack>
          </Group>

          <Stack gap={4}>
            <TextInput
              label="Position"
              placeholder="Enter position name"
              {...form.getInputProps("position")}
            />
            <Text size="xs" c="dimmed">
              Position user hold in the company
            </Text>
          </Stack>

          <Select
            label="Admin Role"
            placeholder="Search or select option"
            required
            data={roles}
            disabled={rolesLoading}
            searchable
            {...form.getInputProps("roleName")}
          />
        </Stack>

        <Divider my="lg" />

        <Group justify="flex-end">
          <Button
            variant="outline"
            radius="xl"
            onClick={onClose}
            disabled={updateUserMutation.isPending}
          >
            Close
          </Button>

          <Button
            type="submit"
            color="orange"
            radius="xl"
            disabled={!form.isValid() || !userId}
            loading={updateUserMutation.isPending}
          >
            Save Changes
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
