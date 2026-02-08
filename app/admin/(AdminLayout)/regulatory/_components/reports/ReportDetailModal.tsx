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


interface ReportSummaryModalProps {
  opened: boolean;
  onClose: () => void;
}

export function ReportsDetailModal({
  opened,
  onClose,
}: ReportSummaryModalProps) {
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
        <DetailRow label="Report name" value="Daily FX sales report" />
        <Divider />

        <DetailRow label="Reported on" value="12 Feb 2025" />
        <Divider />

        <DetailRow label="File type" value="XML" />
        <Divider />

        <DetailRow label="Channel" value="FN window" />
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

        <DetailRow label="Last action" value="Submitted" />
        <Divider />

        <DetailRow label="Submission time" value="12 Feb 2025 - 11:00am" />
        <Divider />

        <DetailRow label="REF code" value="FNW-2025-02-12-1140" />
        <Divider />

        <DetailRow label="Error code" value="None" />
        <Divider />

        <DetailRow label="File size" value="1.2MB" />
      </Stack>

      {/* Footer */}
      <Group justify="flex-end" mt="xl">
        <Button variant="outline" radius="xl" onClick={onClose}>
          Close
        </Button>

        <Button rightSection={<Download size={16} />} color="orange" radius="xl">
          Download report
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
