"use client";

import DocumentViewerModal from "@/app/(customer)/_components/modals/DocumentViewerModal";
import type { RequiredDocumentsData } from "@/app/(customer)/_components/transactions/details";
import {
  RequiredDocumentsSection,
  TransactionDetailsSection,
  TransactionSettlementSection,
} from "@/app/(customer)/_components/transactions/details";
import PaymentDetailsSection from "@/app/agent/_components/transactions/details/PaymentDetailsSection";
import LabelText from "@/app/(customer)/_components/transactions/details/LabelText";
import SectionBlock from "@/app/(customer)/_components/transactions/details/SectionBlock";
import TransactionRequestSheet, { type TransactionDocumentItem } from "@/app/(customer)/_components/transactions/TransactionRequestSheet";
import { getCurrencyByCode, getCurrencyFlagUrl, getCurrencySymbol } from "@/app/(customer)/_lib/currency";
import {
  getTransactionStatusLabel,
  normalizeTransactionStatus,
  TRANSACTION_STATUS_LABELS,
} from "@/app/(customer)/_lib/transaction-details";
import { getStatusBadge } from "@/app/(customer)/_utils/status-badge";
import { useFetchSingleData } from "@/app/_lib/api/hooks";
import { agentKeys } from "@/app/_lib/api/query-keys";
import type { TransactionDetailComment } from "@/app/_lib/api/types";
import EmptyState from "@/app/admin/_components/EmptyState";
import AgentProceedToPaymentModal from "@/app/agent/_components/transactions/details/AgentProceedToPaymentModal";
import AgentRecordDisbursementModal from "@/app/agent/_components/transactions/details/AgentRecordDisbursementModal";
import { agentApi } from "@/app/agent/_services/agent-api";
import { buildAgentDetailPayloadFromApi } from "@/app/agent/_utils/agent-transaction-detail-payload";
import { formatHeaderDateTime, formatShortDate, formatShortTime } from "@/app/utils/helper/formatLocalDate";
import Loader from "@/components/loader";
import { Button } from "@mantine/core";
import type { FileWithPath } from "@mantine/dropzone";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowUpRight, ChevronLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export default function AgentTransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = typeof params.id === "string" ? params.id : "";

  const { data: apiResponse, isLoading: apiLoading } = useFetchSingleData(
    agentKeys.transactions.detail(id) as unknown as unknown[],
    () => agentApi.transactions.getById(id),
    !!id
  );

  const apiData = apiResponse?.data;
  const comments = apiData?.comments;
  const latestComment: TransactionDetailComment | null = useMemo(() => {
    if (!comments?.length) return null;
    return [...comments].sort(
      (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)
    )[0] ?? null;
  }, [comments]);
  const payload = useMemo(
    () => (apiData ? buildAgentDetailPayloadFromApi(apiData) : null),
    [apiData]
  );

  const [updatesSheetOpen, setUpdatesSheetOpen] = useState(false);
  const [proceedToPaymentOpen, setProceedToPaymentOpen] = useState(false);
  const [recordDisbursementOpen, setRecordDisbursementOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "bank_transfer">("cash");
  const [documentViewer, setDocumentViewer] = useState<{ url: string; filename: string } | null>(null);
  if (!payload) {
    if (apiLoading && id) {
      return (
        <div className="p-8">
          <Loader fullPage />
        </div>
      );
    }
    return (
      <div className="p-8">
        <EmptyState
          title="Transaction not found"
          description="The transaction you are looking for does not exist."
          onClick={() => router.push("/agent/transactions")}
          buttonText="Back to Transactions"
        />
      </div>
    );
  }

  const title = payload.transactionTypeLabel;
  const statusLabel = getTransactionStatusLabel(payload.status);
  const statusKey = normalizeTransactionStatus(payload.status);
  const showPaymentDetails =
    statusKey !== "" &&
    statusKey in TRANSACTION_STATUS_LABELS &&
    statusKey !== "DRAFT" &&
    statusKey !== "AWAITING_VERIFICATION" &&
    statusKey !== "VERIFICATION_IN_PROGRESS" &&
    statusKey !== "VERIFICATION_COMPLETED" &&
    statusKey !== "ADMIN_APPROVAL_PENDING" &&
    statusKey !== "PENDING_RECORD_VALIDATION";
  const showSettlement = statusKey === "COMPLETED";
  const amountNgn = apiData?.nairaEquivalent
    ? Number(apiData.nairaEquivalent)
    : 0;
  const foreignAmount = apiData?.foreignAmount
    ? Number(apiData.foreignAmount)
    : 0;
  const isReceivedPaymentStep =
    (apiData?.status ?? "").toUpperCase() === "DISBURSEMENT_IN_PROGRESS";
  const isAwaitingDisbursement = statusKey === "AWAITING_DISBURSEMENT";

  const currency = getCurrencyByCode(payload.currencyCode);
  const flagUrl = getCurrencyFlagUrl(payload.currencyCode);
  let adminMessage: string | undefined = latestComment?.message;
  if (
    !adminMessage &&
    (statusKey === "APPROVED" ||
      statusKey === "AWAITING_DEPOSIT" ||
      statusKey === "DEPOSIT_PENDING" ||
      statusKey === "DISBURSEMENT_IN_PROGRESS")
  ) {
    adminMessage =
      "This is a message box that show the message from the SohCahToa Admin regarding the approval of this client transaction request.";
  } else if (!adminMessage && statusKey === "REJECTED") {
    adminMessage =
      "This is a message box that show the message from the SohCahToa Admin regarding the rejection of this client transaction request.";
  }

  const handleResubmitDocuments = async (documents: Array<{ documentType: string; file: FileWithPath }>) => {
    for (const document of documents) {
      const formData = new FormData();
      formData.append("documentType", document.documentType);
      formData.append("documents", document.file);
      await agentApi.transactions.uploadDocuments(id, formData);
    }
    await queryClient.invalidateQueries({
      queryKey: agentKeys.transactions.detail(id) as unknown as readonly unknown[],
    });
  }

  return (
    <div className="flex flex-col gap-4" style={{ maxWidth: 1142 }}>
      <Link
        href="/agent/transactions"
        className="inline-flex items-center gap-1 text-body-text-100 text-sm font-medium hover:text-heading-200 transition-colors w-fit"
      >
        <ChevronLeft className="w-4 h-4 shrink-0" aria-hidden />
        Back to Transactions
      </Link>

      <div className="flex flex-col rounded-2xl border border-gray-100 bg-white shadow-[0px_1px_2px_rgba(16,24,40,0.05)] overflow-hidden">
        <div className="flex md:flex-row flex-col items-start justify-between gap-4 border-b border-[#F2F4F7] md:px-8 px-4 pt-8 pb-6">
          <div className="flex flex-col gap-3 flex-1 min-w-0">
            <h1 className="font-medium text-2xl leading-8 text-[#131212] tracking-[-0.032px]">
              {title}
            </h1>
            <div className="flex flex-row items-center gap-3 flex-wrap">
              <span className="text-base font-normal leading-6 text-[#6C6969]">
                {formatHeaderDateTime(payload.date)}
              </span>
              <div style={getStatusBadge(statusLabel)} className="capitalize">{statusLabel}</div>
            </div>
            <div className="flex flex-row items-center gap-1 rounded-full border border-[#F2F4F7] py-2 px-2 w-fit">
              {flagUrl && (
                <Image src={flagUrl} alt="" width={24} height={24} className="shrink-0" />
              )}
              <span className="text-base font-medium leading-6 text-[#1F1E1E] px-1">
                {currency?.code ?? payload.currencyCode} · Currency Transacted
              </span>
            </div>
          </div>
          <div className="shrink-0 w-full md:w-auto">
            {showSettlement ? (
              <Button
                variant="outline"
                radius="xl"
                size="md"
                className="border-[#E88A58] bg-[#FFF6F1] text-[#E36C2F] hover:bg-[#FFF6F1]/90 font-medium text-base"
                onClick={() => {}}
              >
                Download Receipt
              </Button>
            ) : (
              <Button
                variant="filled"
                radius="xl"
                size="md"
                className="bg-[#DD4F05] hover:bg-[#B84204] text-white font-medium text-base"
                onClick={() => setUpdatesSheetOpen(true)}
              >
                View Updates
              </Button>
            )}
          </div>
        </div>

        <TransactionRequestSheet
          opened={updatesSheetOpen}
          onClose={() => setUpdatesSheetOpen(false)}
          transactionTypeLabel={payload.transactionTypeLabel}
          transactionStatus={apiData?.status}
          transactionId={payload.id}
          date={formatShortDate(payload.date)}
          time={formatShortTime(payload.date)}
          adminMessage={adminMessage}
          comments={apiData?.comments ?? []}
          onResubmitDocuments={handleResubmitDocuments}
          approvedActions={
            isReceivedPaymentStep ? (
                <Button
                  radius="xl"
                  fullWidth
                  className="bg-[#DD4F05] hover:bg-[#B84204] text-[#FFF6F1] h-12!"
                  onClick={() => {
                    setUpdatesSheetOpen(false);
                    setRecordDisbursementOpen(true);
                  }}
                  rightSection={<ArrowUpRight className="w-4 h-4" />}
                >
                  Record Disbursement
                </Button>
            ) : isAwaitingDisbursement ? undefined : (
              <div className="-mx-4 w-[calc(100%+2rem)] rounded-t-3xl border border-[#F2F4F7] bg-white px-4 py-6 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
                <div className="space-y-2">
                  <h4 className="text-[#323131] text-lg font-bold leading-7">Select Payment Method</h4>
                  <p className="text-[#6C6969] text-base leading-6">
                    Kindly select your preferred payment method below to continue
                  </p>
                </div>

                <div className="mt-5 space-y-4">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cash")}
                    className={`w-full rounded-lg border px-4 py-4 text-left text-sm font-medium transition-colors ${
                      paymentMethod === "cash"
                        ? "bg-[#FFF6F1] border-[#DD4F05] text-[#4D4B4B]"
                        : "bg-white border-[#E1E0E0] text-[#4D4B4B] hover:bg-[#FAFAFA]"
                    }`}
                  >
                    Cash
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("bank_transfer")}
                    className={`w-full rounded-lg border px-4 py-4 text-left text-sm font-medium transition-colors ${
                      paymentMethod === "bank_transfer"
                        ? "bg-[#FFF6F1] border-[#DD4F05] text-[#4D4B4B]"
                        : "bg-white border-[#E1E0E0] text-[#4D4B4B] hover:bg-[#FAFAFA]"
                    }`}
                  >
                    Bank Transfer
                  </button>
                </div>

                <Button
                  radius="xl"
                  fullWidth
                  className="mt-6! bg-[#DD4F05] hover:bg-[#B84204] text-[#FFF6F1] h-12!"
                  onClick={() => {
                    setUpdatesSheetOpen(false);
                    setProceedToPaymentOpen(true);
                  }}
                  rightSection={<ArrowUpRight className="w-4 h-4" />}
                >
                  Continue
                </Button>
              </div>
            )
          }
          documents={payload.documentsForSheet as TransactionDocumentItem[]}
          onOpenDocument={(doc) => {
            if (doc.url) {
              setDocumentViewer({
                url: doc.url,
                filename: doc.fileName ?? doc.name,
              });
            }
          }}
          onViewTransaction={() => setUpdatesSheetOpen(false)}
        />
        <AgentProceedToPaymentModal
          opened={proceedToPaymentOpen}
          onClose={() => setProceedToPaymentOpen(false)}
          transactionId={payload.id}
          referenceNumber={apiData?.referenceNumber ?? payload.id}
          amountNgn={amountNgn}
          initialMethod={paymentMethod}
          onSubmitted={async () => {
            await queryClient.invalidateQueries({
              queryKey: agentKeys.transactions.detail(id) as unknown as readonly unknown[],
            });
          }}
        />
        <AgentRecordDisbursementModal
          opened={recordDisbursementOpen}
          onClose={() => setRecordDisbursementOpen(false)}
          transactionId={payload.id}
          referenceNumber={apiData?.referenceNumber ?? payload.id}
          currencyCode={payload.currencyCode}
          currencySymbol={getCurrencySymbol(payload.currencyCode)}
          foreignAmount={foreignAmount}
          onSubmitted={async () => {
            await queryClient.invalidateQueries({
              queryKey: agentKeys.transactions.detail(id) as unknown as readonly unknown[],
            });
          }}
        />

        <div className="flex flex-col gap-4 pb-8">
          <SectionBlock title="Identification Details">
            <LabelText label="BVN" text={payload.identification.bvn} />
            <LabelText label="NIN" text={payload.identification.nin} />
            <LabelText label="Admission Type" text={payload.identification.admissionType} />
          </SectionBlock>
          <TransactionDetailsSection data={payload.transactionDetails} />
          <RequiredDocumentsSection
            data={payload.requiredDocuments}
            onViewDocument={(_, filename, url) => setDocumentViewer({ url, filename })}
            onDownload={(docKey) => {
              const doc = payload.requiredDocuments[docKey as keyof RequiredDocumentsData];
              if (doc && typeof doc === "object" && "url" in doc && (doc as { url?: string }).url) {
                window.open((doc as { url: string }).url, "_blank");
              }
            }}
          />
          <DocumentViewerModal
            opened={documentViewer !== null}
            onClose={() => setDocumentViewer(null)}
            fileUrl={documentViewer?.url ?? null}
            filename={documentViewer?.filename}
          />
          {showPaymentDetails &&
            payload.paymentDetails &&
            payload.paymentDetails.inflows.length > 0 && (
              <PaymentDetailsSection
                key={`${payload.id}-pd-${payload.paymentDetails.inflows.map((r) => r.id).join(",")}`}
                data={payload.paymentDetails}
              />
            )}
          {showSettlement && payload.settlement && (
            <TransactionSettlementSection
              data={payload.settlement}
              onDownloadReceipt={() => {}}
            />
          )}
        </div>
      </div>
    </div>
  );
}
