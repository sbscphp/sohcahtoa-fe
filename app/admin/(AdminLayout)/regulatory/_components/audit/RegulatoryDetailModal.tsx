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


interface RegulatorySummaryModalProps {
  opened: boolean;
  onClose: () => void;
}

export function RegulatoryDetailModal({
  opened,
  onClose,
}: RegulatorySummaryModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <div>
          <Text fw={600}>Report summary</Text>
          <Text size="xs" c="dimmed">
            Breakdown of this compliance report
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

        <DetailRow label="Event submissions:" value=" Report submission" />
        <Divider />

        <DetailRow label="Submitted to :" value="FN Window" />
        <Divider />

        <DetailRow label="Reference ID :" value="FNW-007777" />
        <Divider />
        
        <DetailRow label="Endpoint:" value="/api/v1/fnwindow/upload" />
        <Divider />

        <DetailRow label="Message:" value="Report successfully uploaded to FN Window." />
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


        <DetailRow label="REF code" value="FNW-2025-02-12-1140" />
        <Divider />

        <DetailRow label="Response:" value="200 OK – Report successfully uploaded" />
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
