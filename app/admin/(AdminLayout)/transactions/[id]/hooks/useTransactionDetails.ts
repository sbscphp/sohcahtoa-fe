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

  const titlePrefix = pickString(data.fxType, formatEnum(raw.transactionMode), "Transaction");
  const titleValue = LABEL_BY_TYPE[transactionType] ?? formatEnum(data.transactionType);

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
    titlePrefix,
    titleValue,
    dateLabel: formatDate(data.date),
    timeLabel: formatTime(data.time),
    statusLabel: pickString(formatEnum(data.requestStatus), formatEnum(raw.status), "--"),
    basicDetails,
    sections: nonEmptySections,
    isEmpty: nonEmptySections.length === 0,
  };
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

  return {
    overview,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
