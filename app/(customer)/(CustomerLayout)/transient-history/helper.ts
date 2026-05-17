import type {
  CustomerTransientHistoryApiItem,
} from "@/app/_lib/api/types";

export interface TransientHistoryRow {
  id: string;
  transactionId: string;
  date: string;
  totalDebit: number;
  totalCredit: number;
  balance: number;
}

function pickAmount(
  primary: number | null | undefined,
  fallback: number | null | undefined
): number {
  if (primary != null && !Number.isNaN(Number(primary))) return Number(primary);
  if (fallback != null && !Number.isNaN(Number(fallback))) return Number(fallback);
  return 0;
}

export function mapTransientHistoryItem(
  item: CustomerTransientHistoryApiItem
): TransientHistoryRow {
  const txId = item.transaction_id ?? item.id;
  const date =
    item.transaction_date ?? item.created_at ?? new Date(0).toISOString();

  return {
    id: item.id,
    transactionId: String(txId),
    date,
    totalDebit: pickAmount(item.total_debit, item.total_debits),
    totalCredit: pickAmount(item.total_credit, item.total_credits),
    balance: pickAmount(item.balance, null),
  };
}
