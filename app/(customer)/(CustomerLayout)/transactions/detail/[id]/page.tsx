"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useMemo, useState } from "react";
import Image from "next/image";
import { Button } from "@mantine/core";
import { ChevronLeft } from "lucide-react";
import {
  getDetailViewStatus,
  getDetailViewStatusLabel,
  type DetailViewStatus,
} from "@/app/(customer)/_lib/transaction-details";
import { getStatusBadge } from "@/app/(customer)/_utils/status-badge";
import { useFetchSingleData } from "@/app/_lib/api/hooks";
import { customerKeys } from "@/app/_lib/api/query-keys";
import { customerApi } from "@/app/(customer)/_services/customer-api";
import { buildDetailPayloadFromApi } from "@/app/(customer)/_utils/transaction-detail-payload";
import { getCurrencyFlagUrl, getCurrencyByCode } from "@/app/(customer)/_lib/currency";
import {
  TransactionDetailsSection,
  RequiredDocumentsSection,
  PaymentDetailsSection,
  TransactionSettlementSection,
  type TransactionDetailsData,
  type RequiredDocumentsData,
  type PaymentDetailsData,
  type TransactionSettlementData,
} from "@/app/(customer)/_components/transactions/details";
import TransactionRequestSheet from "@/app/(customer)/_components/transactions/TransactionRequestSheet";
import DocumentViewerModal from "@/app/(customer)/_components/modals/DocumentViewerModal";
import Loader from "@/components/loader";
import { formatHeaderDateTime, formatShortDate, formatShortTime } from "@/app/utils/helper/formatLocalDate";
import EmptyState from "@/app/admin/_components/EmptyState";

/** Full detail payload for a transaction (from API). Type/label come from backend. */
export interface TransactionDetailPayload {
  id: string;
  date: string;
  /** Transaction type code (e.g. from API) – not used for display. */
  type: string;
  /** Display title for the transaction type – from API (e.g. "Personal Travel Allowance (PTA)"). */
  transactionTypeLabel: string;
  stage: string;
  status: string;
  currencyCode: string;
  transactionDetails: TransactionDetailsData;
  requiredDocuments: RequiredDocumentsData;
  paymentDetails?: PaymentDetailsData;
  settlement?: TransactionSettlementData;
}

export default function TransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";

  const { data: apiResponse, isLoading: apiLoading } = useFetchSingleData(
    [...customerKeys.transactions.detail(id)],
    () => customerApi.transactions.getById(id),
    !!id
  );

  const apiData = apiResponse?.data;
  const payload = useMemo(
    () => (apiData ? buildDetailPayloadFromApi(apiData) : null),
    [apiData]
  );

  const [updatesSheetOpen, setUpdatesSheetOpen] = useState(false);
  const [documentViewer, setDocumentViewer] = useState<{ url: string; filename: string } | null>(null);
  const viewStatus: DetailViewStatus = useMemo(
    () =>
      payload
        ? getDetailViewStatus(payload.stage, payload.status)
        : "under_review",
    [payload]
  );

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
        <EmptyState title="Transaction not found" description="The transaction you are looking for does not exist." onClick={() => router.push("/transactions")} buttonText="Back to Transactions" />
      </div>
    );
  }

  const title = payload.transactionTypeLabel;
  const statusLabel = getDetailViewStatusLabel(viewStatus);
  const showPaymentDetails = viewStatus !== "under_review";
  const showSettlement = viewStatus === "transaction_settled";
  const currency = getCurrencyByCode(payload.currencyCode);
  const flagUrl = getCurrencyFlagUrl(payload.currencyCode);

  return (
    <div className="flex flex-col gap-4" style={{ maxWidth: 1142 }}>
      <Link
        href="/transactions"
        className="inline-flex items-center gap-1 text-body-text-100 text-sm font-medium hover:text-heading-200 transition-colors w-fit"
      >
        <ChevronLeft className="w-4 h-4 shrink-0" aria-hidden />
        Back to Transactions
      </Link>

      <div
        className="flex flex-col rounded-2xl border border-gray-100 bg-white shadow-[0px_1px_2px_rgba(16,24,40,0.05)] overflow-hidden"
      >
      {/* Header */}
      <div className="flex flex-row flex-wrap items-start justify-between gap-4 border-b border-[#F2F4F7] px-8 pt-8 pb-6">
        <div className="flex flex-col gap-3 flex-1 min-w-0">
          <h1
            className="font-medium text-2xl leading-8 text-[#131212] tracking-[-0.032px]"
          >
            {title}
          </h1>
          <div className="flex flex-row items-center gap-3 flex-wrap">
            <span
              className="text-base font-normal leading-6 text-[#6C6969]"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {formatHeaderDateTime(payload.date)}
            </span>
            <div style={getStatusBadge(statusLabel)}>{statusLabel}</div>
          </div>
          <div className="flex flex-row items-center gap-1 rounded-full border border-[#F2F4F7] py-2 px-2 w-fit">
            {flagUrl && (
              <Image src={flagUrl} alt="" width={24} height={24} className="shrink-0" />
            )}
            <span
              className="text-base font-medium leading-6 text-[#1F1E1E] px-1"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {currency?.code ?? payload.currencyCode} · Currency Transacted
            </span>
          </div>
        </div>
        <div className="shrink-0">
          {showSettlement ? (
            <Button
              variant="outline"
              radius="xl"
              size="md"
              className="border-[#E88A58] bg-[#FFF6F1] text-[#E36C2F] hover:bg-[#FFF6F1]/90 font-medium text-base"
              style={{ fontWeight: 500, fontSize: "14px" }}
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
              style={{ fontWeight: 500, fontSize: "14px" }}
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
        viewStatus={viewStatus}
        transactionTypeLabel={payload.transactionTypeLabel}
        transactionId={payload.id}
        date={formatShortDate(payload.date)}
        time={formatShortTime(payload.date)}
        adminMessage={
          viewStatus === "approved"
            ? "This is a message box that show the message from the SohCahToa Admin regarding the approval of this client transaction request. As this is approved, this customer would then be able to take an action from this point"
            : viewStatus === "rejected"
            ? "This is a message box that show the message from the SohCahToa Admin regarding the rejection of this client transaction request. As this is rejected, they can't take any action from this point at all"
            : undefined
        }
        onProceedToPayment={() => {
          console.log("Proceed to payment");
          // Navigate to payment page or open payment modal
        }}
        onViewTransaction={() => setUpdatesSheetOpen(false)}
      />

      {/* Sections */}
      <div className="flex flex-col gap-4 pb-8">
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
        {showPaymentDetails && payload.paymentDetails && (
          <PaymentDetailsSection
            data={payload.paymentDetails}
            onDownloadReceipt={() => {}}
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
