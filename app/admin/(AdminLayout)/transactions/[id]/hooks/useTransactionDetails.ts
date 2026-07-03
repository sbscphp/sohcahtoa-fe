"use client";

import { useMemo } from "react";
import { useFetchData } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import {
  adminApi,
  type AdminTransactionApprovalProcess,
  type AdminTransactionApprovalWorkflowStage,
  type AdminTransactionDetailsData,
} from "@/app/admin/_services/admin-api";
import type { ApiResponse } from "@/app/_lib/api/client";
import { getCurrencyByCode } from "@/app/admin/_lib/currency";
import { toSentenceCase } from "@/app/utils/helper/toSentence";
import { adminRoutes } from "@/lib/adminRoutes";
import {
  beneficiaryDetailSectionTitle,
  hasDetailRecordEntries,
} from "@/app/(customer)/_lib/resolve-transaction-payout-display";

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
  href?: string;
  route?: string;
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

export interface TransactionWorkflowHistoryItemViewModel {
  id: string;
  actorLabel: string;
  actionLabel: string;
  statusLabel: string;
  date: string;
  time: string;
  comment: string;
  documentType: string;
}

export interface TransactionApprovalUiViewModel {
  isApprovalOfficer: boolean;
  canActOnTransactionFooter: boolean;
  approvalState?: string;
  approvalProcessName?: string;
  approvalType?: string;
}

export interface UseTransactionDetailsOptions {
  adminUserId?: string;
}

