"use client";

import { Modal, Text, Button, Stack } from "@mantine/core";

export function CreateAdminRoleModal({
  opened,
  onClose,
  onConfirm,
}: {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal opened={opened} onClose={onClose} centered withCloseButton={false}>
      <Stack align="center" gap="md">
        <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
          !
        </div>

        <Text fw={600}>Create an Admin Role?</Text>

        <Text size="sm" c="dimmed" ta="center">
          Are you sure you want to create an Admin role within the system with a
          specific related role and permission
        </Text>

        <Button color="orange" radius="xl" fullWidth onClick={onConfirm}>
          Yes, Create
        </Button>

        <Button variant="outline" radius="xl" fullWidth onClick={onClose}>
          No, Close
        </Button>
      </Stack>
    </Modal>
  );
}
