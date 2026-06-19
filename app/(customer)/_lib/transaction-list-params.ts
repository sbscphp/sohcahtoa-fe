import type { TransactionListParams } from "@/app/_lib/api/types";
import { resolveTransactionListGroup } from "./transaction-group-tabs";

/** Filter sheet values → API transaction `type` enum(s). */
export const TRANSACTION_FILTER_TYPE_TO_API: Record<string, string> = {
  pta: "PTA",
  bta: "BTA",
  tourist: "TOURIST_FX",
  school_fees: "SCHOOL_FEES",
  professional_body: "PROFESSIONAL_BODY",
  imto: "IMTO_REMITTANCE",
  medical: "MEDICAL",
};

/** Admin tab values → API `group`. */
export const ADMIN_TRANSACTION_TAB_TO_GROUP = {
  all: undefined,
  "buy-fx": "BUY",
  "sell-fx": "SELL",
  "receive-fx": "REMITTANCE",
  buyfx: "BUY",
  sellfx: "SELL",
  receivefx: "REMITTANCE",
} as const satisfies Record<string, "BUY" | "SELL" | "REMITTANCE" | undefined>;

export function mapTransactionFilterTypesToApi(
  filterCsv?: string | null,
): string | undefined {
  if (!filterCsv?.trim()) return undefined;

  const mapped = filterCsv
    .split(",")
    .map((part) => {
      const key = part.trim().toLowerCase();
      return TRANSACTION_FILTER_TYPE_TO_API[key] ?? part.trim().toUpperCase();
    })
    .filter(Boolean);

  return mapped.length > 0 ? mapped.join(",") : undefined;
}

export function mapTransactionFilterStatusToApi(
  filterCsv?: string | null,
): string | undefined {
  if (!filterCsv?.trim()) return undefined;

  const mapped = filterCsv
    .split(",")
    .map((part) => part.trim().toUpperCase())
    .filter(Boolean);

  return mapped.length > 0 ? mapped.join(",") : undefined;
}

export function resolveAdminTransactionListGroup(
  tab: string,
): TransactionListParams["group"] | undefined {
  return ADMIN_TRANSACTION_TAB_TO_GROUP[
    tab as keyof typeof ADMIN_TRANSACTION_TAB_TO_GROUP
  ];
}

export type TransactionListQueryInput = Omit<
  TransactionListParams,
  "group" | "type" | "mode"
> & {
  /** Top tab: All | Buy FX | Sell FX | Receive FX */
  activeGroupTab: string;
  /** CSV from filter sheet `transactionType` selection */
  transactionTypeFilter?: string;
};

/** Builds GET /transactions list params — always sends tab `group`; adds mapped `type` when filtered. */
export function buildTransactionListQueryParams(
  input: TransactionListQueryInput,
): TransactionListParams {
  const { activeGroupTab, transactionTypeFilter, ...rest } = input;

  return {
    ...rest,
    status: mapTransactionFilterStatusToApi(rest.status),
    group: resolveTransactionListGroup(activeGroupTab),
    type: mapTransactionFilterTypesToApi(transactionTypeFilter),
  };
}
