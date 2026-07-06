import type { TransactionListItem, TransactionListParams } from "@/app/_lib/api/types";

export const FX_DASHBOARD_TABS = [
  { value: "bought", label: "FX bought" },
  { value: "sold", label: "FX sold" },
  { value: "others", label: "Others" },
] as const;

export type FxDashboardTab = (typeof FX_DASHBOARD_TABS)[number]["value"];

export type FxTransactionSubFilterValue = string;

export type FxTransactionSubFilterDef = {
  value: FxTransactionSubFilterValue;
  label: string;
  /** API `type` query param; omitted for “All”. */
  apiType?: string;
  /** Client-side fallback when shaping cached list rows. */
  matches: (tx: TransactionListItem) => boolean;
};

/** Remittance / receive flows shown under the “Others” overview tab. */
export const FX_RECEIVE_TRANSACTION_TYPES = [
  "IMTO_REMITTANCE",
  "CASH_REMITTANCE",
] as const;

const FX_RECEIVE_TYPE_SET = new Set<string>(FX_RECEIVE_TRANSACTION_TYPES);

type FxDashboardTabConfig = {
  label: string;
  overviewTitle: string;
  emptyMessage: string;
  apiGroup: NonNullable<TransactionListParams["group"]>;
  matches: (tx: TransactionListItem) => boolean;
};

export const FX_DASHBOARD_TAB_CONFIG: Record<FxDashboardTab, FxDashboardTabConfig> = {
  bought: {
    label: "FX bought",
    overviewTitle: "FX bought",
    emptyMessage: "No buy FX transactions",
    apiGroup: "BUY",
    matches: (tx) => tx.group === "BUY",
  },
  sold: {
    label: "FX sold",
    overviewTitle: "FX sold",
    emptyMessage: "No sell FX transactions",
    apiGroup: "SELL",
    matches: (tx) => tx.group === "SELL",
  },
  others: {
    label: "Others",
    overviewTitle: "Others",
    emptyMessage: "No receive / remittance transactions",
    apiGroup: "REMITTANCE",
    matches: (tx) => tx.group === "REMITTANCE" || FX_RECEIVE_TYPE_SET.has(tx.type),
  },
};

/**
 * Sub-filters shown on the dashboard transaction list, keyed by overview tab.
 * Change the overview tab (FX bought / sold / others) to swap this set.
 */
export const FX_TRANSACTION_SUB_FILTERS: Record<FxDashboardTab, FxTransactionSubFilterDef[]> = {
  bought: [
    { value: "all", label: "All", matches: () => true },
    { value: "pta", label: "PTA", apiType: "PTA", matches: (tx) => tx.type === "PTA" },
    { value: "bta", label: "BTA", apiType: "BTA", matches: (tx) => tx.type === "BTA" },
    {
      value: "school-fees",
      label: "School fees",
      apiType: "SCHOOL_FEES",
      matches: (tx) => tx.type === "SCHOOL_FEES",
    },
    { value: "medical", label: "Medical", apiType: "MEDICAL", matches: (tx) => tx.type === "MEDICAL" },
    {
      value: "professional-body",
      label: "Professional fees",
      apiType: "PROFESSIONAL_BODY",
      matches: (tx) => tx.type === "PROFESSIONAL_BODY",
    },
    {
      value: "tourist",
      label: "Tourist",
      apiType: "TOURIST_FX",
      matches: (tx) => tx.type === "TOURIST_FX",
    },
  ],
  sold: [
    { value: "all", label: "All", matches: () => true },
    {
      value: "resident",
      label: "Resident",
      apiType: "RESIDENT_FX",
      matches: (tx) => tx.type === "RESIDENT_FX",
    },
    {
      value: "touring-nigeria",
      label: "Touring Nigeria",
      apiType: "TOURIST_FX",
      matches: (tx) => tx.type === "TOURIST_FX",
    },
    {
      value: "expatriate",
      label: "Expatriate",
      apiType: "EXPATRIATE_FX",
      matches: (tx) => tx.type === "EXPATRIATE_FX",
    },
  ],
  others: [
    { value: "all", label: "All", matches: () => true },
    {
      value: "imto",
      label: "IMTO",
      apiType: "IMTO_REMITTANCE",
      matches: (tx) => tx.type === "IMTO_REMITTANCE",
    },
    {
      value: "cash-remittance",
      label: "Cash remittance",
      apiType: "CASH_REMITTANCE",
      matches: (tx) => tx.type === "CASH_REMITTANCE",
    },
  ],
};

export function getSubFilterDef(
  overviewTab: FxDashboardTab,
  subFilter: FxTransactionSubFilterValue
): FxTransactionSubFilterDef {
  return (
    FX_TRANSACTION_SUB_FILTERS[overviewTab].find((f) => f.value === subFilter) ??
    FX_TRANSACTION_SUB_FILTERS[overviewTab][0]
  );
}

/**
 * Query params for GET /transactions — mirrors `transactions/page.tsx` list behaviour.
 */
export function buildDashboardTransactionListParams(
  overviewTab: FxDashboardTab,
  subFilter: FxTransactionSubFilterValue,
  base?: Pick<TransactionListParams, "page" | "limit" | "sortBy" | "sortOrder">
): TransactionListParams {
  const { apiGroup } = FX_DASHBOARD_TAB_CONFIG[overviewTab];
  const { apiType } = getSubFilterDef(overviewTab, subFilter);

  return {
    page: base?.page ?? 1,
    limit: base?.limit ?? 6,
    sortBy: base?.sortBy ?? "createdAt",
    sortOrder: base?.sortOrder ?? "desc",
    group: apiGroup,
    type: apiType,
  };
}

export function filterTransactionsByDashboardTab(
  transactions: TransactionListItem[],
  tab: FxDashboardTab
): TransactionListItem[] {
  return transactions.filter(FX_DASHBOARD_TAB_CONFIG[tab].matches);
}

export function filterTransactionsBySubFilter(
  transactions: TransactionListItem[],
  overviewTab: FxDashboardTab,
  subFilter: FxTransactionSubFilterValue
): TransactionListItem[] {
  return transactions.filter(getSubFilterDef(overviewTab, subFilter).matches);
}

export function getFxDashboardTabLabel(tab: FxDashboardTab): string {
  return FX_DASHBOARD_TAB_CONFIG[tab].label;
}

export function getDefaultSubFilter(overviewTab: FxDashboardTab): FxTransactionSubFilterValue {
  return FX_TRANSACTION_SUB_FILTERS[overviewTab][0]?.value ?? "all";
}
