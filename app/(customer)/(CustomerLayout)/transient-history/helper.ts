import type {
  CustomerWalletLedgerEntry,
  CustomerWalletLedgerListResponse,
  PaginationMetadata,
} from "@/app/_lib/api/types";

export interface TransientHistoryRow {
  id: string;
  transactionId: string;
  date: string;
  totalDebit: number;
  totalCredit: number;
  balance: number;
  description?: string;
  status?: string;
}

export function normalizeCustomerWalletLedgerResponse(
  response: CustomerWalletLedgerListResponse | undefined
): {
  wallet: { balance: number; currency: string };
  entries: CustomerWalletLedgerEntry[];
  meta: PaginationMetadata;
} {
  const emptyMeta: PaginationMetadata = {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  };

  if (!response) {
    return {
      wallet: { balance: 0, currency: "NGN" },
      entries: [],
      meta: emptyMeta,
    };
  }

  if (response.entries != null && response.meta != null) {
    const summary =
      response.data && "balance" in response.data
        ? response.data
        : { balance: 0, currency: "NGN" as const };

    return {
      wallet: {
        balance: summary.balance ?? 0,
        currency: summary.currency ?? "NGN",
      },
      entries: response.entries,
      meta: response.meta,
    };
  }

  const nested = response.data;
  if (nested && "entries" in nested && Array.isArray(nested.entries)) {
    return {
      wallet: {
        balance: nested.wallet?.balance ?? 0,
        currency: nested.wallet?.currency ?? "NGN",
      },
      entries: nested.entries,
      meta: nested.meta ?? emptyMeta,
    };
  }

  return {
    wallet: {
      balance:
        response.data && "balance" in response.data ? (response.data.balance ?? 0) : 0,
      currency:
        response.data && "currency" in response.data
          ? (response.data.currency ?? "NGN")
          : "NGN",
    },
    entries: [],
    meta: response.meta ?? emptyMeta,
  };
}

export function mapWalletLedgerEntry(entry: CustomerWalletLedgerEntry): TransientHistoryRow {
  const isDebit = entry.type === "DEBIT";

  return {
    id: entry.id,
    transactionId: entry.transactionId ?? entry.transactionRef ?? entry.id,
    date: entry.createdAt,
    totalDebit: isDebit ? entry.amount : 0,
    totalCredit: isDebit ? 0 : entry.amount,
    balance: entry.balanceAfter,
    description: entry.description ?? undefined,
    status: entry.status ?? undefined,
  };
}
