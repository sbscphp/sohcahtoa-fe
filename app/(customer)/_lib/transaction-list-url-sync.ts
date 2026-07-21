import type { TableUrlSyncConfig } from "@/app/_hooks/use-table-url-sync";
import {
  TRANSACTION_GROUP_FILTER_OPTIONS,
  TRANSACTION_GROUP_TAB_ALL,
} from "@/app/(customer)/_lib/transaction-group-tabs";

export type TransactionListSelectionKey =
  | "status"
  | "transactionType"
  | "currency"
  | "stage";

export const TRANSACTION_LIST_PAGE_SIZE = 10;

export const TRANSACTION_LIST_URL_SYNC: TableUrlSyncConfig<TransactionListSelectionKey> =
  {
    tableName: "tx",
    namespace: false,
    sync: {
      q: "q",
      page: "page",
      startDate: "startDate",
      endDate: "endDate",
      selections: {
        status: "status",
        transactionType: "transactionType",
        currency: "currency",
        stage: "stage",
      },
      params: {
        type: "type",
      },
    },
  };

const VALID_GROUP_TABS = new Set(
  TRANSACTION_GROUP_FILTER_OPTIONS.map((opt) => opt.value)
);

export function resolveTransactionListGroupTab(
  value: string | undefined
): string {
  if (value && VALID_GROUP_TABS.has(value)) return value;
  return TRANSACTION_GROUP_TAB_ALL;
}
