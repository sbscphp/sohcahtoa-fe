"use client";

import { Modal, Text, Group, Divider, Badge } from "@mantine/core";
import { X } from "lucide-react";

interface ViewUserActionModalProps {
  opened: boolean;
  onClose: () => void;
}

export function ViewUserActionModal({
  opened,
  onClose,
}: ViewUserActionModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
      radius="lg"
      size="lg"
      centered
    >
      {/* Header */}
      <Group justify="space-between" mb="xs" className="mt-6!">
        <div>
          <Text fw={600} size="lg">
            View User Actions
          </Text>
          <Text size="sm" c="dimmed">
            View specific action taken by a user
          </Text>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <X size={16} />
        </button>
      </Group>

      <Divider my="md" />

      {/* Details */}
      <div className="space-y-5 text-sm">
        <Detail label="Admin Name" value="Adewale Adeolu (ID:90310)" />
        <Divider />
        <Detail label="Role" value="Head of Settlement" />
        <Divider />
        <Detail label="Department" value="Internal Control and Audit" />
        <Divider />
        <Detail label="Action ID" value="783836739" />
        <Divider />
        <Detail
          label="Action Date and Time"
          value="September 19, 2025 ; 11:00 am"
        />
        <Divider />
        <Detail label="Affected Module" value="Transaction Management" />
        <Divider />
        <Detail label="Action Taken" value="Resolve and Settled PTA" />
        <Divider />

        <Group justify="space-between">
          <Text c="dimmed">Action Effect</Text>
          <Badge color="green" radius="xl" variant="light">
            Posted
          </Badge>
        </Group>
        <Divider />
        <Detail label="Approved by" value="Jide Adeola (ID:99301)" />
        <Divider />
        <Detail label="IP Address" value="7843H:8933:2033" />
        <Divider />
      </div>
    </Modal>
  );
}

/* --------------------------------------------
 Reusable row
--------------------------------------------- */
function Detail({ label, value }: { label: string; value: string }) {
  return (
    <Group justify="space-between">
      <Text c="dimmed">{label}</Text>
      <Text fw={500}>{value}</Text>
    </Group>
  );
}
