"use client";

import { useMemo } from "react";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { CURRENCIES } from "@/app/(customer)/_lib/currency";
import { useCreateData, useFetchData } from "@/app/_lib/api/hooks";
import { agentKeys } from "@/app/_lib/api/query-keys";
import type {
  AgentDashboardCashStatsPeriod,
  AgentFxInventoryListResponse,
  AgentFxLodgeRequest,
} from "@/app/_lib/api/types";
import { agentApi } from "@/app/agent/_services/agent-api";
import { getAgentApiErrorMessage } from "@/app/agent/_utils/api-error-message";
import { saveBlob } from "../_lib/export-csv";
import {
  normalizeBalances,
  normalizeDisbursements,
  normalizeLodgements,
  normalizeTransactions,
} from "../_lib/normalize";
import type { PositionRow } from "../_lib/types";

/**
 * One hook per screen region. Each runs only where it is used, so a tab's data is fetched when the
 * tab opens (panels unmount when inactive) and not before. Anything shared between regions uses the
 * same query key, so TanStack Query serves it once from cache.
 */

export const PAGE_SIZE = 10;
const STALE_MS = 30_000;
const CURRENCY_CODES = CURRENCIES.map((c) => c.code);
export const FX_CODES = CURRENCY_CODES.filter((c) => c !== "NGN");

const sum = (values: Array<number | null | undefined>) => values.reduce<number>((t, v) => t + (v ?? 0), 0);
const key = (k: unknown) => k as unknown as unknown[];
const fresh = { staleTime: STALE_MS } as const;

/** List endpoints put pagination under metadata (fx-inventory) or at the top level (transactions). */
function paginationOf(res: AgentFxInventoryListResponse | undefined) {
  return res?.metadata?.pagination ?? res?.pagination;
}

// ---- shared queries (same key = one request across the page) -------------------------------

export function useFxBalances() {
  return useFetchData(key(agentKeys.fxInventory.balances()), () => agentApi.fxInventory.balances(), true, fresh);
}

export function useTransactionStats() {
  return useFetchData(key(agentKeys.transactions.stats()), () => agentApi.transactions.stats(), true, fresh);
}

/** `limit: 1` queries are cheap counts: the total comes back in pagination. */
function useLodgmentsQuery(status: "PENDING_VERIFICATION" | "CONFIRMED" | "REJECTED" | undefined, page: number, limit: number) {
  const params = { ...(status ? { status } : {}), page, limit };
  return useFetchData(
    key(agentKeys.fxInventory.lodgments(params)),
    () => agentApi.fxInventory.lodgments(params),
    true,
    fresh,
  );
}

function useDisbursementsQuery(
  status: "PENDING_APPROVAL" | "APPROVED" | "REJECTED" | "COMPLETED" | undefined,
  page: number,
  limit: number,
) {
  const params = { ...(status ? { status } : {}), page, limit };
  return useFetchData(
    key(agentKeys.fxInventory.disbursements(params)),
    () => agentApi.fxInventory.disbursements(params),
    true,
    fresh,
  );
}

function usePeriodBalance(period: AgentDashboardCashStatsPeriod, currency: string) {
  return useFetchData(
    key(agentKeys.dashboard.balance(period, currency)),
    () => agentApi.dashboard.balance(period, currency),
    true,
    fresh,
  );
}

function usePeriodCashStats(period: AgentDashboardCashStatsPeriod, currency: string) {
  return useFetchData(
    key(agentKeys.dashboard.cashStats(period, currency)),
    () => agentApi.dashboard.cashStats(period, currency),
    true,
    fresh,
  );
}

// ---- summary cards (visible on every tab) ------------------------------------------------

export function useFxSummary(period: AgentDashboardCashStatsPeriod, picked: string | null) {
  const balancesQuery = useFxBalances();
  const statsQuery = useTransactionStats();
  const confirmedLodgments = useLodgmentsQuery("CONFIRMED", 1, 100);

  const balances = useMemo(() => normalizeBalances(balancesQuery.data?.data), [balancesQuery.data]);
  const confirmed = useMemo(() => normalizeLodgements(confirmedLodgments.data?.data), [confirmedLodgments.data]);

  // The currency pill lists what the agent actually holds, falling back to the supported FX list.
  const currencies = useMemo(() => {
    const held = Object.keys(balances).filter((c) => c !== "NGN");
    return held.length ? held : FX_CODES;
  }, [balances]);
  // Default to the first held currency unless the person picked one that is still available.
  const currency = picked && currencies.includes(picked) ? picked : (currencies[0] ?? "USD");

  const selectedBalance = usePeriodBalance(period, currency);
  const ngnBalance = usePeriodBalance(period, "NGN");

  return {
    currency,
    currencies,
    summary: {
      availableFxInventory: balances[currency] ?? selectedBalance.data?.data?.currentBalance ?? null,
      ngnCashAvailable: balances.NGN ?? ngnBalance.data?.data?.currentBalance ?? null,
      pendingSettlements: statsQuery.data?.data?.pending ?? 0,
      cashLodgement: sum(confirmed.filter((l) => l.currency === "NGN").map((l) => l.amountReceived ?? l.declaredAmount)),
    },
  };
}

