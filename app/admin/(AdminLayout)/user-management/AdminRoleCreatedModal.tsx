"use client";

import { Modal, Text, Button, Stack } from "@mantine/core";

export function AdminRoleCreatedModal({
  opened,
  onClose,
}: {
  opened: boolean;
  onClose: () => void;
}) {
  return (
    <Modal opened={opened} onClose={onClose} centered withCloseButton={false}>
      <Stack align="center" gap="md">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
          ✓
        </div>

        <Text fw={600}>Admin Role Created</Text>

        <Text size="sm" c="dimmed" ta="center">
          This is the action sub-heading here, and it can be as long as possible.
        </Text>

        <Button color="orange" radius="xl" fullWidth>
          Manage Admin Users
        </Button>
      </Stack>
    </Modal>
  );
}
