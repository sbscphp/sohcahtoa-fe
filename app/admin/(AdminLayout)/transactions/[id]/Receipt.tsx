"use client";

import { useState } from "react";
import EmptyState from "@/app/admin/_components/EmptyState";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { DetailItem } from "../../../_components/DetailItem";
import { Card, Group, Loader, Text, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import TakeActionButton from "@/app/admin/_components/TakeActionButton";
import Empty from "../../../_components/assets/EmptyTrans.png";
import Image from "next/image";
import { ArrowUpRight, File } from "lucide-react";
import { adminApi } from "@/app/admin/_services/admin-api";
import type { ApiError, ApiResponse } from "@/app/_lib/api/client";
import type {
  TransactionActionDocumentViewModel,
  TransactionReceiptViewModel,
  TransactionWorkflowHistoryItemViewModel,
  PendingWorkflowStageViewModel,
} from "./hooks/useTransactionDetails";

interface ReceiptProps {
  transaction: TransactionReceiptViewModel | null;
  actionDocuments?: TransactionActionDocumentViewModel[];
  workflowHistory?: TransactionWorkflowHistoryItemViewModel[];
  pendingWorkflowStages?: PendingWorkflowStageViewModel[];
  transactionId?: string;
  isLoading?: boolean;
  isError?: boolean;
  isApprovalOfficer?: boolean;
  canActOnTransactionFooter?: boolean;
  approvalState?: string;
  approvalProcessName?: string;
  approvalType?: string;
}

const loadingFields = [
  { label: "Total payable", value: "--" },
  { label: "Receipt Transaction ID", value: "--" },
  { label: "Date", value: "--" },
  { label: "Time", value: "--" },
];

export default function Receipt({
  transaction,
  actionDocuments = [],
  workflowHistory = [],
  pendingWorkflowStages = [],
  transactionId,
  isLoading = false,
  isError = false,
  isApprovalOfficer = false,
  canActOnTransactionFooter = true,
  approvalState,
  approvalProcessName,
  approvalType,
}: ReceiptProps) {
  const [isDownloadingReceipt, setIsDownloadingReceipt] = useState(false);
  const EmptyImg = <Image src={Empty} alt="No Details Available" />;
  const hasData = Boolean(transaction);
  const fieldsToRender = isLoading ? loadingFields : (transaction?.fields ?? []);

  const handleDownloadReceipt = async () => {
    if (!transactionId || isDownloadingReceipt) return;

    try {
      setIsDownloadingReceipt(true);
      const file = await adminApi.transactions.downloadReceipt(transactionId);
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

  return (
    <Card radius="lg" p="xl" className="m-5 bg-[#F7F7F7]">
      {/* Header */}
      <Group justify="space-between" align="flex-start" mb="xl">
        <div>
          <Title order={4} className="text-body-heading-300 font-medium! text-2xl!">
            <span className="font-medium text-body-text-50 ">
              {isLoading ? "Loading" : (transaction?.titlePrefix ?? "--")}:
            </span>{" "}
            {isLoading ? "Transaction Details" : (transaction?.titleValue ?? "--")}
          </Title>

          <Group gap="xs" mt={4}>
            <Text c="dimmed" className="text-body-text-200">
              {isLoading ? "-- | --" : `${transaction?.dateLabel ?? "--"} | ${transaction?.timeLabel ?? "--"}`}
            </Text>
            <StatusBadge status={isLoading ? "Loading" : (transaction?.statusLabel ?? "--")} size="sm" />
          </Group>
        </div>

        <TakeActionButton
          transactionId={transactionId}
          transactionStatus={isLoading ? undefined : transaction?.status}
          transactionStatusLabel={
            isLoading ? undefined : transaction?.statusLabel
          }
          documents={actionDocuments}
          workflowHistory={workflowHistory}
          pendingWorkflowStages={pendingWorkflowStages}
          isApprovalOfficer={isApprovalOfficer}
          canActOnTransactionFooter={canActOnTransactionFooter}
          approvalState={approvalState}
          approvalProcessName={approvalProcessName}
          approvalType={approvalType}
        />
      </Group>

      <div className="space-y-6">
        <Text fw={600} c="orange" mb="lg" className="font-medium! text-lg!">
          Receipt Details
        </Text>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {fieldsToRender.map((item) => (
            <DetailItem key={item.label} label={item.label} value={item.value} loading={isLoading} />
          ))}

          {(isLoading || Boolean(transactionId)) && (
            <div className="space-y-1 md:col-span-3">
              <Text size="xs" className="text-body-text-50!" mb={4}>
                Payment Receipt
              </Text>
              {isLoading ? (
                <div className="h-16 rounded-md border border-gray-300 bg-gray-200/60 animate-pulse" />
              ) : (
                <button
                  type="button"
                  onClick={handleDownloadReceipt}
                  disabled={!transactionId || isDownloadingReceipt}
                  className="flex w-full gap-2 mt-3 p-2 border border-gray-300 rounded-md cursor-pointer text-left disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-[#FFF6F1] border-4 border-[#FFFAF8] rounded-3xl ">
                      <File size={16} color="#DD4F05" />
                    </div>
                    <div>
                      <Text fw={500} className="text-body-heading-300">
                        {transaction?.document?.title ?? "Receipt of Payment"}
                      </Text>
                      <Text size="xs" className="text-body-text-50!">
                        {transaction?.document?.fileSize ?? "--"}
                      </Text>
                    </div>
                  </div>
                  {isDownloadingReceipt ? (
                    <Loader size={16} color="#DD4F05" className="mt-2 ml-auto" />
                  ) : (
                    <ArrowUpRight size={16} color="#DD4F05" className="mt-2 ml-auto" />
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6 mb-6">
        {!isLoading && (((hasData && transaction?.isEmpty) || !hasData || isError)) && (
          <EmptyState
            title="Payment Pending"
            description="So sorry, but transaction hasn’t received any payment from the customer/Transaction requestor"
            icon={EmptyImg}
          />
        )}
      </div>
    </Card>
  );
}
