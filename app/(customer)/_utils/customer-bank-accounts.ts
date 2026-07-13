import type {
  CreateCustomerBankAccountRequest,
  CustomerBankAccount,
  ListCustomerBankAccountsParams,
} from "@/app/_lib/api/types";
import type { BankAccount } from "@/app/(customer)/_components/transactions/forms/PickupPointStep";
import type { DomiciliaryAccountFormData } from "@/app/(customer)/_lib/domiciliary-account-schema";
import type { DomiciliaryRefundAccount } from "@/app/(customer)/_components/transactions/forms/sell-fx/DomiciliaryRefundBankStep";

export type BankAccountListFilter = "LOCAL" | "FOREIGN";

export interface AddBankAccountInput {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Maps UI filter to API query param. */
export function toBankAccountListParams(
  filter?: BankAccountListFilter,
): ListCustomerBankAccountsParams | undefined {
  if (!filter) return undefined;
  return { currency: filter === "FOREIGN" ? "FOREIGN" : "NGN" };
}

export function isDomiciliaryBankAccount(account: CustomerBankAccount): boolean {
  return account.currency === "FOREIGN";
}

export function isLocalBankAccount(account: CustomerBankAccount): boolean {
  return !isDomiciliaryBankAccount(account);
}

/** Client-side filter until the API query param is fully enforced. */
export function filterAccountsByCurrency(
  accounts: CustomerBankAccount[],
  filter: BankAccountListFilter,
): CustomerBankAccount[] {
  if (filter === "FOREIGN") {
    return accounts.filter(isDomiciliaryBankAccount);
  }
  return accounts.filter(isLocalBankAccount);
}

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

/** POST body for domiciliary (foreign currency) accounts. */
export function toCreateDomiciliaryBankAccountPayload(
  data: DomiciliaryAccountFormData,
): CreateCustomerBankAccountRequest {
  return {
    bankName: data.domiciliaryBankName.trim(),
    accountNumber: data.domiciliaryAccountNumber.trim(),
    accountName: data.accountName.trim(),
    currency: "FOREIGN",
    swiftCode: data.swiftCode.trim(),
    routingNumber: data.routingNumber.trim(),
    bankAddress: data.bankAddress.trim(),
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

export function mapCustomerBankAccountToDomiciliaryRefund(
  account: CustomerBankAccount,
  extras?: Partial<DomiciliaryAccountFormData>,
): DomiciliaryRefundAccount {
  return {
    id: account.id,
    domiciliaryAccountNumber: account.accountNumber,
    domiciliaryBankName: account.bankName,
    accountName: account.accountName,
    swiftCode: extras?.swiftCode?.trim() ?? account.swiftCode?.trim() ?? "",
    routingNumber: extras?.routingNumber?.trim() ?? account.routingNumber?.trim() ?? "",
    bankAddress: extras?.bankAddress?.trim() ?? account.bankAddress?.trim() ?? "",
  };
}

export function isCompleteDomiciliaryRefundAccount(
  account: DomiciliaryRefundAccount,
): boolean {
  return Boolean(
    account.domiciliaryAccountNumber.trim() &&
      account.domiciliaryBankName.trim() &&
      account.accountName.trim() &&
      account.swiftCode.trim() &&
      account.routingNumber.trim() &&
      account.bankAddress.trim(),
  );
}

export function isSavedBankAccountId(id: string): boolean {
  return UUID_RE.test(id);
}

export function getCreatedTransactionId(created: unknown): string | undefined {
  const data = (created as { data?: { transactionId?: string; id?: string } })?.data;
  return data?.transactionId ?? data?.id;
}

/** Merges a selected refund account into pickup / flow bag data (works when pickup is null). */
export function mergeRefundBankIntoPickupData(
  pickup: Record<string, unknown> | null | undefined,
  bankAccount: BankAccount,
): Record<string, unknown> {
  return {
    ...(pickup ?? {}),
    refundBankAccount: bankAccount,
    selectedRefundBankId: bankAccount.id,
  };
}

/** Merges sell FX domiciliary refund account details into pickup / flow bag data. */
export function mergeRefundDomiciliaryIntoPickupData(
  pickup: Record<string, unknown> | null | undefined,
  account: DomiciliaryAccountFormData & { id?: string },
): Record<string, unknown> {
  const next: Record<string, unknown> = {
    ...(pickup ?? {}),
    refundDomiciliaryAccount: {
      domiciliaryAccountNumber: account.domiciliaryAccountNumber,
      domiciliaryBankName: account.domiciliaryBankName,
      accountName: account.accountName,
      swiftCode: account.swiftCode,
      routingNumber: account.routingNumber,
      bankAddress: account.bankAddress,
    },
  };

  if (account.id) {
    next.selectedRefundDomiciliaryId = account.id;
  } else {
    delete next.selectedRefundDomiciliaryId;
  }

  return next;
}

/** Session-only id for Dom accounts added during the flow (not persisted). */
export function createLocalDomiciliaryAccountId(): string {
  return `local-dom-${Date.now()}`;
}

export function hasCompleteRefundDomiciliaryDetails(
  pickup: Record<string, unknown> | null | undefined,
): boolean {
  const refund = pickup?.refundDomiciliaryAccount as Partial<DomiciliaryAccountFormData> | undefined;
  if (!refund) return false;

  return Boolean(
    refund.domiciliaryAccountNumber?.trim() &&
      refund.domiciliaryBankName?.trim() &&
      refund.accountName?.trim() &&
      refund.swiftCode?.trim() &&
      refund.routingNumber?.trim() &&
      refund.bankAddress?.trim(),
  );
}

export function domiciliaryRefundAccountFromPickupData(
  pickup: Record<string, unknown> | null | undefined,
): DomiciliaryRefundAccount | undefined {
  const refund = pickup?.refundDomiciliaryAccount as Partial<DomiciliaryAccountFormData> | undefined;
  if (!hasCompleteRefundDomiciliaryDetails(pickup) || !refund) return undefined;

  return {
    id: String(pickup?.selectedRefundDomiciliaryId ?? "refund-domiciliary"),
    domiciliaryAccountNumber: refund.domiciliaryAccountNumber!.trim(),
    domiciliaryBankName: refund.domiciliaryBankName!.trim(),
    accountName: refund.accountName!.trim(),
    swiftCode: refund.swiftCode!.trim(),
    routingNumber: refund.routingNumber!.trim(),
    bankAddress: refund.bankAddress!.trim(),
  };
}

/** Saved refund bank account id from payout flow form data. */
export function getRefundBankAccountId(
  pickup: Record<string, unknown> | null | undefined,
): string | undefined {
  if (!pickup) return undefined;

  const refundBankAccount = pickup.refundBankAccount as { id?: string } | undefined;
  if (refundBankAccount?.id && isSavedBankAccountId(refundBankAccount.id)) {
    return refundBankAccount.id;
  }

  const selectedRefundBankId = String(pickup.selectedRefundBankId ?? "").trim();
  if (selectedRefundBankId && isSavedBankAccountId(selectedRefundBankId)) {
    return selectedRefundBankId;
  }

  return undefined;
}

/** Saved domiciliary refund bank account id from sell FX payout flow. */
export function getRefundDomiciliaryBankAccountId(
  pickup: Record<string, unknown> | null | undefined,
): string | undefined {
  if (!pickup) return undefined;

  const selectedId = String(pickup.selectedRefundDomiciliaryId ?? "").trim();
  if (selectedId && isSavedBankAccountId(selectedId)) {
    return selectedId;
  }

  return undefined;
}

/** @deprecated Use getRefundBankAccountId — kept for sell / legacy pickup-or-bank flows. */
export function getPickupBankAccountId(
  pickup: Record<string, unknown> | null | undefined,
): string | undefined {
  if (!pickup) return undefined;

  const usesElectronicPayout =
    pickup.payoutMethod === "electronic_transfer_100" || pickup.preference === "bank";
  if (!usesElectronicPayout) return getRefundBankAccountId(pickup);

  const bankAccount = pickup.bankAccount as { id?: string } | undefined;
  if (bankAccount?.id && isSavedBankAccountId(bankAccount.id)) {
    return bankAccount.id;
  }

  const selectedBankId = String(pickup.selectedBankId ?? "").trim();
  if (selectedBankId && isSavedBankAccountId(selectedBankId)) {
    return selectedBankId;
  }

  return getRefundBankAccountId(pickup);
}
