import type {
  CreateCustomerBankAccountRequest,
  CustomerBankAccount,
} from "@/app/_lib/api/types";
import type { BankAccount } from "@/app/(customer)/_components/transactions/forms/PickupPointStep";
export interface AddBankAccountInput {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** POST /api/customer/bank-accounts body — bank name must match banks list label. */
export function toCreateBankAccountPayload(
  data: AddBankAccountInput,
): CreateCustomerBankAccountRequest {
  return {
    bankName: data.bankName.trim(),
    accountNumber: data.accountNumber.trim(),
    accountName: data.accountName.trim(),
  };
}

export function filterBankAccounts<T extends BankAccount>(
  accounts: T[],
  query: string,
): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return accounts;
  return accounts.filter(
    (account) =>
      account.bankName.toLowerCase().includes(q) ||
      account.accountNumber.includes(q) ||
      account.accountName.toLowerCase().includes(q),
  );
}

export function mapCustomerBankAccountToUi(account: CustomerBankAccount): BankAccount {
  return {
    id: account.id,
    bankName: account.bankName,
    accountNumber: account.accountNumber,
    accountName: account.accountName,
  };
}

export function isSavedBankAccountId(id: string): boolean {
  return UUID_RE.test(id);
}

export function getCreatedTransactionId(created: unknown): string | undefined {
  const data = (created as { data?: { transactionId?: string; id?: string } })?.data;
  return data?.transactionId ?? data?.id;
}

/** Saved bank account id from pickup / payout step form data. */
export function getPickupBankAccountId(
  pickup: Record<string, unknown> | null | undefined,
): string | undefined {
  if (!pickup) return undefined;

  const usesElectronicPayout =
    pickup.payoutMethod === "electronic_transfer_100" || pickup.preference === "bank";
  if (!usesElectronicPayout) return undefined;

  const bankAccount = pickup.bankAccount as { id?: string } | undefined;
  if (bankAccount?.id && isSavedBankAccountId(bankAccount.id)) {
    return bankAccount.id;
  }

  const selectedBankId = String(pickup.selectedBankId ?? "").trim();
  if (selectedBankId && isSavedBankAccountId(selectedBankId)) {
    return selectedBankId;
  }

  return undefined;
}
