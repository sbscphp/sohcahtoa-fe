"use client";

import { useState } from "react";
import {
  Avatar,
  Button,
  Divider,
  Group,
  Skeleton,
  Stack,
  Text,
} from "@mantine/core";
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
  type AgentTransactionRequiredDocument,
} from "@/app/admin/_services/admin-api";
import { getCurrencyFlagUrl } from "@/app/admin/_lib/currency";
import { notifications } from "@mantine/notifications";
import type { ApiError, ApiResponse } from "@/app/_lib/api/client";

const PLACEHOLDER = "—";

function formatDateTime(iso?: string | null): { date: string; time: string } {
  if (!iso) return { date: PLACEHOLDER, time: PLACEHOLDER };
  const date = new Date(iso);
  if (Number.isNaN(date.getTime()))
    return { date: PLACEHOLDER, time: PLACEHOLDER };
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

function formatAmount(
  currency?: string | null,
  value?: number | string | null,
): string {
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

  const transactionDetailsQuery = useFetchSingleData<
    ApiResponse<AgentSingleTransactionData>
  >(
    [...adminKeys.agent.transactionDetail(agentId ?? "", transactionId ?? "")],
    () => adminApi.agent.getTransactionById(agentId!, transactionId!),
    Boolean(agentId && transactionId),
  );

  const transaction = transactionDetailsQuery.data?.data;
  const isLoading = transactionDetailsQuery.isLoading;

  const statusLabel = transaction?.status ?? PLACEHOLDER;
  const title = transaction?.type ?? "Agent Transaction";
  const created = formatDateTime(transaction?.createdAt);
  const currencyCode = transaction?.currency ?? PLACEHOLDER;
  const currencyFlagUrl = transaction?.currency
    ? getCurrencyFlagUrl(transaction.currency)
    : null;

  const requiredDocs = (transaction?.requiredDocuments ??
    []) as AgentTransactionRequiredDocument[];
  const docsCount = requiredDocs.length > 0 ? requiredDocs.length : PLACEHOLDER;

  const settlementReceipt = transaction?.settlement?.receipt ?? null;

  const handleDownloadReceipt = async () => {
    if (!agentId || !transactionId || isDownloadingReceipt) return;

    try {
      setIsDownloadingReceipt(true);
      const file = await adminApi.agent.downloadTransactionReceipt(
        agentId,
        transactionId,
      );
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
      const apiResponse = (error as unknown as ApiError).data as
        | ApiResponse
        | undefined;
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
                <Avatar
                  radius="xl"
                  size={24}
                  color="gray"
                  src={currencyFlagUrl ?? undefined}
                  className="ring-2 ring-white"
                >
                  {currencyCode !== PLACEHOLDER
                    ? currencyCode.slice(0, 2).toUpperCase()
                    : PLACEHOLDER}
                </Avatar>

                <Text size="sm" fw={500} className="text-body-heading-300">
                  Currency Transacted: {currencyCode}
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
              <DetailItem label="Agent ID" value={agentId} />
              <DetailItem label="Agent Name" value={PLACEHOLDER} />
              <DetailItem label="Email Address" value={PLACEHOLDER} />
              <DetailItem label="Phone Number" value={PLACEHOLDER} />
            </div>
          </section>

          {/* Transaction Details */}
          <section className="space-y-4 mb-10">
            <Text fw={600} className="text-primary-400! mb-4!">
              Transaction Details
            </Text>
            <div className="grid gap-6 md:grid-cols-4">
              <DetailItem
                label="Transaction ID"
                value={transaction.referenceNumber ?? transaction.transactionId}
              />
              <DetailItem
                label="Amount (NGN)"
                value={formatAmount("NGN", transaction.nairaEquivalent)}
              />
              <DetailItem
                label="Equivalent Amount"
                value={formatAmount(transaction.currency, transaction.foreignAmount)}
              />
              <DetailItem
                label="Exchange Rate"
                value={
                  transaction.exchangeRate
                    ? `1 ${currencyCode} = NGN ${transaction.exchangeRate}`
                    : PLACEHOLDER
                }
              />
              <DetailItem label="Date Initiated" value={created.date} />
              <DetailItem label="Time Initiated" value={created.time} />
              <DetailItem
                label="Purpose"
                value={transaction.purpose ?? PLACEHOLDER}
              />
              <DetailItem
                label="Destination Country"
                value={transaction.destinationCountry ?? PLACEHOLDER}
              />
              <DetailItem
                label="Form A ID"
                value={transaction.formAId ?? PLACEHOLDER}
              />
              <DetailItem
                label="Disbursement Method"
                value={transaction.disbursementMethod ?? PLACEHOLDER}
              />
            </div>
          </section>

          {/* Required Documents */}
          <section className="space-y-4 mb-10">
            <Text fw={600} className="text-primary-400! mb-5!">
              Required Documents
            </Text>
            <div className="grid gap-6 md:grid-cols-4">
              <DetailItem
                label="BVN"
                value={transaction.personalInfo?.bvn ?? PLACEHOLDER}
              />
              <DetailItem
                label="NIN"
                value={transaction.personalInfo?.nin ?? PLACEHOLDER}
              />
              <DetailItem
                label="Tax Clearance Number"
                value={transaction.taxClearanceNumber ?? PLACEHOLDER}
              />
              <DetailItem label="Documents Count" value={String(docsCount)} />
              {requiredDocs.length > 0 ? (
                requiredDocs.map((doc, index) => (
                  <DetailItem
                    key={`${doc.uploaded?.id ?? doc.type ?? "doc"}-${index}`}
                    label={doc.type ?? `Document ${index + 1}`}
                    value={
                      doc.uploaded?.fileUrl ? (
                        <a
                          href={doc.uploaded.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#DD4F05] underline"
                        >
                          {doc.uploaded.fileName ?? doc.uploaded.fileUrl}
                        </a>
                      ) : (
                        (doc.uploaded?.fileName ?? PLACEHOLDER)
                      )
                    }
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
              <DetailItem
                label="Transaction ID"
                value={transaction.transactionId}
              />
              <DetailItem label="Transaction Date" value={created.date} />
              <DetailItem label="Transaction Time" value={created.time} />
              <DetailItem
                label="Transaction Receipt"
                value={settlementReceipt ?? PLACEHOLDER}
              />
              <DetailItem label="Paid to" value={PLACEHOLDER} />
              <DetailItem label="Bank Name" value={PLACEHOLDER} />
            </div>
          </section>

          {/* Transaction Settlement */}
          <section className="space-y-4">
            <Text fw={600} className="text-primary-400! mb-5!">
              Transaction Settlement
            </Text>
            <div className="grid gap-6 md:grid-cols-4">
              <DetailItem
                label="Settlement ID"
                value={transaction.settlement?.id ?? PLACEHOLDER}
              />
              <DetailItem
                label="Settlement Date"
                value={
                  transaction.settlement?.settledAt
                    ? formatDateTime(transaction.settlement.settledAt).date
                    : PLACEHOLDER
                }
              />
              <DetailItem
                label="Settlement Time"
                value={
                  transaction.settlement?.settledAt
                    ? formatDateTime(transaction.settlement.settledAt).time
                    : PLACEHOLDER
                }
              />
              <DetailItem
                label="Settlement Receipt"
                value={transaction.settlement?.receipt ?? PLACEHOLDER}
              />
              <DetailItem
                label="Settlement Structure (Cash)"
                value={
                  transaction.cashPickup?.amount
                    ? formatAmount("NGN", transaction.cashPickup.amount)
                    : PLACEHOLDER
                }
              />
              <DetailItem
                label="Settlement Structure (Prepaid Card)"
                value={
                  transaction.prepaidCard?.amount
                    ? formatAmount("NGN", transaction.prepaidCard.amount)
                    : PLACEHOLDER
                }
              />
              <DetailItem label="75% Paid Into" value={PLACEHOLDER} />
              <div className="space-y-1">
                <Text size="xs" className="text-body-text-50!" mb={4}>
                  Settlement Status
                </Text>
                <StatusBadge
                  status={
                    transaction.settlement?.status ??
                    transaction.currentStep ??
                    PLACEHOLDER
                  }
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
