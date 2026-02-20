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

interface SubmissionDetailModalProps {
  opened: boolean;
  onClose: () => void;
}

export function SubmissionDetailModal({
  opened,
  onClose,
}: SubmissionDetailModalProps) {
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
      <Stack gap="sm"  className="mt-10">
        <DetailRow label="Name" value="Ade Musa" />
        <Divider />

        <DetailRow label="Transaction ID:" value="TX-7281902" />
        <Divider />

        <DetailRow label="Type" value="PTA" />
        <Divider />

        <DetailRow label="Currency Pair" value="USD/NGN" />
        <Divider />
        <DetailRow label="Amount" value=" $4,000" />
        <Divider />

        <DetailRow label="Documents" value="2 files uploaded" />
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

        <DetailRow label="Submitted On" value="12 Feb 2025, 10:40 AM" />
        <Divider />

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