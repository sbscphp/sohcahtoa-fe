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
import { useCreateData } from "@/app/_lib/api/hooks";
import {
  adminApi,
  type CreateAdminUserPayload,
} from "@/app/admin/_services/admin-api";
import { notifications } from "@mantine/notifications";
import type { ApiError, ApiResponse } from "@/app/_lib/api/client";
import { useQueryClient } from "@tanstack/react-query";
import { adminKeys } from "@/app/_lib/api/query-keys";
import { useManagementLookups } from "../../hooks/useManagementLookups";

interface AddUserModalProps {
  opened: boolean;
  onClose: () => void;
}

const initialValues = {
  fullName: "",
  email: "",
  phoneNumber: "",
  altPhoneNumber: "",
  branch: "",
  departmentId: "",
  position: "",
  roleId: "",
};

export function AddUserModal({ opened, onClose }: AddUserModalProps) {
  const queryClient = useQueryClient();
  const { options: roleOptions, isLoading: rolesLoading } = useManagementLookups("role");
  const { options: departmentOptions, isLoading: departmentsLoading } =
    useManagementLookups("department");
  const form = useForm({
    initialValues,
    validate: {
      fullName: (value) => (value.trim().length ? null : "Full Name is required"),
      email: (value) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
          ? null
          : "Valid email is required",
      phoneNumber: (value) =>
        value.trim().length ? null : "Phone Number 1 is required",
      branch: (value) => (value ? null : "Branch is required"),
      departmentId: (value) => (value ? null : "Department is required"),
      roleId: (value) => (value ? null : "Admin Role is required"),
    },
  });

  const createUserMutation = useCreateData(adminApi.management.users.create, {
    onSuccess: async () => {
      notifications.show({
        title: "User Created",
        message: "Admin user has been created successfully.",
        color: "green",
      });
      form.reset();
      onClose();
      await queryClient.invalidateQueries({
        queryKey: [...adminKeys.management.users.all()],
      });
    },
    onError: (error) => {
      const apiResponse = (error as unknown as ApiError).data as ApiResponse;
      notifications.show({
        title: "Create User Failed",
        message:
          apiResponse?.error?.message ??
          error.message ??
          "Unable to create admin user. Please try again.",
        color: "red",
      });
    },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const handleSubmit = (values: typeof initialValues) => {
    const payload: CreateAdminUserPayload = {
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      phoneNumber: values.phoneNumber.trim(),
      altPhoneNumber: values.altPhoneNumber.trim() || null,
      position: values.position.trim() || null,
      branch: values.branch,
      departmentId: values.departmentId,
      roleId: values.roleId,
    };
    createUserMutation.mutate(payload);
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      centered
      size="xl"
      radius="md"
      title={
        <Text className="text-body-heading-300! text-xl! font-bold! leading-tight!">
          Add a New User
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
              data={[
                "Lagos Branch",
                "Abuja Branch",
                "Port Harcourt Branch",
                "Lagos State Branch",
              ]}
              value={form.values.branch}
              onChange={(value) => form.setFieldValue("branch", value ?? "")}
              error={form.errors.branch}
            />

            <Stack gap={4}>
              <Select
                label="Department"
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
          data={roleOptions}
          disabled={rolesLoading}
          searchable
            value={form.values.roleId}
            onChange={(value) => form.setFieldValue("roleId", value ?? "")}
            error={form.errors.roleId}
          />
        </Stack>

        <Divider my="lg" />

        <Group justify="flex-end">
          <Button
            variant="outline"
            radius="xl"
            onClick={handleClose}
            disabled={createUserMutation.isPending}
          >
            Close
          </Button>

          <Button
            type="submit"
            color="orange"
            radius="xl"
            disabled={!form.isValid()}
            loading={createUserMutation.isPending}
            styles={{
              root: {
                minWidth: 120,
              },
            }}
          >
            Add User
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
