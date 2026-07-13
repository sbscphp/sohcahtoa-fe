import type { TransactionDetailBankAccount } from "@/app/_lib/api/types";

/** Internal payload flags — not shown on detail UI. */
const HIDDEN_DETAIL_KEYS = new Set(["isDomiciliaryAccount"]);

export type TransactionPayoutSections = {
  beneficiary: Record<string, unknown> | null;
  refundBank: Record<string, unknown> | null;
  /** Linked domestic account(s) for Sell FX payout when no refund snapshot is present. */
  payoutBankAccounts: TransactionDetailBankAccount[];
};

export function hasDetailRecordEntries(
  data: Record<string, unknown> | null | undefined,
): boolean {
  if (!data || typeof data !== "object") return false;

  return Object.entries(data).some(
    ([key, value]) =>
      !HIDDEN_DETAIL_KEYS.has(key) &&
      value !== null &&
      value !== undefined &&
      value !== "",
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
