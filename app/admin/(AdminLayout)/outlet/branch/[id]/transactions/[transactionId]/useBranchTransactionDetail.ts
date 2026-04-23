"use client";

import { useMemo } from "react";
import { useFetchData } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import {
  adminApi,
  type AdminTransactionDetailsData,
} from "@/app/admin/_services/admin-api";
import type { ApiResponse } from "@/app/_lib/api/client";

export interface BranchTxDocumentItem {
  label: string;
  fileName: string;
  fileUrl: string;
}

export interface BranchTxDocumentsSection {
  title: string;
  bvnNumber: string;
  tinNumber: string;
  formAId: string;
  statusLabel: string;
  documents: BranchTxDocumentItem[];
}

export interface BranchTxReceiptDocument {
  fileName: string;
  fileUrl: string;
}

export interface BranchTxDetailsSection {
  reference: string;
  transactionDate: string;
  transactionTime: string;
  amountNgn: string;
  amountFx: string;
  paymentStatusLabel: string;
  receiptDocument: BranchTxReceiptDocument | null;
}

export interface BranchTxBeneficiarySection {
  bankName: string;
  accountName: string;
  accountNumber: string;
  ibanNumber: string;
  disbursementDate: string;
  transactionReceiptDocument: BranchTxReceiptDocument | null;
  hasData: boolean;
}

// ─── Formatting helpers ───────────────────────────────────────────────────────

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function pickString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value;
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return "--";
}

