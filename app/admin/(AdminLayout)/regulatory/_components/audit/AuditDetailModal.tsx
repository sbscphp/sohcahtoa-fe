"use client";

import {
  Modal,
  Text,
  Group,
  Badge,
  Button,
  Stack,
  Divider,
} from "@mantine/core";
import { Download } from "lucide-react";


interface AuditSummaryModalProps {
  opened: boolean;
  onClose: () => void;
}

export function AuditDetailModal({
  opened,
  onClose,
}: AuditSummaryModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <div>
          <Text fw={600}>Audit log details</Text>
          <Text size="xs" c="dimmed">
            Detailed record of an internal system or user activity within Sohcahtoa
          </Text>
        </div>
      }
      radius="lg"
      size="lg"
      centered
    >
      <Stack gap="sm">
        <DetailRow label="Timestamp:" value="Oct 22, 2025 – 09:15 AM" />
        <Divider />

        <DetailRow label="Action" value="Report generated successfully" />
        <Divider />

        <DetailRow label="Performed by:" value=" System Auto" />
        <Divider />

        <DetailRow label="Module:" value="Rate management " />
        <Divider />

        <DetailRow label="Report ID: " value="REP-2025-012" />
        <Divider />

        <DetailRow
          label="Status"
          value={
            <Badge color="green" variant="light" radius="xl">
              Success
            </Badge>
          }
        />
        <Divider />
      </Stack>

      {/* Footer */}
      <Group justify="flex-end" mt="xl">
        <Button variant="outline" radius="xl" onClick={onClose}>
          Close
        </Button>

        <Button rightSection={<Download size={16} />} color="orange" radius="xl">
          Download log file
        </Button>
      </Group>
    </Modal>
  );
}

/* --------------------------------------------
 Reusable Row
--------------------------------------------- */
function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Group justify="space-between">
      <Text size="sm" c="dimmed">
        {label}
      </Text>

      <Text size="sm" fw={500}>
        {value}
      </Text>
    </Group>
  );
}
