"use client";

import {
  Modal,
  Text,
  Group,
  Button,
  Stack,
  Divider,
  Loader,
  Center,
} from "@mantine/core";
import { Download } from "lucide-react";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { useComplianceReportDetails } from "../../hooks/useComplianceReports";

interface ReportSummaryModalProps {
  opened: boolean;
  onClose: () => void;
  reportId: string | null;
}

export function ReportSummaryModal({
  opened,
  onClose,
  reportId,
}: ReportSummaryModalProps) {
  const { report, isLoading, isFetching, isError } = useComplianceReportDetails(
    opened ? reportId ?? undefined : undefined
  );

  const hasReportFile = Boolean(report?.fileUrl);

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
    if (!report?.fileUrl) return;
    const resolvedUrl = resolveFileUrl(report.fileUrl);
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
              Loading report details...
            </Text>
          </Stack>
        </Center>
      );
    }

    if (isError) {
      return (
        <Center py="xl">
          <Text size="sm" c="red">
            Unable to load this compliance report right now. Please try again.
          </Text>
        </Center>
      );
    }

    if (!report) {
      return (
        <Center py="xl">
          <Text size="sm" c="dimmed">
            No report details available.
          </Text>
        </Center>
      );
    }

    return (
      <Stack gap="sm">
        <DetailRow label="Report name" value={report.reportName} />
        <Divider />

        <DetailRow label="Report type" value={report.type} />
        <Divider />

        <DetailRow label="Report date" value={report.reportDateLabel} />
        <Divider />

        <DetailRow label="Submitted on" value={report.submittedOnLabel} />
        <Divider />

        <DetailRow label="End date" value={report.endDateLabel} />
        <Divider />

        <DetailRow label="File type" value={report.fileType} />
        <Divider />

        <DetailRow label="Channel" value={report.channel} />
        <Divider />

        <DetailRow
          label="Status"
          value={<StatusBadge status={report.status} />}
        />
        <Divider />

        <DetailRow label="Reference" value={report.reference} />
        <Divider />

        <DetailRow label="File size" value={report.fileSizeLabel} />
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

        {hasReportFile && <Button
          rightSection={<Download size={16} />}
          color="orange"
          radius="xl"
          onClick={handleDownload}
          disabled={isLoading || isFetching}
        >
          Download report
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

      <div className="text-right">
        {value}
      </div>
    </Group>
  );
}
