"use client";

import { useMemo } from "react";
import { useFetchData } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import {
  adminApi,
  type AdminTransactionDetailsData,
} from "@/app/admin/_services/admin-api";
import type { ApiResponse } from "@/app/_lib/api/client";

type TransactionType =
  | "PTA"
  | "BTA"
  | "SCHOOL_FEES"
  | "MEDICAL"
  | "PROFESSIONAL_BODY"
  | "TOURIST_FX"
  | "RESIDENT_FX"
  | "EXPATRIATE_FX"
  | "IMTO_REMITTANCE"
  | "CASH_REMITTANCE";

export interface OverviewField {
  label: string;
  value: string;
}

export interface OverviewSection {
  title: string;
  fields: OverviewField[];
}

export interface TransactionOverviewViewModel {
  id: string;
  reference: string;
  titlePrefix: string;
  titleValue: string;
  dateLabel: string;
  timeLabel: string;
  statusLabel: string;
  basicDetails: OverviewField[];
  sections: OverviewSection[];
  isEmpty: boolean;
}

export interface TransactionDocumentViewModel {
  title: string;
  fileName: string;
  fileSize: string;
  url: string;
}

export interface TransactionActionDocumentViewModel {
  id: string;
  title: string;
  fileName: string;
  fileSize: string;
  url: string;
  documentType: string;
  verificationStatus: string;
}

export interface TransactionReceiptViewModel {
  titlePrefix: string;
  titleValue: string;
  dateLabel: string;
  timeLabel: string;
  statusLabel: string;
  fields: OverviewField[];
  document: TransactionDocumentViewModel | null;
  isEmpty: boolean;
}

export interface TransactionSettlementViewModel {
  titlePrefix: string;
  titleValue: string;
  dateLabel: string;
  timeLabel: string;
  statusLabel: string;
  fields: OverviewField[];
  receipt: TransactionDocumentViewModel | null;
  isEmpty: boolean;
}

const LABEL_BY_TYPE: Partial<Record<TransactionType, string>> = {
  PTA: "Personal Travel Allowance",
  BTA: "Business Travel Allowance",
  SCHOOL_FEES: "School Fees",
  MEDICAL: "Medical Fees",
  PROFESSIONAL_BODY: "Professional Body",
  TOURIST_FX: "Tourist",
  RESIDENT_FX: "Resident",
  EXPATRIATE_FX: "Expatriate",
  IMTO_REMITTANCE: "IMTO Remittance",
  CASH_REMITTANCE: "Cash Remittance",
};

