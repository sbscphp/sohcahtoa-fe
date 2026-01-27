"use client";

import { Modal, Text, Group, Badge, Button, Divider } from "@mantine/core";
import { StatusBadge } from "../../_components/StatusBadge";

interface ViewUserActionModalProps {
  opened: boolean;
  onClose: () => void;
}

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <Group justify="space-between" py={8}>
    <Text size="sm" c="dimmed">
      {label}
    </Text>
    <Text size="sm" fw={500}>
      {value}
    </Text>
  </Group>
);

export default function ViewUserActionModal({
  opened,
  onClose,
}: ViewUserActionModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group justify="space-between" align="flex-start">
          <div>
            <Text fw={600}>View User Actions</Text>
            <Text size="xs" c="dimmed">
              View specific action taken / committed by a user
            </Text>
          </div>
          <Badge
            variant="light"
            color="#C01048"
            radius="xl"
            size="sm"
            style={{ cursor: "pointer", position: "absolute", top: 15, right: 15 }}
            onClick={onClose}
          >
            ✕
          </Badge>
        </Group>
      }
      centered
      radius="lg"
      size="md"
      withCloseButton={false}
    >
      <Divider my="sm" />

      <Row label="Admin Name" value="Adewale Adeolu (ID:90310)" />
      <Divider bg="#E1E0E0" />

      <Row label="Role" value="Head of Settlement" />
      <Divider />

      <Row label="Department" value="Internal Control and Audit" />
      <Divider />

      <Row label="Action ID" value="783836739" />
      <Divider c="#E1E0E0" />

      <Row label="Action Date and Time" value="September 19, 2025 ; 11:00 am" />
      <Divider />

      <Row label="Affected Module" value="Transaction Management" />
      <Divider />

      <Row label="Action Taken" value="Resolve and Settled PTA" />
      <Divider />

      <Row label="Action Effect" value={<StatusBadge status="Posted" />} />
      <Divider />

      <Row label="Approved by" value="Jide Adeola (ID:99301)" />
      <Divider />

      <Row label="IP Address" value="7843H:8933:2033" />

      <Group justify="flex-end" mt="lg">
        <Button variant="outline" radius="xl" onClick={onClose}>
          Close
        </Button>
      </Group>
    </Modal>
  );
}
