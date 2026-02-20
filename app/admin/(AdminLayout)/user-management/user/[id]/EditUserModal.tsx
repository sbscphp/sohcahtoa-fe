"use client";

import { ConfirmationModal } from "@/app/admin/_components/ConfirmationModal";
import { SuccessModal } from "@/app/admin/_components/SuccessModal";
import {
  Modal,
  Text,
  Group,
  TextInput,
  Select,
  Button,
  Stack,
  Divider,
  Badge,
} from "@mantine/core";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface EditUserModalProps {
  opened: boolean;
  onClose: () => void;
  onSave: (values: any) => void;
  user: {
    fullName: string;
    email: string;
    branch: string;
    department: string;
    role: string;
  };
}

export function EditUserModal({
  opened,
  onClose,
  user,
}: EditUserModalProps) {
    const router = useRouter();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const handleClick = () => {
    setIsConfirmOpen(true);
  };
  const handleConfirm = () => {
    setIsConfirmOpen(false);
    setIsSuccessOpen(true);
  };
  const handleManageUser = () => {
    router.push("/admin/user-management");
  };
  return (
    <>
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size="lg"
      radius="md"
      withCloseButton={false}
    >
      {/* Header */}
      <Group justify="space-between" mb="xs">
        <div>
          <Text fw={600} size="lg">
            Edit User Details
          </Text>
          <Text size="sm" c="dimmed">
            View and manage user details
          </Text>
        </div>

        <Badge
          className="py-2! px-1! rounded-full"
          color="#DD4F05"
          size="xs"
          onClick={onClose}
        >
          ✕
        </Badge>
      </Group>

      <Divider my="md" />

      {/* Form */}
      <Stack gap="md">
        <Group grow>
          <TextInput
            label="Full Name"
            required
            value={user.fullName}
          />

          <TextInput
            label="Email Address"
            required
            value={user.email}
          />
        </Group>

        <Group grow>
          <Select
            label="Branch"
            required
            value={user.branch}
            data={[
              "Lagos State Branch",
              "Abuja Branch",
              "Port Harcourt Branch",
            ]}
          />
          <Group className="relative">
          <Select
            label="Department"
            required
            className="w-full relative"
            value={user.department}
            data={[
              "Audit and Internal Control",
              "Finance and Accounting",
              "Technology",
            ]}
          />
          <span className="absolute text-xs text-gray-700 top-16">A corresponding department within a branch</span>
          
          </Group>
        </Group>

        <Select
          label="Role"
          required
          value={user.role}
          data={[
            "Audit and Internal Control Role",
            "Finance Role",
            "Admin Role",
          ]}
        />
      </Stack>

      <Divider my="lg" />

      {/* Footer */}
      <Group justify="flex-end">
        <Button variant="outline" radius="xl" onClick={onClose}>
          Close
        </Button>

        <Button
          color="orange"
          radius="xl"
          onClick={handleClick}
        >
          Save Changes
        </Button>
      </Group>
    </Modal>
    <ConfirmationModal
        opened={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Save Changes?"
        message="Are you sure, save and update this changes? Kindly note that this new changes would override the existing data"
        primaryButtonText={`Yes, Save and Update Changes`}
        secondaryButtonText="No, Close"
        onPrimary={handleConfirm}
      />

      {/* Success modal */}
      <SuccessModal
        opened={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        title="New Changes Saved"
        message="New Changes has been successfully Saved and Updated"
        primaryButtonText="Manage User"
        onPrimaryClick={handleManageUser}
        secondaryButtonText="No, Close"
      />
    </>
  );
}