// ---- Inventory Position tab -------------------------------------------------------------

export function usePositionData(period: AgentDashboardCashStatsPeriod) {
  const balancesQuery = useFxBalances();
  const confirmedLodgments = useLodgmentsQuery("CONFIRMED", 1, 100);
  const pendingLodgments = useLodgmentsQuery("PENDING_VERIFICATION", 1, 1);

  const periodBalances = useQueries({
    queries: CURRENCY_CODES.map((code) => ({
      queryKey: key(agentKeys.dashboard.balance(period, code)),
      queryFn: () => agentApi.dashboard.balance(period, code),
      retry: false,
      ...fresh,
    })),
  });
  const cashStats = useQueries({
    queries: CURRENCY_CODES.map((code) => ({
      queryKey: key(agentKeys.dashboard.cashStats(period, code)),
      queryFn: () => agentApi.dashboard.cashStats(period, code),
      retry: false,
      ...fresh,
    })),
  });

  const balances = useMemo(() => normalizeBalances(balancesQuery.data?.data), [balancesQuery.data]);
  const confirmed = useMemo(() => normalizeLodgements(confirmedLodgments.data?.data), [confirmedLodgments.data]);

  // Four cheap rows derived from query results; not worth memoising.
  const rows: PositionRow[] = CURRENCY_CODES.map((code, i) => {
    const bal = periodBalances[i]?.data?.data;
    const stats = cashStats[i]?.data?.data;
    const lodged = sum(confirmed.filter((l) => l.currency === code).map((l) => l.amountReceived ?? l.declaredAmount));
    const flagged = confirmed.some((l) => l.currency === code && (l.variance ?? 0) !== 0);
    return {
      currency: code,
      openingBalance: bal?.openingBalance ?? null,
      disbursedFromAdmin: bal?.totalReceived ?? null,
      purchasedFromCustomers: stats?.totalCashDisbursedFromCustomer ?? null,
      soldToCustomers: stats ? -stats.totalCashDisbursed : null,
      lodgedToHq: lodged ? -lodged : null,
      closingBalance: balances[code] ?? bal?.currentBalance ?? null,
      // No endpoint exposes a physical count yet.
      physicalCount: null,
      variance: null,
      status: flagged ? "Variance" : "Reconciled",
    };
  });

  return {
    rows,
    pendingLodgements: paginationOf(pendingLodgments.data)?.total ?? 0,
    isLoading: periodBalances.some((q) => q.isLoading) || cashStats.some((q) => q.isLoading) || balancesQuery.isLoading,
    errorMessage: [...periodBalances, ...cashStats].find((q) => q.error)?.error?.message ?? balancesQuery.error?.message ?? null,
  };
}

// ---- Transactions tab (server-side status filter and paging) ---------------------------------

export function useTransactionsData(
  period: AgentDashboardCashStatsPeriod,
  currency: string,
  status: string | undefined,
  page: number,
) {
  const params = { page, limit: PAGE_SIZE, ...(status ? { status } : {}) };
  const listQuery = useFetchData(
    key(agentKeys.transactions.list(params)),
    () => agentApi.transactions.list(params),
    true,
    { ...fresh, placeholderData: (prev) => prev },
  );
  const statsQuery = useTransactionStats();
  const cashStats = usePeriodCashStats(period, currency);

  const rows = useMemo(() => normalizeTransactions(listQuery.data?.data ?? []), [listQuery.data]);
  const cash = cashStats.data?.data;

  return {
    rows,
    totalPages: Math.max(1, listQuery.data?.pagination?.totalPages ?? 1),
    isLoading: listQuery.isLoading,
    errorMessage: listQuery.error?.message ?? null,
    stats: {
      totalFxPurchased: cash?.totalCashDisbursedFromCustomer ?? 0,
      totalFxSold: cash?.totalCashDisbursed ?? 0,
      transactions: statsQuery.data?.data?.total ?? listQuery.data?.pagination?.total ?? 0,
    },
  };
}

