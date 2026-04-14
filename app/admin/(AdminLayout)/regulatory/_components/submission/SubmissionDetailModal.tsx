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
import { useTrmsSubmissionDetails } from "../../hooks/useTrmsSubmissions";
import { formatCurrency } from "@/app/utils/helper/formatCurrency";

interface SubmissionDetailModalProps {
  opened: boolean;
  onClose: () => void;
  transactionId: string | null;
}

export function SubmissionDetailModal({
  opened,
  onClose,
  transactionId,
}: SubmissionDetailModalProps) {
  const { details, isLoading, isFetching, isError } = useTrmsSubmissionDetails(
    opened ? transactionId ?? undefined : undefined
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

  const getCurrency = (currencyPair: string) => {
    return currencyPair.substring(0, 3);
  };

  const renderBody = () => {
    if (isLoading || isFetching) {
      return (
        <Center py="xl">
          <Stack align="center" gap="xs">
            <Loader color="orange" />
            <Text size="sm" c="dimmed">
              Loading TRMS submission details...
            </Text>
          </Stack>
        </Center>
      );
    }

    if (isError) {
      return (
        <Center py="xl">
          <Text size="sm" c="red">
            Unable to load this TRMS submission right now. Please try again.
          </Text>
        </Center>
      );
    }

    if (!details) {
      return (
        <Center py="xl">
          <Text size="sm" c="dimmed">
            No TRMS submission details available.
          </Text>
        </Center>
      );
    }

    return (
      <Stack gap="sm" className="mt-10">
        <DetailRow label="Name" value={details.applicantName} />
        <Divider />

        <DetailRow label="Transaction ID" value={details.transactionId} />
        <Divider />

        <DetailRow label="Type" value={details.type} />
        <Divider />

        <DetailRow label="Currency Pair" value={details.currencyPair} />
        <Divider />

        <DetailRow label="Amount" value={formatCurrency(details.amount, getCurrency(details.currencyPair))} />
        <Divider />

        <DetailRow label="Documents" value={details.documentsLabel} />
        <Divider />

        <DetailRow label="Status" value={<StatusBadge status={details.status} />} />
        <Divider />

        <DetailRow label="Form A ID" value={details.formAId} />
        <Divider />

        <DetailRow label="Submitted On" value={details.submittedOnLabel} />
      </Stack>
    );
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <div>
          <Text fw={700}>TRMS submissions details</Text>
        </div>
      }
      radius="lg"
      size="lg"
      pb={0}
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