export function isRefundApprovalType(approvalType?: string | null): boolean {
  return approvalType?.trim().toLowerCase() === "refund";
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

const BENEFICIARY_SECTION_TITLE_BY_TYPE: Partial<Record<TransactionType, string>> = {
  PTA: "PTA Beneficiary Details",
  BTA: "BTA Beneficiary Details",
  SCHOOL_FEES: "School Fee Beneficiary Details",
  MEDICAL: "Medical Fee Beneficiary Details",
  PROFESSIONAL_BODY: "Professional Fee Beneficiary Details",
  TOURIST_FX: "Tourist Beneficiary Details",
  RESIDENT_FX: "Resident Beneficiary Details",
  EXPATRIATE_FX: "Expatriate Beneficiary Details",
  IMTO_REMITTANCE: "IMTO Remittance Beneficiary Details",
  CASH_REMITTANCE: "Cash Remittance Beneficiary Details",
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

function parseNumericAmount(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const direct = Number(trimmed);
  if (!Number.isNaN(direct)) return direct;

  const normalized = trimmed.replaceAll(/[^\d.-]/g, "");
  if (!normalized) return null;

  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? null : parsed;
}

function formatAmount(value: unknown, prefix = ""): string {
  const parsed = parseNumericAmount(value);
  if (parsed !== null) {
    return `${prefix}${parsed.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  }
  if (typeof value === "string" && value.trim()) {
    return `${prefix}${value}`;
  }
  return "--";
}

function formatAmountByCurrency(value: unknown, currency: unknown): string {
  const parsed = parseNumericAmount(value);
  if (parsed === null) {
    const raw = pickString(value);
    return raw === "--" ? "--" : raw;
  }

  const code = pickString(currency);
  const formatted = parsed.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  if (code === "--") return formatted;

  const currencyEntry = getCurrencyByCode(code);
  const prefix = currencyEntry?.symbol ?? `${code} `;
  return `${prefix}${formatted}`;
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

const HIDDEN_DETAIL_KEYS = new Set(["isDomiciliaryAccount"]);

function recordToOverviewFields(record: Record<string, unknown>): OverviewField[] {
  return Object.entries(record)
    .filter(
      ([key, val]) =>
        !HIDDEN_DETAIL_KEYS.has(key) &&
        val !== null &&
        val !== undefined &&
        String(val).trim() !== ""
    )
    .map(([key, val]) => ({
      label: toSentenceCase(key),
      value: String(val),
    }));
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
  // const receipt = asRecord(raw.receipt);
  const steps = raw.steps;
  const firstStep = Array.isArray(steps) ? steps[0] : undefined;
  const firstStepDataRaw = asRecord(firstStep).data;
  const beneficiary = asRecord(
    raw.beneficiary ||
      raw.beneficiaryDetails ||
      (raw?.steps as any[])?.[0]?.data?.beneficiaryDetails ||
      asRecord(firstStepDataRaw).beneficiaryDetails
  );
  const refundBank = asRecord(
    raw.refundBankDetails || asRecord(firstStepDataRaw).refundBankDetails
  );
  const stepData = asRecord(asRecord(firstStepDataRaw));
  const personalInfo = asRecord(raw.personalInfo);

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
    { label: "Transient Wallet ID", value: data.customerTransientWalletId ? data.customerTransientWalletId : "--", route: data.customerTransientWalletId ? adminRoutes.adminTransientWalletDetails(data.customerTransientWalletId) : undefined },
  ];
  const commonFields: OverviewField[] = [
    {
      label: "Transaction Value (FX)",
      value: formatAmountByCurrency(
        details.transactionValueFx,
        pickString(raw.currency, details.transactionCurrency)
      ),
    },
    { label: "Transaction Value (₦)", value: formatAmount(details.transactionValueNgn, "₦") },
    { label: "Requestor Type", value: pickString(details.requesterType) },
    {
      label: "BVN Number",
      value: pickString(details.bvnNumber, stepData.bvn),
    },
    { label: "NIN", value: pickString(details.nin, stepData.nin) },
    
    { label: "TIN Number", value: pickString(raw.taxClearanceNumber, stepData.tin) },
    { label: "Form A ID", value: pickString(raw.formAId) },
    { label: "Student Name", value: pickString(stepData.studentName, personalInfo.studentName) },
    {
      label: "Student NIN",
      value: pickString(stepData.studentNin, personalInfo.studentNin),
    },
    {
      label: "Student Int'l Passport Number",
      value: pickString(stepData.studentPassportDocumentNumber, personalInfo.studentPassportDocumentNumber),
    },
    {
      label: "Student Passport Issue Date",
      value: pickString(stepData.studentPassportIssueDate, personalInfo.studentPassportIssueDate),
    },
    {
      label: "Student Passport Expiry Date",
      value: pickString(stepData.studentPassportExpiryDate, personalInfo.studentPassportExpiryDate),
    },
    {
      label: "Applicant Int'l Passport Number",
      value: pickString(stepData.passportDocumentNumber, personalInfo.passportDocumentNumber),
    },
    {
      label: "Applicant Passport Issue Date",
      value: pickString(stepData.passportIssueDate, personalInfo.passportIssueDate),
    },
    {
      label: "Applicant Passport Expiry Date",
      value: pickString(stepData.passportExpiryDate, personalInfo.passportExpiryDate),
    },
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

  const documentFields: OverviewField[] = Array.isArray(raw.documents)
    ? (raw.documents as Record<string, unknown>[])
        .map((d) => asRecord(d))
        .filter((d) => pickString(d.fileUrl) !== "--")
        .map((d) => ({
          label: formatEnum(d.documentType),
          value: pickString(d.fileName, "View Document"),
          href: pickString(d.fileUrl),
        }))
    : [];

  const baseTitle = SECTION_TITLE_BY_TYPE[transactionType] ?? toSentenceCase(`${transactionType} Transaction Details`);
  const primarySection: OverviewSection = {
    title: baseTitle,
    fields: [
      ...commonFields.filter((item) => item.value !== "--"),
      ...documentFields,
    ],
  };

  const needsBeneficiarySection = true;

  const beneficiarySection: OverviewSection = {
    title:
      hasDetailRecordEntries(beneficiary)
        ? beneficiaryDetailSectionTitle(beneficiary)
        : BENEFICIARY_SECTION_TITLE_BY_TYPE[transactionType] ??
          toSentenceCase(`${transactionType} Beneficiary Details`),
    fields: recordToOverviewFields(beneficiary),
  };

  const refundBankSection: OverviewSection = {
    title: "Refund Bank Details",
    fields: recordToOverviewFields(refundBank),
  };

  const sections = [primarySection];
  if (needsBeneficiarySection && beneficiarySection.fields.length > 0) {
    sections.push(beneficiarySection);
  }
  if (refundBankSection.fields.length > 0) {
    sections.push(refundBankSection);
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
    {
      label: "Total Settlement (FX)",
      value: formatAmountByCurrency(
        details.transactionValueFx,
        pickString(raw.currency, details.transactionCurrency)
      ),
    },
    { label: "Total Settlement (₦)", value: formatAmount(details.transactionValueNgn, "₦") },
    {
      label: "Settlement Structure (Cash)",
      value:
        cashPickup.amount && cashPickup.currency && (pickString(cashPickup.amount) !== "--") && (pickString(cashPickup.currency) !== "--")
          ? formatAmountByCurrency(cashPickup.amount, cashPickup.currency)
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

function getWorkflowStatusLabel(action: unknown): string {
  const actionText = asString(action).toUpperCase();
  if (actionText.includes("REJECT")) return "Rejected";
  if (actionText.includes("APPROV") || actionText.includes("VERIF")) {
    return "Review Completed";
  }
  if (actionText.includes("REQUEST") || actionText.includes("MORE_INFO")) {
    return "Review Pending";
  }
  return "Review Pending";
}

function extractWorkflowHistory(
  raw: Record<string, unknown>
): TransactionWorkflowHistoryItemViewModel[] {
  const history = Array.isArray(raw.history)
    ? raw.history.filter((item) => item && typeof item === "object").map((item) => asRecord(item))
    : [];

  const sortedHistory = history.sort((a, b) => {
    const aCreatedAt = pickString(a.createdAt);
    const bCreatedAt = pickString(b.createdAt);
    const aTs =
      aCreatedAt !== "--" ? new Date(aCreatedAt).getTime() : Number.NEGATIVE_INFINITY;
    const bTs =
      bCreatedAt !== "--" ? new Date(bCreatedAt).getTime() : Number.NEGATIVE_INFINITY;
    return (Number.isNaN(bTs) ? Number.NEGATIVE_INFINITY : bTs) -
      (Number.isNaN(aTs) ? Number.NEGATIVE_INFINITY : aTs);
  });

  return sortedHistory
    .map((source): TransactionWorkflowHistoryItemViewModel | null => {
      const id = pickString(source.id);
      if (id === "--") return null;

      const metadata = asRecord(source.metadata);
      const createdAt = pickString(source.createdAt);

      return {
        id,
        actorLabel: pickString(source.performedBy, "Unknown"),
        actionLabel: formatEnum(source.action),
        statusLabel: getWorkflowStatusLabel(source.action),
        date: formatDate(createdAt),
        time: formatTime(createdAt),
        comment: pickString(source.notes, "No notes provided"),
        documentType: pickString(formatEnum(metadata.documentType), "--"),
      };
    })
    .filter((item): item is TransactionWorkflowHistoryItemViewModel => Boolean(item));
}

function resolveApprovalProcess(
  data: AdminTransactionDetailsData | null
): AdminTransactionApprovalProcess | null {
  if (!data) return null;
  if (data.approvalProcess && typeof data.approvalProcess === "object") {
    return data.approvalProcess;
  }
  const nested = asRecord(data.raw).approvalProcess;
  if (nested && typeof nested === "object") {
    return nested as AdminTransactionApprovalProcess;
  }
  return null;
}

function pickAssigneeId(assignee: unknown): string | null {
  const r = asRecord(assignee);
  const v = r.id ?? r.adminId ?? r.userId;
  if (typeof v === "string" && v.trim()) return v.trim();
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  return null;
}

export function buildTransactionApprovalUi(
  data: AdminTransactionDetailsData | null,
  adminUserId: string | undefined
): TransactionApprovalUiViewModel {
  const legacy: TransactionApprovalUiViewModel = {
    isApprovalOfficer: false,
    canActOnTransactionFooter: true,
    approvalState: undefined,
    approvalProcessName: undefined,
    approvalType: undefined,
  };
  if (!data) return legacy;

  const ap = resolveApprovalProcess(data);
  const approvalState = ap?.approvalState;
  const approvalProcessName = ap?.name?.trim() || undefined;
  const approvalType = asString(ap?.approvalType).trim() || undefined;
  const isApprovalOfficer = Boolean(ap?.isApprovalOfficer);
  const stages = ap?.workflowStages;
  const sharedApprovalFields = {
    isApprovalOfficer,
    approvalState,
    approvalProcessName,
    approvalType,
  };

  if (!ap || !Array.isArray(stages) || stages.length === 0) {
    return { ...sharedApprovalFields, canActOnTransactionFooter: true };
  }

  const currentStage = stages.find((s) => {
    if (!s || typeof s !== "object") return false;
    return (s as AdminTransactionApprovalWorkflowStage).isCurrent === true;
  }) as AdminTransactionApprovalWorkflowStage | undefined;
  if (!currentStage) {
    return { ...sharedApprovalFields, canActOnTransactionFooter: false };
  }

  const assignees = currentStage.assignees;
  if (!Array.isArray(assignees) || assignees.length === 0) {
    return { ...sharedApprovalFields, canActOnTransactionFooter: false };
  }

  const assigneeIds = new Set<string>();
  for (const a of assignees) {
    const id = pickAssigneeId(a);
    if (id) assigneeIds.add(id);
  }
  if (assigneeIds.size === 0) {
    return { ...sharedApprovalFields, canActOnTransactionFooter: false };
  }

  const uid = adminUserId?.trim();
  if (!uid) {
    return { ...sharedApprovalFields, canActOnTransactionFooter: false };
  }

  return {
    ...sharedApprovalFields,
    canActOnTransactionFooter: assigneeIds.has(uid),
  };
}

export function useTransactionDetails(
  transactionId?: string,
  options?: UseTransactionDetailsOptions
) {
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
  const workflowHistory = useMemo(
    () => extractWorkflowHistory(asRecord(query.data?.data?.raw)),
    [query.data?.data?.raw]
  );

  const approvalUi = useMemo(
    () => buildTransactionApprovalUi(query.data?.data ?? null, options?.adminUserId),
    [query.data?.data, options?.adminUserId]
  );

  return {
    overview,
    receipt,
    settlement,
    actionDocuments,
    workflowHistory,
    isApprovalOfficer: approvalUi.isApprovalOfficer,
    approvalState: approvalUi.approvalState,
    approvalProcessName: approvalUi.approvalProcessName,
    approvalType: approvalUi.approvalType,
    canActOnTransactionFooter: approvalUi.canActOnTransactionFooter,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
