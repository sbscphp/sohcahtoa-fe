"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import Image from "next/image";
import { Button } from "@mantine/core";
import {
  getDetailViewStatus,
  getDetailViewStatusLabel,
  type DetailViewStatus,
} from "@/app/(customer)/_lib/transaction-details";
import { getStatusBadge } from "@/app/(customer)/_utils/status-badge";
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

// Simulated API response – full shape; transaction type label comes from backend.
function getMockTransactionDetail(id: string): TransactionDetailPayload | null {
  const base = {
    id,
    date: "2025-11-17T13:00:00",
    type: "PTA",
    transactionTypeLabel: "Personal Travel Allowance (PTA)",
    currencyCode: "USD",
    transactionDetails: {
      transactionId: "2223334355",
      amount: { code: "NGN", formatted: "400,000.00" },
      equivalentAmount: { code: "USD", formatted: "400" },
      dateInitiated: "25 Jun 2025",
      pickupAddress: "3, Adeola Odeku, VI, Lagos",
    },
    requiredDocuments: {
      bvn: "2223334355",
      tin: "876r245623",
      formAId: "23456786543",
      formA: { filename: "Doc.pdf" },
      utilityBill: { filename: "Doc.pdf" },
      visa: { filename: "Doc.pdf" },
      returnTicket: { filename: "Doc.pdf" },
    },
  };

  // First two IDs: settled (all sections). Rest: under_review then awaiting_disbursement.
  const settled: TransactionDetailPayload = {
    ...base,
    stage: "Transaction Settlement",
    status: "Completed",
    paymentDetails: {
      transactionId: "783383AXSH",
      transactionDate: "15 Nov 2025",
      transactionTime: "11:00 am",
      transactionReceipt: { filename: "payment-receipt.pdf" },
      paidTo: "SohCahToa BSC\nAccess Bank\n0069000592",
    },
    settlement: {
      settlementId: "278338233AC",
      settlementDate: "17 Nov 2025",
      settlementTime: "1:00 pm",
      settlementReceipt: { filename: "settlement-receipt.pdf" },
      settlementStructureCash: "25% ~ $375",
      settlementStructurePrepaidCard: "75% ~ $1,125",
      paidInto: "GTB Bank Card\n11 ******** 6773",
      settlementStatus: "Completed",
    },
  };

  const awaiting: TransactionDetailPayload = {
    ...base,
    date: "2025-11-15T11:00:00",
    type: "Medical",
    transactionTypeLabel: "Medical",
    stage: "Awaiting Disbursement",
    status: "Approved",
    paymentDetails: {
      transactionId: "783383AXSH",
      transactionDate: "15 Nov 2025",
      transactionTime: "11:00 am",
      transactionReceipt: { filename: "payment-receipt.pdf" },
      paidTo: "SohCahToa BSC\nAccess Bank\n0069000592",
    },
  };

  const underReview: TransactionDetailPayload = {
    ...base,
    date: "2025-01-24T11:00:00",
    stage: "Documentation",
    status: "Pending",
  };

  const btaSettled: TransactionDetailPayload = {
    ...settled,
    type: "BTA",
    transactionTypeLabel: "Business Travel Allowance (BTA)",
  };

  const map: Record<string, TransactionDetailPayload> = {
    GHA67AGHA1: underReview,
    GHA67AGHA2: settled,
    GHA67AGHA3: awaiting,
    GHA67AGHA8: btaSettled,
  };
  return map[id] ?? settled;
}

export default function TransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";

  const [updatesSheetOpen, setUpdatesSheetOpen] = useState(false);
  const payload = useMemo(() => getMockTransactionDetail(id), [id]);
  const viewStatus: DetailViewStatus = useMemo(
    () =>
      payload
        ? getDetailViewStatus(payload.stage, payload.status)
        : "under_review",
    [payload]
  );

  const formatHeaderDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const date = d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    const time = d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return `${date} | ${time}`;
  };

  if (!payload) {
    return (
      <div className="p-8">
        <p className="text-[#6C6969]">Transaction not found.</p>
        <Button variant="subtle" onClick={() => router.push("/transactions")} mt="md">
          Back to Transactions
        </Button>
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
    <div
      className="flex flex-col rounded-2xl border border-[#F2F4F7] bg-white shadow-[0px_1px_2px_rgba(16,24,40,0.05)] overflow-hidden"
      style={{ maxWidth: 1142 }}
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
              {formatHeaderDate(payload.date)}
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
              style={{ fontFamily: "'Inter', sans-serif", padding: "14px 24px" }}
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
              style={{ fontFamily: "'Inter', sans-serif", padding: "14px 24px" }}
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
      />

      {/* Sections */}
      <div className="flex flex-col gap-4 pb-8">
        <TransactionDetailsSection data={payload.transactionDetails} />
        <RequiredDocumentsSection
          data={payload.requiredDocuments}
          onDownload={(doc, filename) => {
            console.log("Download", doc, filename);
          }}
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
  );
}