const SECTION_TITLE_BY_TYPE: Partial<Record<TransactionType, string>> = {
  PTA: "PTA Transaction Details",
  BTA: "BTA Transaction Details",
  SCHOOL_FEES: "School Fee Transaction Details",
  MEDICAL: "Medical Fee Transaction Details",
  PROFESSIONAL_BODY: "Professional Fee Transaction Details",
  TOURIST_FX: "Tourist Transaction Details",
  RESIDENT_FX: "Resident Transaction Details",
  EXPATRIATE_FX: "Expatriate Transaction Details",
  IMTO_REMITTANCE: "IMTO Remittance Details",
  CASH_REMITTANCE: "Cash Remittance Details",
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
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
  if (typeof value === "number") {
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

function formatFileSize(value: unknown): string {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    if (value >= 1024 * 1024) {
      return `${(value / (1024 * 1024)).toFixed(1)} MB`;
    }
    return `${Math.max(1, Math.round(value / 1024))} KB`;
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (!Number.isNaN(parsed) && parsed > 0) {
      return formatFileSize(parsed);
    }
  }
  return "--";
}

function hasRecordValues(value: Record<string, unknown>): boolean {
  return Object.keys(value).length > 0;
}

function buildHeaderData(data: AdminTransactionDetailsData, raw: Record<string, unknown>) {
  const transactionType = (data.transactionType || "") as TransactionType;
  return {
    titlePrefix: pickString(data.fxType, formatEnum(raw.transactionMode), "Transaction"),
    titleValue: LABEL_BY_TYPE[transactionType] ?? formatEnum(data.transactionType),
    dateLabel: formatDate(data.date),
    timeLabel: formatTime(data.time),
    statusLabel: pickString(formatEnum(data.requestStatus), formatEnum(raw.status), "--"),
  };
}

function buildOverview(data: AdminTransactionDetailsData | null): TransactionOverviewViewModel | null {
  if (!data) return null;

  const transactionType = (data.transactionType || "") as TransactionType;
  const details = asRecord(data.details);
  const raw = asRecord(data.raw);
  const cashPickup = asRecord(raw.cashPickup);
  const receipt = asRecord(raw.receipt);
  const beneficiary = asRecord(raw.beneficiary);
  const stepData = asRecord(
    asRecord((Array.isArray(raw.steps) ? raw.steps[0] : undefined)?.data)
  );

  const header = buildHeaderData(data, raw);

  const basicDetails: OverviewField[] = [
    { label: "Customer Name", value: pickString(data.customerName) },
    { label: "Transaction ID", value: pickString(data.reference, data.id) },
    { label: "Transaction Date", value: formatDate(data.date) },
    { label: "Transaction Time", value: formatTime(data.time) },
    { label: "Transaction Type", value: formatEnum(data.transactionType) },
    { label: "FX Type", value: pickString(data.fxType) },
    { label: "Transaction Stage", value: formatEnum(data.transactionStage) },
    { label: "Workflow Stage", value: formatEnum(data.workflowStage) },
    {
      label: "Request Status",
      value: pickString(formatEnum(data.requestStatus), formatEnum(raw.status), "--"),
    },
    { label: "Customer Type", value: formatEnum(data.customerType) },
  ];

  const commonFields: OverviewField[] = [
    { label: "Transaction Value (FX)", value: formatAmount(details.transactionValueFx) },
    { label: "Transaction Value (₦)", value: formatAmount(details.transactionValueNgn, "₦") },
    { label: "Requestor Type", value: pickString(details.requesterType) },
    {
      label: "BVN Number",
      value: pickString(details.bvnNumber, stepData.bvn, stepData.nin),
    },
    { label: "TIN Number", value: pickString(raw.taxClearanceNumber) },
    { label: "Form A ID", value: pickString(raw.formAId) },
    { label: "No. of Documents", value: pickString(details.numberOfDocuments) },
    {
      label: "Admission Type",
      value: pickString(raw.admissionType, stepData.admissionType),
    },
    { label: "Pick Up State", value: pickString(cashPickup.pickupState, stepData.pickupState) },
    { label: "Pick Up City", value: pickString(cashPickup.pickupCity, stepData.pickupCity) },
    {
      label: "Pickup Location",
      value: pickString(
        details.pickupLocation,
        cashPickup.pickupLocation,
        asRecord(stepData.pickupLocation).name,
        asRecord(stepData.pickupLocation).address
      ),
    },
  ];

  const baseTitle = SECTION_TITLE_BY_TYPE[transactionType] ?? "Transaction Details";
  const primarySection: OverviewSection = {
    title: baseTitle,
    fields: commonFields.filter((item) => item.value !== "--"),
  };

  const needsBeneficiarySection =
    transactionType === "SCHOOL_FEES" ||
    transactionType === "MEDICAL" ||
    transactionType === "PROFESSIONAL_BODY";

  const beneficiarySection: OverviewSection = {
    title:
      transactionType === "SCHOOL_FEES"
        ? "School Fee Beneficiary Details"
        : transactionType === "MEDICAL"
          ? "Medical Fee Beneficiary Details"
          : "Professional Fee Beneficiary Details",
    fields: [
      { label: "Bank Name", value: pickString(beneficiary.bankName, receipt.bankName, raw.bankName) },
      {
        label: "Account Name",
        value: pickString(
          beneficiary.accountName,
          receipt.accountName,
          raw.accountName,
          raw.beneficiaryName
        ),
      },
      {
        label: "Account Number",
        value: pickString(beneficiary.accountNumber, receipt.accountNumber, raw.accountNumber),
      },
      { label: "IBAN Number", value: pickString(beneficiary.ibanNumber, receipt.ibanNumber, raw.ibanNumber) },
    ].filter((item) => item.value !== "--"),
  };

  const sections = [primarySection];
  if (needsBeneficiarySection && beneficiarySection.fields.length > 0) {
    sections.push(beneficiarySection);
  }

  const nonEmptySections = sections.filter((section) => section.fields.length > 0);

  return {
    id: data.id || "--",
    reference: data.reference || data.id || "--",
    titlePrefix: header.titlePrefix,
    titleValue: header.titleValue,
    dateLabel: header.dateLabel,
    timeLabel: header.timeLabel,
    statusLabel: header.statusLabel,
    basicDetails,
    sections: nonEmptySections,
    isEmpty: nonEmptySections.length === 0,
  };
}

function extractReceiptDocument(raw: Record<string, unknown>): TransactionDocumentViewModel | null {
  const receipt = asRecord(raw.receipt);
  const documents = Array.isArray(raw.documents)
    ? raw.documents.filter((item) => item && typeof item === "object")
    : [];

  const receiptDocumentFromList =
    (documents
      .map((item) => asRecord(item))
      .find((item) => asString(item.documentType).toUpperCase() === "RECEIPT") as
      | Record<string, unknown>
      | undefined) ?? null;

  const source = hasRecordValues(receipt) ? receipt : (receiptDocumentFromList ?? {});
  if (!hasRecordValues(source)) return null;

  const url = pickString(source.fileUrl, source.url);
  if (url === "--") return null;

  return {
    title: pickString(source.title, source.documentType, "Receipt of Payment"),
    fileName: pickString(source.fileName, "receipt"),
    fileSize: formatFileSize(source.fileSize),
    url,
  };
}

function buildReceipt(data: AdminTransactionDetailsData | null): TransactionReceiptViewModel | null {
  if (!data) return null;

  const raw = asRecord(data.raw);
  const details = asRecord(data.details);
  const receipt = asRecord(raw.receipt);
  const header = buildHeaderData(data, raw);
  const document = extractReceiptDocument(raw);

  const fields: OverviewField[] = [
    {
      label: "Total payable",
      value:
        formatAmount(receipt.totalPayable, "₦") !== "--"
          ? formatAmount(receipt.totalPayable, "₦")
          : formatAmount(details.transactionValueNgn, "₦"),
    },
    {
      label: "Receipt Transaction ID",
      value: pickString(receipt.transactionId, receipt.id, data.reference, data.id),
    },
    { label: "Date", value: formatDate(receipt.createdAt ?? data.date) },
    { label: "Time", value: formatTime(receipt.createdAt ?? data.time) },
  ].filter((item) => item.value !== "--");

  const hasContent = fields.length > 0 || Boolean(document);

  return {
    titlePrefix: header.titlePrefix,
    titleValue: header.titleValue,
    dateLabel: header.dateLabel,
    timeLabel: header.timeLabel,
    statusLabel: header.statusLabel,
    fields,
    document,
    isEmpty: !hasContent,
  };
}

function buildSettlement(data: AdminTransactionDetailsData | null): TransactionSettlementViewModel | null {
  if (!data) return null;

  const raw = asRecord(data.raw);
  const details = asRecord(data.details);
  const cashPickup = asRecord(raw.cashPickup);
  const receipt = asRecord(raw.receipt);
  const header = buildHeaderData(data, raw);

  const prepaidCard = asRecord(raw.prepaidCard);
  const prepaidCardSummary =
    pickString(prepaidCard.bankName) !== "--" ||
    pickString(prepaidCard.maskedPan) !== "--" ||
    pickString(prepaidCard.accountName) !== "--"
      ? `${pickString(prepaidCard.bankName)} | ${pickString(prepaidCard.maskedPan)} | ${pickString(prepaidCard.accountName)}`
      : "--";

  const fields: OverviewField[] = [
    { label: "Settlement ID", value: pickString(cashPickup.id, receipt.id) },
    { label: "Settled By", value: pickString(raw.settledBy, receipt.settledBy) },
    { label: "Settlement Date", value: formatDate(cashPickup.pickedUpAt ?? cashPickup.updatedAt) },
    { label: "Settlement Time", value: formatTime(cashPickup.pickedUpAt ?? cashPickup.updatedAt) },
    { label: "Total Settlement (FX)", value: formatAmount(details.transactionValueFx) },
    { label: "Total Settlement (₦)", value: formatAmount(details.transactionValueNgn, "₦") },
    {
      label: "Settlement Structure (Cash)",
      value:
        pickString(cashPickup.amount) !== "--"
          ? `${pickString(cashPickup.amount)} ${pickString(cashPickup.currency)}`
          : "--",
    },
    { label: "Settlement Structure (Prepaid Card)", value: prepaidCardSummary },
    { label: "Settlement Status", value: formatEnum(cashPickup.status ?? raw.status) },
  ].filter((item) => item.value !== "--");

  const settlementReceipt: TransactionDocumentViewModel | null =
    pickString(receipt.fileUrl) !== "--"
      ? {
          title: pickString(receipt.title, "Settlement Receipt"),
          fileName: pickString(receipt.fileName, "settlement-receipt"),
          fileSize: formatFileSize(receipt.fileSize),
          url: pickString(receipt.fileUrl),
        }
      : null;

  const hasContent =
    fields.length > 0 || Boolean(settlementReceipt) || hasRecordValues(cashPickup);

  return {
    titlePrefix: header.titlePrefix,
    titleValue: header.titleValue,
    dateLabel: header.dateLabel,
    timeLabel: header.timeLabel,
    statusLabel: header.statusLabel,
    fields,
    receipt: settlementReceipt,
    isEmpty: !hasContent,
  };
}

function extractActionDocuments(
  raw: Record<string, unknown>
): TransactionActionDocumentViewModel[] {
  const documents = Array.isArray(raw.documents)
    ? raw.documents.filter((item) => item && typeof item === "object")
    : [];

  return documents
    .map((item) => asRecord(item))
    .map((source): TransactionActionDocumentViewModel | null => {
      const id = pickString(source.id, source.documentId, source.uuid);
      const url = pickString(source.fileUrl, source.url);
      if (id === "--" || url === "--") return null;

      return {
        id,
        title: pickString(
          source.title,
          source.documentName,
          source.fileName,
          source.documentType,
          "Document"
        ),
        fileName: pickString(source.fileName, source.documentName, "document"),
        fileSize: formatFileSize(source.fileSize),
        url,
        documentType: formatEnum(source.documentType),
        verificationStatus: pickString(
          formatEnum(source.verificationStatus),
          formatEnum(source.status),
          "No Action"
        ),
      };
    })
    .filter((item): item is TransactionActionDocumentViewModel => Boolean(item));
}

export function useTransactionDetails(transactionId?: string) {
  const query = useFetchData<ApiResponse<AdminTransactionDetailsData>>(
    [...adminKeys.transactions.detail(transactionId ?? "")],
    () =>
      adminApi.transactions.getById(transactionId ?? "") as unknown as Promise<
        ApiResponse<AdminTransactionDetailsData>
      >,
    Boolean(transactionId)
  );

  const overview = useMemo(() => buildOverview(query.data?.data ?? null), [query.data?.data]);
  const receipt = useMemo(() => buildReceipt(query.data?.data ?? null), [query.data?.data]);
  const settlement = useMemo(() => buildSettlement(query.data?.data ?? null), [query.data?.data]);
  const actionDocuments = useMemo(
    () => extractActionDocuments(asRecord(query.data?.data?.raw)),
    [query.data?.data?.raw]
  );

  return {
    overview,
    receipt,
    settlement,
    actionDocuments,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
