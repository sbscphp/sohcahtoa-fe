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
import { useDisclosure } from "@mantine/hooks"; 
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
import { CreateAdminRoleModal } from "./CreateAdminRoleModal";
import { useMemo } from "react";

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
  departmentName: "",
  position: "",
  roleName: "",
};

export function AddUserModal({ opened, onClose }: AddUserModalProps) {
  const queryClient = useQueryClient();
  const [confirmOpened, { open: openConfirm, close: closeConfirm }] = useDisclosure(false);

  const { options: roleOptions, isLoading: rolesLoading } = useManagementLookups("role");
  const { options: departmentOptions, isLoading: departmentsLoading } = useManagementLookups("department");
  const { options: branchOptions, isLoading: branchesLoading } = useManagementLookups("branch", "name");
  const departments = useMemo(() => departmentOptions.map((option) => option.label), [departmentOptions]);
  const roles = useMemo(() => roleOptions.map((option) => option.label), [roleOptions]);

  const form = useForm({
    initialValues,
    validate: {
      fullName: (value) => (value.trim().length ? null : "Full Name is required"),
      email: (value) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
          ? null
          : "Valid email is required",
      
      // UPDATED VALIDATION: Strictly +234 followed by 10 digits
      phoneNumber: (value) =>
        /^\+234\d{10}$/.test(value.trim())
          ? null
          : "Phone number must be in +234 format (e.g., +2348031234567)",
          
      // Optional field validation
      altPhoneNumber: (value) =>
        !value || /^\+234\d{10}$/.test(value.trim())
          ? null
          : "Phone number must be in +234 format",

      branch: (value) => (value ? null : "Branch is required"),
      departmentName: (value) => (value ? null : "Department is required"),
      roleName: (value) => (value ? null : "Admin Role is required"),
    },
  });
   const handlePhoneKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedChars = /[0-9+]/;
    if (!allowedChars.test(e.key) && e.key !== "Backspace" && e.key !== "Tab") {
      e.preventDefault();
    }
  };

  const createUserMutation = useCreateData(adminApi.management.users.create, {
    onSuccess: async () => {
      notifications.show({
        title: "User Created",
        message: "Admin user has been created successfully.",
        color: "green",
      });
      form.reset();
      closeConfirm(); // Close the confirmation modal
      onClose(); // Close the main modal
      await queryClient.invalidateQueries({
        queryKey: [...adminKeys.management.users.all()],
      });
    },
    onError: (error) => {
      const apiResponse = (error as unknown as ApiError).data as ApiResponse;
      notifications.show({
        title: "Create User Failed",
        message: apiResponse?.error?.message ?? error.message ?? "Unable to create admin user.",
        color: "red",
      });
      closeConfirm(); // Close confirmation so user can edit form if needed
    },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  // This function is triggered by the main "Add User" button
  const handleInitialSubmit = () => {
    openConfirm();
  };

  // This function is triggered by the "Yes, Create" button in the confirmation modal
  const handleFinalConfirm = () => {
    const values = form.values;
    const payload: CreateAdminUserPayload = {
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      phoneNumber: values.phoneNumber.trim(),
      altPhoneNumber: values.altPhoneNumber.trim() || null,
      position: values.position.trim() || null,
      branch: values.branch,
      department: values.departmentName,
      role: values.roleName,
    };
    createUserMutation.mutate(payload);
  };

  return (
    <>
      <Modal
        opened={opened}
        onClose={handleClose}
        centered
        size="xl"
        radius="md"
        title={<Text fw={700} size="xl">Add a New User</Text>}
        closeButtonProps={{
          icon: <X size={20} className="bg-[#e69fb6]! text-pink-500! rounded-full! p-1!" />,
        }}
      >
        <Divider my="xs" />

        <form onSubmit={form.onSubmit(handleInitialSubmit)}>
          <Stack gap="md" mt="lg">
            <Group grow>
              <TextInput label="Full Name" placeholder="Enter Full Name" required {...form.getInputProps("fullName")} />
              <TextInput label="Email Address" placeholder="example@email.com" required {...form.getInputProps("email")} />
            </Group>

            <Group grow>
              <TextInput
                label="Phone Number 1"
                placeholder="+234"
                required
                type="tel" // Changed from number to tel
                maxLength={14} // +234 (4) + 10 digits = 14
                onKeyDown={handlePhoneKeyPress}
                {...form.getInputProps("phoneNumber")}
              />

              <TextInput
                label="Phone Number 2 (optional)"
                placeholder="+234"
                type="tel" // Changed from number to tel
                maxLength={14}
                onKeyDown={handlePhoneKeyPress}
                {...form.getInputProps("altPhoneNumber")}
              />
            </Group>

            <Group grow>
              <Select label="Branch" placeholder="Select" required data={branchOptions} disabled={branchesLoading} searchable {...form.getInputProps("branch")} />
              <Stack gap={4}>
                <Select label="Department" placeholder="Select" required data={departments} disabled={departmentsLoading} searchable {...form.getInputProps("departmentName")} />
                <Text size="xs" c="dimmed">A corresponding department within a branch</Text>
              </Stack>
            </Group>

            <Stack gap={4}>
              <TextInput label="Position" placeholder="Enter position name" {...form.getInputProps("position")} />
              <Text size="xs" c="dimmed">Position user hold in the company</Text>
            </Stack>

            <Select label="Admin Role" placeholder="Search" required data={roles} disabled={rolesLoading} searchable {...form.getInputProps("roleName")} />
          </Stack>

          <Divider my="lg" />

          <Group justify="flex-end">
            <Button variant="outline" radius="xl" onClick={handleClose}>Close</Button>
            <Button type="submit" color="orange" radius="xl" disabled={!form.isValid()}>
              Add User
            </Button>
          </Group>
        </form>
      </Modal>

      {/* Confirmation Modal */}
      <CreateAdminRoleModal 
        opened={confirmOpened} 
        onClose={closeConfirm} 
        onConfirm={handleFinalConfirm}
        loading={createUserMutation.isPending} // Pass loading state
      />
    </>
  );
}