function formatEnum(value: unknown): string {
  const source = String(value ?? "").trim();
  if (!source) return "--";
  return source
    .replace(/[_-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function formatDate(value: unknown): string {
  const source = String(value ?? "").trim();
  if (!source) return "--";
  const parsed = new Date(source);
  if (Number.isNaN(parsed.getTime())) return source;
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(value: unknown): string {
  const source = String(value ?? "").trim();
  if (!source) return "--";
  const parsed = new Date(source);
  if (Number.isNaN(parsed.getTime())) return source;
  return parsed.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatAmount(value: unknown, prefix = ""): string {
  if (typeof value === "number" && Number.isFinite(value)) {
    return `${prefix}${value.toLocaleString("en-US")}`;
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) {
      return `${prefix}${parsed.toLocaleString("en-US")}`;
    }
    return `${prefix}${value}`;
  }
  return "--";
}

// ─── Document type label map ──────────────────────────────────────────────────

const DOCUMENT_LABEL_MAP: Record<string, string> = {
  PASSPORT: "International Passport",
  VISA: "Visa",
  FORM_A_DOCUMENT: "Form A",
  RETURN_TICKET: "Return Ticket",
  CAC: "CAC",
  UTILITY_BILL: "Utility Bill",
  ADMISSION_LETTER: "Admission Letter",
  SCHOOL_FEE_INVOICE: "School Fee Invoice",
  MEDICAL_REPORT: "Medical Report",
  NIN: "NIN",
  BVN: "BVN Document",
  BANK_STATEMENT: "Bank Statement",
  LETTER_OF_EMPLOYMENT: "Letter of Employment",
  PROFESSIONAL_CERTIFICATE: "Professional Certificate",
};

function getDocumentLabel(documentType: unknown): string {
  const key = String(documentType ?? "").toUpperCase();
  return DOCUMENT_LABEL_MAP[key] ?? formatEnum(documentType);
}

// ─── Section title by transaction type ───────────────────────────────────────

const SECTION_TITLE_BY_TYPE: Record<string, string> = {
  PTA: "PTA Documents",
  BTA: "BTA Documents",
  SCHOOL_FEES: "School Fee Documents",
  MEDICAL: "Medical Fee Documents",
  PROFESSIONAL_BODY: "Professional Body Documents",
  TOURIST_FX: "Tourist FX Documents",
  RESIDENT_FX: "Resident FX Documents",
  EXPATRIATE_FX: "Expatriate FX Documents",
  IMTO_REMITTANCE: "IMTO Remittance Documents",
  CASH_REMITTANCE: "Cash Remittance Documents",
};

// ─── View model builders ──────────────────────────────────────────────────────

function buildDocumentsSection(
  data: AdminTransactionDetailsData
): BranchTxDocumentsSection {
  const details = asRecord(data.details);
  const raw = asRecord(data.raw);
  const steps = Array.isArray(raw.steps) ? raw.steps : [];
  const stepData = asRecord(asRecord(steps[0])?.data);

  const title =
    SECTION_TITLE_BY_TYPE[data.transactionType?.toUpperCase() ?? ""] ??
    `${formatEnum(data.transactionType)} Documents`;

  const rawDocuments = Array.isArray(raw.documents)
    ? raw.documents.filter((item) => item && typeof item === "object")
    : [];

  const documents: BranchTxDocumentItem[] = rawDocuments
    .map((item) => {
      const doc = asRecord(item);
      const fileUrl = pickString(doc.fileUrl, doc.url);
      if (fileUrl === "--") return null;
      return {
        label: getDocumentLabel(doc.documentType),
        fileName: pickString(doc.fileName, doc.documentName, "document"),
        fileUrl,
      };
    })
    .filter((item): item is BranchTxDocumentItem => Boolean(item));

  return {
    title,
    bvnNumber: pickString(details.bvnNumber, stepData.bvn),
    tinNumber: pickString(raw.taxClearanceNumber),
    formAId: pickString(raw.formAId, stepData.formAId),
    statusLabel: pickString(
      formatEnum(data.requestStatus),
      formatEnum(raw.status)
    ),
    documents,
  };
}

function buildTxDetailsSection(
  data: AdminTransactionDetailsData
): BranchTxDetailsSection {
  const details = asRecord(data.details);
  const raw = asRecord(data.raw);
  const receipt = asRecord(raw.receipt);

  const currency = pickString(raw.currency, details.transactionCurrency);
  const amountFxRaw = formatAmount(details.transactionValueFx);
  const amountFx =
    amountFxRaw !== "--" && currency !== "--"
      ? `${currency} ${amountFxRaw}`
      : amountFxRaw;

  const receiptFileUrl = pickString(receipt.fileUrl, receipt.url);
  const receiptDocument: BranchTxReceiptDocument | null =
    receiptFileUrl !== "--"
      ? {
          fileName: pickString(receipt.fileName, "receipt"),
          fileUrl: receiptFileUrl,
        }
      : null;

  return {
    reference: pickString(data.reference, data.id),
    transactionDate: formatDate(data.date),
    transactionTime: formatTime(data.time),
    amountNgn: formatAmount(details.transactionValueNgn, "₦"),
    amountFx,
    paymentStatusLabel: pickString(
      formatEnum(data.requestStatus),
      formatEnum(raw.status)
    ),
    receiptDocument,
  };
}

function buildBeneficiarySection(
  data: AdminTransactionDetailsData
): BranchTxBeneficiarySection {
  const raw = asRecord(data.raw);
  const beneficiary = asRecord(raw.beneficiary);
  const receipt = asRecord(raw.receipt);
  const cashPickup = asRecord(raw.cashPickup);

  const bankName = pickString(
    beneficiary.bankName,
    receipt.bankName,
    raw.bankName
  );
  const accountName = pickString(
    beneficiary.accountName,
    receipt.accountName,
    raw.accountName,
    raw.beneficiaryName
  );
  const accountNumber = pickString(
    beneficiary.accountNumber,
    receipt.accountNumber,
    raw.accountNumber
  );
  const ibanNumber = pickString(
    beneficiary.ibanNumber,
    receipt.ibanNumber,
    raw.ibanNumber
  );
  const disbursementDate = formatDate(
    cashPickup.pickedUpAt ?? cashPickup.completedAt ?? cashPickup.updatedAt
  );

  const receiptFileUrl = pickString(receipt.fileUrl, receipt.url);
  const transactionReceiptDocument: BranchTxReceiptDocument | null =
    receiptFileUrl !== "--"
      ? {
          fileName: pickString(receipt.fileName, "transaction-receipt"),
          fileUrl: receiptFileUrl,
        }
      : null;

  const hasData =
    [bankName, accountName, accountNumber, ibanNumber].some(
      (v) => v !== "--"
    ) ||
    disbursementDate !== "--" ||
    Boolean(transactionReceiptDocument);

  return {
    bankName,
    accountName,
    accountNumber,
    ibanNumber,
    disbursementDate,
    transactionReceiptDocument,
    hasData,
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useBranchTransactionDetail(transactionId?: string) {
  const query = useFetchData<ApiResponse<AdminTransactionDetailsData>>(
    [...adminKeys.transactions.detail(transactionId ?? "")],
    () =>
      adminApi.transactions.getById(transactionId ?? "") as unknown as Promise<
        ApiResponse<AdminTransactionDetailsData>
      >,
    Boolean(transactionId)
  );

  const data = query.data?.data ?? null;

  const documentsSection = useMemo(
    () => (data ? buildDocumentsSection(data) : null),
    [data]
  );

  const txDetailsSection = useMemo(
    () => (data ? buildTxDetailsSection(data) : null),
    [data]
  );

  const beneficiarySection = useMemo(
    () => (data ? buildBeneficiarySection(data) : null),
    [data]
  );

  return {
    documentsSection,
    txDetailsSection,
    beneficiarySection,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
