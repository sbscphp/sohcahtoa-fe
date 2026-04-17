"use client";

import { Modal, Text, Button, Stack } from "@mantine/core";

export function CreateAdminRoleModal({
  opened,
  onClose,
  onConfirm,
  loading, // Added loading prop
}: {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}) {
  return (
    <Modal opened={opened} onClose={onClose} centered withCloseButton={false} radius="md" padding="xl">
      <Stack align="center" gap="md">
        <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-2xl font-bold">
          !
        </div>

        <Text fw={600} size="lg">Create an Admin User?</Text>

        <Text size="sm" c="dimmed" ta="center">
          Are you sure you want to create this Admin user within the system with the 
          selected role and permissions?
        </Text>

        <Button 
          color="orange" 
          radius="xl" 
          fullWidth 
          onClick={onConfirm}
          loading={loading} 
        >
          Yes, Create
        </Button>

        <Button 
          variant="outline" 
          radius="xl" 
          fullWidth 
          onClick={onClose}
          disabled={loading} 
        >
          No, Close
        </Button>
      </Stack>
    </Modal>
  );
}