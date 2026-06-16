import type { TransactionDetailBankAccount } from "@/app/_lib/api/types";

export type TransactionPayoutDisplay =
  | { kind: "bankAccounts"; accounts: TransactionDetailBankAccount[] }
  | { kind: "beneficiary"; data: Record<string, unknown> }
  | { kind: "none" };

function hasBeneficiaryEntries(
  data: Record<string, unknown> | null | undefined,
): boolean {
  if (!data || typeof data !== "object") return false;

  return Object.entries(data).some(
    ([, value]) => value !== null && value !== undefined && value !== "",
  );
}

/**
 * Picks a single payout section for transaction detail.
 *
 * - **bankAccounts** — linked domestic payout account(s) (Sell FX / electronic disbursement).
 *   Authoritative when present; beneficiaryDetails often duplicates the same fields.
 * - **beneficiaryDetails** — international payee (school / medical / pro) or inline wire details.
 */
export function resolveTransactionPayoutDisplay(
  bankAccounts: TransactionDetailBankAccount[] | null | undefined,
  beneficiaryDetails: Record<string, unknown> | null | undefined,
): TransactionPayoutDisplay {
  const accounts = (bankAccounts ?? []).filter(Boolean);

  if (accounts.length > 0) {
    return { kind: "bankAccounts", accounts };
  }

  if (hasBeneficiaryEntries(beneficiaryDetails)) {
    return { kind: "beneficiary", data: beneficiaryDetails! };
  }

  return { kind: "none" };
}
