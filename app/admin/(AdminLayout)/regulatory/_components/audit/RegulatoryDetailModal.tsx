"use client";

import {
  Modal,
  Text,
  Group,
  Button,
  Stack,
  Divider,
  Center,
  Loader,
} from "@mantine/core";
import { Download } from "lucide-react";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { useRegulatoryLogDetails } from "../../hooks/useRegulatoryLogs";

interface RegulatorySummaryModalProps {
  opened: boolean;
  onClose: () => void;
  regulatoryLogId: string | null;
}

export function RegulatoryDetailModal({
  opened,
  onClose,
  regulatoryLogId,
}: RegulatorySummaryModalProps) {
  const { details, isLoading, isFetching, isError } = useRegulatoryLogDetails(
    opened ? regulatoryLogId ?? undefined : undefined
  );
  const hasReportFile = Boolean(details?.fileUrl);

  const resolveFileUrl = (fileUrl: string): string => {
    if (!fileUrl) return "";
    if (/^https?:\/\//i.test(fileUrl)) return fileUrl;

    const apiBaseUrl =
      process.env.NEXT_PUBLIC_API_URL || "https://sohcahtoa-dev.clocksurewise.com";

    try {
      return new URL(fileUrl, apiBaseUrl).toString();
    } catch {
      return fileUrl;
    }
  };

  const handleDownload = () => {
    if (!details?.fileUrl) return;
    const resolvedUrl = resolveFileUrl(details.fileUrl);
    if (!resolvedUrl) return;
    window.open(resolvedUrl, "_blank", "noopener,noreferrer");
  };

  const renderBody = () => {
    if (isLoading || isFetching) {
      return (
        <Center py="xl">
          <Stack align="center" gap="xs">
            <Loader color="orange" />
            <Text size="sm" c="dimmed">
              Loading regulatory log details...
            </Text>
          </Stack>
        </Center>
      );
    }

    if (isError) {
      return (
        <Center py="xl">
          <Text size="sm" c="red">
            Unable to load this regulatory log right now. Please try again.
          </Text>
        </Center>
      );
    }

    if (!details) {
      return (
        <Center py="xl">
          <Text size="sm" c="dimmed">
            No regulatory log details available.
          </Text>
        </Center>
      );
    }

    return (
      <Stack gap="sm">
        <DetailRow label="Timestamp" value={details.timestamp} />
        <Divider />
        <DetailRow label="Source" value={details.source} />
        <Divider />
        <DetailRow label="Description" value={details.description} />
        <Divider />
        <DetailRow label="Duplicate" value={details.duplicateLabel} />
        <Divider />
        <DetailRow label="Response" value={details.response} />
        <Divider />
        <DetailRow label="Result" value={<StatusBadge status={details.result} />} />
        <Divider />
        <DetailRow label="Regulatory ID" value={details.regulatoryId} />
        <Divider />
        <DetailRow label="Channel" value={details.channel} />
      </Stack>
    );
  };

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
      {renderBody()}

      <Group justify="flex-end" mt="xl">
        <Button variant="outline" radius="xl" onClick={onClose}>
          Close
        </Button>

        <Button
          rightSection={<Download size={16} />}
          color="orange"
          radius="xl"
          onClick={handleDownload}
          disabled={!hasReportFile || isLoading || isFetching}
        >
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
      <div className="text-right">{value}</div>
    </Group>
  );
}