// ---- Inventory Received tab ------------------------------------------------------------------

export function useReceivedData(page: number) {
  const list = useDisbursementsQuery(undefined, page, PAGE_SIZE);
  const approved = useDisbursementsQuery("APPROVED", 1, 100);
  const completed = useDisbursementsQuery("COMPLETED", 1, 1);
  const rejected = useDisbursementsQuery("REJECTED", 1, 1);

  // APPROVED includes receipts the agent already rejected, so split them out client-side.
  const approvedRows = useMemo(() => normalizeDisbursements(approved.data?.data), [approved.data]);
  const awaitingRows = useMemo(() => approvedRows.filter((d) => d.awaitingConfirmation), [approvedRows]);
  const rejectedByAgent = approvedRows.filter((d) => d.status === "Rejected").length;

  return {
    rows: useMemo(() => normalizeDisbursements(list.data?.data), [list.data]),
    awaitingRows,
    totalPages: Math.max(1, paginationOf(list.data)?.totalPages ?? 1),
    isLoading: list.isLoading,
    errorMessage: list.error?.message ?? null,
    stats: {
      awaiting: awaitingRows.length,
      confirmed: paginationOf(completed.data)?.total ?? 0,
      rejected: (paginationOf(rejected.data)?.total ?? 0) + rejectedByAgent,
    },
  };
}

// ---- Cash Lodgement tab ----------------------------------------------------------------------

export function useLodgementData(page: number) {
  const list = useLodgmentsQuery(undefined, page, PAGE_SIZE);
  const pending = useLodgmentsQuery("PENDING_VERIFICATION", 1, 1);
  const confirmed = useLodgmentsQuery("CONFIRMED", 1, 100);

  const confirmedRows = useMemo(() => normalizeLodgements(confirmed.data?.data), [confirmed.data]);

  return {
    rows: useMemo(() => normalizeLodgements(list.data?.data), [list.data]),
    totalPages: Math.max(1, paginationOf(list.data)?.totalPages ?? 1),
    isLoading: list.isLoading,
    errorMessage: list.error?.message ?? null,
    stats: {
      pendingVerification: paginationOf(pending.data)?.total ?? 0,
      confirmed: paginationOf(confirmed.data)?.total ?? 0,
      varianceRecorded: confirmedRows.filter((l) => (l.variance ?? 0) !== 0).length,
    },
  };
}

// ---- Mutations ---------------------------------------------------------------------------------

export function useFxMutations() {
  const queryClient = useQueryClient();
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: key(agentKeys.fxInventory.all) });
    void queryClient.invalidateQueries({ queryKey: key(agentKeys.dashboard.all) });
  };

  return {
    lodgeCash: useCreateData((data: AgentFxLodgeRequest) => agentApi.fxInventory.lodge(data), { onSuccess: refresh }),
    confirmReceipt: useCreateData((id: string) => agentApi.fxInventory.confirmReceipt(id), { onSuccess: refresh }),
    rejectReceipt: useCreateData(
      ({ id, reason }: { id: string; reason: string }) => agentApi.fxInventory.rejectReceipt(id, { reason }),
      { onSuccess: refresh },
    ),
  };
}

// ---- Exports -----------------------------------------------------------------------------------

type DownloadResult = Awaited<ReturnType<typeof agentApi.transactions.export>>;

/** Downloads a CSV generated by the backend, so it covers every row rather than the visible page. */
export function useBackendExport(request: () => Promise<DownloadResult>, fallbackName: string) {
  const mutation = useCreateData(request, {
    onSuccess: ({ blob, filename }) =>
      saveBlob(blob, filename ?? `${fallbackName}-${new Date().toISOString().slice(0, 10)}.csv`),
    onError: (error) =>
      notifications.show({
        title: "Export failed",
        message: getAgentApiErrorMessage(error, "Unable to export. Please try again."),
        color: "red",
      }),
  });
  return { run: () => !mutation.isPending && mutation.mutate(undefined), isPending: mutation.isPending };
}

/**
 * For lists the backend has no export for: pages through the endpoint and returns every row,
 * so the CSV is complete instead of just the visible page.
 */
export async function fetchAllPages(
  fetchPage: (page: number, limit: number) => Promise<AgentFxInventoryListResponse>,
): Promise<unknown[]> {
  const rows: unknown[] = [];
  for (let page = 1, totalPages = 1; page <= totalPages && page <= 50; page++) {
    const res = await fetchPage(page, 100);
    const batch = res.data;
    if (Array.isArray(batch)) rows.push(...batch);
    totalPages = paginationOf(res)?.totalPages ?? 1;
  }
  return rows;
}
