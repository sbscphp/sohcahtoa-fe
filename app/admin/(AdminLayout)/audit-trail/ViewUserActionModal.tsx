"use client";

import { Modal, Text, Group, Badge, Button, Divider } from "@mantine/core";
import { StatusBadge } from "../../_components/StatusBadge";
import type { AuditTrailRowItem } from "./hooks/useAuditTrail";

interface ViewUserActionModalProps {
  opened: boolean;
  action: AuditTrailRowItem | null;
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
  action,
  onClose,
}: ViewUserActionModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group justify="space-between" align="flex-start">
          <span>
            <Text fw={600}>View User Actions</Text>
            <Text size="xs" c="dimmed">
              View specific action taken / committed by a user
            </Text>
          </span>
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

      <Row label="Admin Name" value={action?.actionBy || "--"} />
      <Divider bg="#E1E0E0" />

      <Row label="Role / Email" value={action?.role || "--"} />
      <Divider />

      <Row label="Action ID" value={action?.id || "--"} />
      <Divider />

      <Row
        label="Action Date and Time"
        value={`${action?.timestamp || "--"} ; ${action?.time || "--"}`}
      />
      <Divider />

      <Row label="Affected Module" value={action?.module || "--"} />
      <Divider />

      <Row label="Action Taken" value={action?.actionTaken || "--"} />
      <Divider />

      <Row
        label="Action Effect"
        value={<StatusBadge status={action?.status || "Pending"} variant="light" />}
      />
      <Divider />

      {/* <Row label="Affected System" value={action?.affectedSystem || "--"} /> */}

      <Group justify="flex-end" mt="lg">
        <Button variant="outline" radius="xl" onClick={onClose}>
          Close
        </Button>
      </Group>
    </Modal>
  );
}
