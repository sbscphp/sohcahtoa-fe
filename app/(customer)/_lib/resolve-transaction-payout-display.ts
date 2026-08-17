import type { TransactionDetailBankAccount } from "@/app/_lib/api/types";
import { BENEFICIARY_REGION_OPTIONS } from "@/app/(customer)/_lib/international-bank-details-schema";

/** Internal / duplicate payload keys — not shown on customer detail UI. */
const HIDDEN_DETAIL_KEYS = new Set([
  "isDomiciliaryAccount",
  "schoolName",
  "school_name",
  "name",
  "beneficiaryName",
  "bankAccountName",
]);

export type TransactionPayoutSections = {
  beneficiary: Record<string, unknown> | null;
  refundBank: Record<string, unknown> | null;
  /** Linked domestic account(s) for Sell FX payout when no refund snapshot is present. */
  payoutBankAccounts: TransactionDetailBankAccount[];
};

export type BeneficiaryDetailRow = {
  key: string;
  label: string;
  value: string;
};

/** Display order matches InternationalBankDetailsFields collection order. */
const BENEFICIARY_DISPLAY_FIELDS: { key: string; label: string }[] = [
  { key: "beneficiaryCountryRegion", label: "Bank account country / region" },
  { key: "organizationName", label: "Organization name" },
  { key: "beneficiaryPhone", label: "Phone number" },
  { key: "beneficiaryEmail", label: "Email" },
  { key: "beneficiaryAddress", label: "Address" },
  { key: "beneficiaryCity", label: "City" },
  { key: "beneficiaryState", label: "State" },
  { key: "beneficiaryCountry", label: "Country" },
  { key: "bankName", label: "Bank name" },
  { key: "accountName", label: "Account name" },
  { key: "bankAddress", label: "Bank Address" },
  { key: "iban", label: "IBAN" },
  { key: "swiftCode", label: "SWIFT/BIC" },
  { key: "accountNumber", label: "Bank account number" },
  { key: "correspondenceBankName", label: "Correspondence bank name" },
  { key: "correspondenceBankAddress", label: "Correspondence bank address" },
  { key: "correspondenceBankSwiftCode", label: "Correspondence bank SWIFT/BIC" },
  { key: "paymentReference", label: "Payment/Invoice reference number" },
  { key: "routingNumber", label: "Routing number" },
  { key: "ifscNumber", label: "IFSC number" },
  { key: "purposeCode", label: "Purpose code" },
  { key: "bsbCode", label: "BSB code" },
  { key: "otherInformation", label: "Other bank details" },
];

const REGION_LABEL_BY_VALUE = Object.fromEntries(
  BENEFICIARY_REGION_OPTIONS.map((option) => [option.value, option.label]),
);

function isPresentValue(value: unknown): boolean {
  return value !== null && value !== undefined && value !== "";
}

function formatDetailValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

function formatRegionValue(value: unknown): string {
  const raw = formatDetailValue(value).trim();
  return REGION_LABEL_BY_VALUE[raw] ?? raw;
}

function pickOrganizationName(data: Record<string, unknown>): string {
  const candidates = [
    data.organizationName,
    data.beneficiaryName,
    data.schoolName,
    data.name,
  ];
  for (const candidate of candidates) {
    const text = formatDetailValue(candidate).trim();
    if (text) return text;
  }
  return "";
}

function fallbackFieldLabel(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

/** Customer-safe beneficiary rows: curated labels, collection order, no School name duplicate. */
export function getBeneficiaryDetailRows(
  data: Record<string, unknown>,
): BeneficiaryDetailRow[] {
  const usedKeys = new Set<string>();
  const rows: BeneficiaryDetailRow[] = [];

  for (const field of BENEFICIARY_DISPLAY_FIELDS) {
    let value = "";
    if (field.key === "organizationName") {
      value = pickOrganizationName(data);
      usedKeys.add("organizationName");
      usedKeys.add("beneficiaryName");
      usedKeys.add("schoolName");
      usedKeys.add("school_name");
      usedKeys.add("name");
    } else if (field.key === "beneficiaryCountryRegion") {
      value = formatRegionValue(data[field.key]);
      usedKeys.add(field.key);
    } else {
      value = formatDetailValue(data[field.key]).trim();
      usedKeys.add(field.key);
    }

    if (!value) continue;
    rows.push({ key: field.key, label: field.label, value });
  }

  for (const [key, raw] of Object.entries(data)) {
    if (usedKeys.has(key) || HIDDEN_DETAIL_KEYS.has(key) || !isPresentValue(raw)) {
      continue;
    }
    const value = formatDetailValue(raw).trim();
    if (!value) continue;
    rows.push({ key, label: fallbackFieldLabel(key), value });
  }

  return rows;
}

export function hasDetailRecordEntries(
  data: Record<string, unknown> | null | undefined,
): boolean {
  if (!data || typeof data !== "object") return false;

  return Object.entries(data).some(
    ([key, value]) =>
      !HIDDEN_DETAIL_KEYS.has(key) && isPresentValue(value),
  );
}

export function beneficiaryDetailSectionTitle(
  data: Record<string, unknown>,
): string {
  const currency =
    typeof data.currency === "string" ? data.currency.trim().toUpperCase() : "";
  if (
    data.isDomiciliaryAccount === true ||
    (currency && currency !== "NGN" && currency !== "LOCAL")
  ) {
    return "Domiciliary Account Details";
  }
  return "Beneficiary Details";
}

/**
 * Resolves payout / bank sections for transaction detail.
 *
 * - **beneficiary** — BUY Dom / international payee, or SELL local NGN payout (`beneficiaryDetails`).
 * - **refundBank** — BUY local NGN refund, or SELL Dom refund (`refundBankDetails`).
 * - **payoutBankAccounts** — linked accounts when refund snapshot is absent.
 *   Skipped when `refundBankDetails` is present.
 */
export function resolveTransactionPayoutSections(
  bankAccounts: TransactionDetailBankAccount[] | null | undefined,
  beneficiaryDetails: Record<string, unknown> | null | undefined,
  refundBankDetails?: Record<string, unknown> | null | undefined,
): TransactionPayoutSections {
  const accounts = (bankAccounts ?? []).filter(Boolean);
  const beneficiary = hasDetailRecordEntries(beneficiaryDetails)
    ? beneficiaryDetails!
    : null;
  const refundBank = hasDetailRecordEntries(refundBankDetails)
    ? refundBankDetails!
    : null;
  const payoutBankAccounts = refundBank ? [] : accounts;

  return { beneficiary, refundBank, payoutBankAccounts };
}

/** @deprecated Use `resolveTransactionPayoutSections` — kept for gradual migration. */
export type TransactionPayoutDisplay =
  | { kind: "bankAccounts"; accounts: TransactionDetailBankAccount[] }
  | { kind: "beneficiary"; data: Record<string, unknown> }
  | { kind: "none" };

/** @deprecated Use `resolveTransactionPayoutSections`. */
export function resolveTransactionPayoutDisplay(
  bankAccounts: TransactionDetailBankAccount[] | null | undefined,
  beneficiaryDetails: Record<string, unknown> | null | undefined,
): TransactionPayoutDisplay {
  const sections = resolveTransactionPayoutSections(
    bankAccounts,
    beneficiaryDetails,
    null,
  );

  if (sections.payoutBankAccounts.length > 0) {
    return { kind: "bankAccounts", accounts: sections.payoutBankAccounts };
  }

  if (sections.beneficiary) {
    return { kind: "beneficiary", data: sections.beneficiary };
  }

  return { kind: "none" };
}
