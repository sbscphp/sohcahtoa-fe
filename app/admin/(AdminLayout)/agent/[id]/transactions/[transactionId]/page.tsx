"use client";

import { useState } from "react";
import { Avatar, Button, Divider, Group, Skeleton, Stack, Text } from "@mantine/core";
import { Download } from "lucide-react";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { DetailItem } from "@/app/admin/_components/DetailItem";
import EmptySection from "@/app/admin/_components/EmptySection";
import { useParams } from "next/navigation";
import { useFetchSingleData } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import {
  adminApi,
  type AgentSingleTransactionData,
  type AgentTransactionDocumentItem,
} from "@/app/admin/_services/admin-api";
import { notifications } from "@mantine/notifications";
import type { ApiError, ApiResponse } from "@/app/_lib/api/client";

const PLACEHOLDER = "—";

function formatDateTime(iso?: string | null): { date: string; time: string } {
  if (!iso) return { date: PLACEHOLDER, time: PLACEHOLDER };
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return { date: PLACEHOLDER, time: PLACEHOLDER };
  return {
    date: date.toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    time: date.toLocaleTimeString("en-NG", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
  };
}

function formatAmount(currency?: string | null, value?: number | string | null): string {
  if (value === null || value === undefined || value === "") return PLACEHOLDER;
  const numeric = Number(value);
  if (Number.isFinite(numeric)) {
    const formatted = numeric.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${currency ?? ""} ${formatted}`.trim();
  }
  return `${currency ?? ""} ${String(value)}`.trim();
}

export default function AgentTransactionDetailsPage() {
  const [isDownloadingReceipt, setIsDownloadingReceipt] = useState(false);
  const params = useParams<{
    id: string;
    transactionId: string;
  }>();
  const agentId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const transactionId = Array.isArray(params?.transactionId)
    ? params.transactionId[0]
    : params?.transactionId;

  const transactionDetailsQuery = useFetchSingleData<ApiResponse<AgentSingleTransactionData>>(
    [...adminKeys.agent.transactionDetail(agentId ?? "", transactionId ?? "")],
    () => adminApi.agent.getTransactionById(agentId!, transactionId!),
    Boolean(agentId && transactionId)
  );

  const transaction = transactionDetailsQuery.data?.data;
  const isLoading = transactionDetailsQuery.isLoading;

  const statusLabel = transaction?.status ?? PLACEHOLDER;
  const title = transaction?.type ?? "Agent Transaction";
  const created = formatDateTime(transaction?.createdAt);
  const docsList = (transaction?.meta?.documentsList ?? []) as AgentTransactionDocumentItem[];
  const docsCount =
    transaction?.meta?.numberOfDocuments ??
    (docsList.length > 0 ? docsList.length : PLACEHOLDER);
  const receiptUrl = transaction?.meta?.receipt ?? null;

  const handleDownloadReceipt = async () => {
    if (!agentId || !transactionId || isDownloadingReceipt) return;

    try {
      setIsDownloadingReceipt(true);
      const file = await adminApi.agent.downloadTransactionReceipt(agentId, transactionId);
      const objectUrl = URL.createObjectURL(file.blob);
      const link = document.createElement("a");
      const fallbackFileName = `transaction-receipt-${transactionId}.pdf`;
      link.href = objectUrl;
      link.download = file.filename || fallbackFileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      const apiResponse = (error as unknown as ApiError).data as ApiResponse | undefined;
      notifications.show({
        title: "Receipt Download Failed",
        message:
          apiResponse?.error?.message ??
          (error as Error)?.message ??
          "Unable to download transaction receipt right now.",
        color: "red",
      });
    } finally {
      setIsDownloadingReceipt(false);
    }
  };

  if (!agentId || !transactionId) {
    return (
      <div className="space-y-6">
        <EmptySection
          title="Transaction Not Found"
          description="A valid agent transaction id is required to load this page."
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6 rounded-2xl bg-white p-6 shadow-sm">
        <Skeleton height={30} width="35%" radius="sm" />
        <Skeleton height={20} width="25%" radius="sm" />
        <Skeleton height={220} radius="md" />
        <Skeleton height={220} radius="md" />
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="space-y-6">
        <EmptySection
          title="Transaction Not Found"
          description="The requested transaction is unavailable or may have been removed."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white shadow-sm">
        {/* Header */}
        <div className="flex flex-col p-6 md:p-8 gap-4 md:flex-row md:items-start md:justify-between">
          <Stack gap={6} className="flex-1">
            <div className="space-y-2">
              <Text size="xl" fw={600}>
                {title}
              </Text>

              <Group gap={8} className="flex-wrap text-sm text-[#6B7280]">
                <span>
                  {created.date} | {created.time}
                </span>
                <StatusBadge status={statusLabel} />
              </Group>

              <div className="inline-flex items-center gap-3 rounded-full border border-gray-100 bg-white px-3 py-1">
                <div className="flex -space-x-2">
                  <Avatar
                    radius="xl"
                    size={24}
                    color="gray"
                    className="ring-2 ring-white"
                  >
                    US
                  </Avatar>
                  <Avatar
                    radius="xl"
                    size={24}
                    color="green"
                    className="-ml-2 ring-2 ring-white"
                  >
                    NG
                  </Avatar>
                </div>

                <Text size="sm" fw={500} className="text-body-heading-300">
                  Currency Transacted
                </Text>
              </div>
            </div>
          </Stack>

          <Button
            radius="xl"
            size="md"
            color="#DD4F05"
            variant="outline"
            rightSection={<Download size={18} />}
            className="self-start md:self-auto"
            loading={isDownloadingReceipt}
            disabled={!agentId || !transactionId || isDownloadingReceipt}
            onClick={handleDownloadReceipt}
          >
            Download Receipt
          </Button>
        </div>

        <Divider className="my-6" />

        <div className="p-6 md:p-8">
          {/* Agent Details */}
          <section className="space-y-4 mb-10">
            <Text fw={600} className="text-primary-400! mb-5!">
              Agent Details
            </Text>
            <div className="grid gap-6 md:grid-cols-4">
              <DetailItem label="Agent ID" value={transaction.agent?.id ?? PLACEHOLDER} />
              <DetailItem
                label="Agent Name"
                value={transaction.agent?.name ?? transaction.agent?.fullName ?? PLACEHOLDER}
              />
              <DetailItem label="Email Address" value={transaction.agent?.email ?? PLACEHOLDER} />
              <DetailItem
                label="Phone Number"
                value={transaction.agent?.phoneNumber ?? PLACEHOLDER}
              />
            </div>
          </section>

          {/* Transaction Details */}
          <section className="space-y-4 mb-10">
            <Text fw={600} className="text-primary-400! mb-4!">
              Transaction Details
            </Text>
            <div className="grid gap-6 md:grid-cols-4">
              <DetailItem label="Transaction ID" value={transaction.transactionId ?? transaction.id} />
              <DetailItem
                label="Amount"
                value={formatAmount(
                  transaction.amounts?.baseCurrency,
                  transaction.amounts?.baseValue
                )}
              />
              <DetailItem
                label="Equivalent Amount"
                value={formatAmount(
                  transaction.amounts?.quoteCurrency,
                  transaction.amounts?.quoteValue
                )}
              />
              <DetailItem label="Date initiated" value={created.date} />
              <DetailItem
                label="Pickup Address"
                value={transaction.meta?.pickupLocation ?? PLACEHOLDER}
              />
            </div>
          </section>

          {/* Required Documents */}
          <section className="space-y-4 mb-10">
            <Text fw={600} className="text-primary-400! mb-5!">
              Required Documents
            </Text>
            <div className="grid gap-6 md:grid-cols-4">
              <DetailItem label="BVN" value={transaction.meta?.bvnNumber ?? PLACEHOLDER} />
              <DetailItem label="Documents Count" value={String(docsCount)} />
              {docsList.length > 0 ? (
                docsList.map((doc, index) => (
                  <DetailItem
                    key={`${doc.id ?? doc.fileName ?? "doc"}-${index}`}
                    label={doc.name ?? doc.type ?? `Document ${index + 1}`}
                    value={doc.fileName ?? doc.fileUrl ?? PLACEHOLDER}
                  />
                ))
              ) : (
                <DetailItem label="Documents" value={PLACEHOLDER} />
              )}
            </div>
          </section>

          {/* Payment Details */}
          <section className="space-y-4 mb-10">
            <Text fw={600} className="text-primary-400! mb-5!">
              Payment Details
            </Text>
            <div className="grid gap-6 md:grid-cols-4">
              <DetailItem label="Transaction ID" value={transaction.transactionId ?? transaction.id} />
              <DetailItem label="Transaction Date" value={created.date} />
              <DetailItem label="Transaction Time" value={created.time} />
              <DetailItem
                label="Transaction Receipt"
                value={receiptUrl ?? PLACEHOLDER}
              />
              <DetailItem label="Paid to" value={transaction.customer?.name ?? PLACEHOLDER} />
              <DetailItem label="Bank Name" value={PLACEHOLDER} />
            </div>
          </section>

          {/* Transaction Settlement */}
          <section className="space-y-4">
            <Text fw={600} className="text-primary-400! mb-5!">
              Transaction Settlement
            </Text>
            <div className="grid gap-6 md:grid-cols-4">
              <DetailItem label="Settlement ID" value={PLACEHOLDER} />
              <DetailItem label="Settlement Date" value={PLACEHOLDER} />
              <DetailItem label="Settlement Time" value={PLACEHOLDER} />
              <DetailItem label="Settlement Receipt" value={PLACEHOLDER} />
              <DetailItem label="Settlement Structure (Cash)" value={PLACEHOLDER} />
              <DetailItem label="Settlement Structure (Prepaid Card)" value={PLACEHOLDER} />
              <DetailItem label="75% Paid Into" value={PLACEHOLDER} />
              <div className="space-y-1">
                <Text size="xs" className="text-body-text-50!" mb={4}>
                  Settlement Status
                </Text>
                <StatusBadge status={transaction.step ?? PLACEHOLDER} />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

