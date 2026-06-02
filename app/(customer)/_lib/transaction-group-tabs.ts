import type { FilterTabOption } from "@/app/(customer)/_components/common/table/TableWrapper";

export const TRANSACTION_GROUP_TAB_ALL = "All" as const;

export const TRANSACTION_GROUP_FILTER_OPTIONS: FilterTabOption[] = [
  { value: TRANSACTION_GROUP_TAB_ALL, label: "All" },
  { value: "Buy FX", label: "Buy FX" },
  { value: "Sell FX", label: "Sell FX" },
  { value: "Receive FX", label: "Receive FX" },
];

export const TRANSACTION_TAB_TO_GROUP = {
  "Buy FX": "BUY",
  "Sell FX": "SELL",
  "Receive FX": "REMITTANCE",
} as const;

export type TransactionListGroup = (typeof TRANSACTION_TAB_TO_GROUP)[keyof typeof TRANSACTION_TAB_TO_GROUP];

/** Returns API `group` / `mode` — undefined when showing all transaction types. */
export function resolveTransactionListGroup(
  activeTab: string,
): TransactionListGroup | undefined {
  if (activeTab === TRANSACTION_GROUP_TAB_ALL) return undefined;
  return TRANSACTION_TAB_TO_GROUP[activeTab as keyof typeof TRANSACTION_TAB_TO_GROUP];
}
