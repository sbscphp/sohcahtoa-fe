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
import { useAuditLogDetails } from "../../hooks/useAuditLogs";

interface AuditSummaryModalProps {
  opened: boolean;
  onClose: () => void;
  auditLogId: string | null;
}

export function AuditDetailModal({
  opened,
  onClose,
  auditLogId,
}: AuditSummaryModalProps) {
  const { details, isLoading, isFetching, isError } = useAuditLogDetails(
    opened ? auditLogId ?? undefined : undefined
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
              Loading audit log details...
            </Text>
          </Stack>
        </Center>
      );
    }

    if (isError) {
      return (
        <Center py="xl">
          <Text size="sm" c="red">
            Unable to load this audit log right now. Please try again.
          </Text>
        </Center>
      );
    }

    if (!details) {
      return (
        <Center py="xl">
          <Text size="sm" c="dimmed">
            No audit log details available.
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
        <DetailRow label="Result" value={<StatusBadge status={details.result} />} />
        <Divider />
        <DetailRow label="Audit ID" value={details.auditId} />
        <Divider />
        <DetailRow label="User" value={details.user} />
      </Stack>
    );
  };

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
      {renderBody()}

      <Group justify="flex-end" mt="xl">
        <Button variant="outline" radius="xl" onClick={onClose}>
          Close
        </Button>

        {hasReportFile && <Button
          rightSection={<Download size={16} />}
          color="orange"
          radius="xl"
          onClick={handleDownload}
          disabled={isLoading || isFetching}
        >
          Download log file
        </Button>}
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
