"use client";

import { useMemo } from "react";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import { CURRENCIES } from "@/app/(customer)/_lib/currency";
import { useCreateData, useFetchData } from "@/app/_lib/api/hooks";
import { agentKeys } from "@/app/_lib/api/query-keys";
import type { AgentDashboardCashStatsPeriod, AgentFxLodgeRequest } from "@/app/_lib/api/types";
import { agentApi } from "@/app/agent/_services/agent-api";
import {
  normalizeBalances,
  normalizeDisbursements,
  normalizeLodgements,
  normalizeTransactions,
} from "../_lib/normalize";
import type { InventorySummary, PositionRow } from "../_lib/types";

const LIST_LIMIT = 100;
const CURRENCY_CODES = CURRENCIES.map((c) => c.code);

const sum = (values: Array<number | null | undefined>) =>
  values.reduce<number>((total, v) => total + (v ?? 0), 0);

/**
 * Everything the FX Inventory screen shows, backed by the agent fx-inventory endpoints
 * (balances, lodgments, disbursements) plus the agent transactions list and dashboard balance.
 */
export function useFxInventory(period: AgentDashboardCashStatsPeriod, currencyCode: string) {
  const queryClient = useQueryClient();

  const balancesQuery = useFetchData(
    agentKeys.fxInventory.balances() as unknown as unknown[],
    () => agentApi.fxInventory.balances(),
  );
  const lodgmentsQuery = useFetchData(
    agentKeys.fxInventory.lodgments({ limit: LIST_LIMIT }) as unknown as unknown[],
    () => agentApi.fxInventory.lodgments({ limit: LIST_LIMIT }),
  );
  const disbursementsQuery = useFetchData(
    agentKeys.fxInventory.disbursements({ limit: LIST_LIMIT }) as unknown as unknown[],
    () => agentApi.fxInventory.disbursements({ limit: LIST_LIMIT }),
  );
  const transactionsQuery = useFetchData(
    agentKeys.transactions.list({ page: 1, limit: LIST_LIMIT }) as unknown as unknown[],
    () => agentApi.transactions.list({ page: 1, limit: LIST_LIMIT }),
  );
  const periodBalanceQueries = useQueries({
    queries: CURRENCY_CODES.map((code) => ({
      queryKey: agentKeys.dashboard.balance(period, code) as unknown as unknown[],
      queryFn: () => agentApi.dashboard.balance(period, code),
      retry: false,
    })),
  });

  const balances = useMemo(() => normalizeBalances(balancesQuery.data?.data), [balancesQuery.data]);
  const lodgements = useMemo(() => normalizeLodgements(lodgmentsQuery.data?.data), [lodgmentsQuery.data]);
  const disbursements = useMemo(
    () => normalizeDisbursements(disbursementsQuery.data?.data),
    [disbursementsQuery.data],
  );
  const transactions = useMemo(
    () => normalizeTransactions(transactionsQuery.data?.data ?? []),
    [transactionsQuery.data],
  );

  const periodBalances = periodBalanceQueries.map((q) => q.data?.data);
  const periodBalancesKey = periodBalances.map((b) => b?.currentBalance ?? "x").join("|");

  const positionRows = useMemo<PositionRow[]>(() => {
    return CURRENCY_CODES.map((code, i) => {
      const period = periodBalances[i];
      const confirmedLodged = sum(
        lodgements.filter((l) => l.currency === code && l.status === "Confirmed").map((l) => l.amountReceived ?? l.declaredAmount),
      );
      const inCurrency = transactions.filter((t) => t.currency === code && t.status !== "Rejected");
      const purchased = sum(inCurrency.filter((t) => (t.fxAmount ?? 0) > 0).map((t) => t.fxAmount));
      const sold = sum(inCurrency.filter((t) => (t.fxAmount ?? 0) < 0).map((t) => t.fxAmount));
      const flagged = lodgements.some((l) => l.currency === code && (l.variance ?? 0) !== 0);
      return {
        currency: code,
        openingBalance: period?.openingBalance ?? null,
        disbursedFromAdmin: period?.totalReceived ?? null,
        purchasedFromCustomers: purchased || null,
        soldToCustomers: sold || null,
        lodgedToHq: confirmedLodged ? -confirmedLodged : null,
        closingBalance: balances[code] ?? period?.currentBalance ?? null,
        // No endpoint exposes a physical count yet; reconciliation status follows lodgment variance.
        physicalCount: null,
        variance: null,
        status: flagged ? "Variance" : "Reconciled",
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [balances, lodgements, transactions, periodBalancesKey]);

  const pendingSettlements = transactions.filter((t) => t.status === "Pending" || t.status === "Overdue").length;

  const summary = useMemo<InventorySummary>(
    () => ({
      availableFxInventory: balances[currencyCode] ?? positionRows.find((r) => r.currency === currencyCode)?.closingBalance ?? null,
      ngnCashAvailable: balances.NGN ?? positionRows.find((r) => r.currency === "NGN")?.closingBalance ?? null,
      pendingSettlements,
      cashLodgement: sum(
        lodgements.filter((l) => l.currency === "NGN" && l.status === "Confirmed").map((l) => l.amountReceived ?? l.declaredAmount),
      ),
    }),
    [balances, currencyCode, lodgements, pendingSettlements, positionRows],
  );

  const transactionStats = useMemo(
    () => ({
      totalFxPurchased: sum(transactions.filter((t) => (t.fxAmount ?? 0) > 0 && t.status !== "Rejected").map((t) => t.fxAmount)),
      totalFxSold: Math.abs(sum(transactions.filter((t) => (t.fxAmount ?? 0) < 0 && t.status !== "Rejected").map((t) => t.fxAmount))),
      transactionsThisPeriod: transactionsQuery.data?.pagination?.total ?? transactions.length,
    }),
    [transactions, transactionsQuery.data],
  );

  const disbursementStats = useMemo(
    () => ({
      awaiting: disbursements.filter((d) => d.awaitingConfirmation).length,
      confirmed: disbursements.filter((d) => d.status === "Confirmed").length,
      rejected: disbursements.filter((d) => d.status === "Rejected").length,
    }),
    [disbursements],
  );

  const lodgementStats = useMemo(
    () => ({
      pendingVerification: lodgements.filter((l) => l.status === "Pending Verification").length,
      confirmed: lodgements.filter((l) => l.status === "Confirmed").length,
      varianceRecorded: lodgements.filter((l) => (l.variance ?? 0) !== 0).length,
    }),
    [lodgements],
  );

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: agentKeys.fxInventory.all });
    void queryClient.invalidateQueries({ queryKey: agentKeys.dashboard.all });
  };

  const lodgeCash = useCreateData((data: AgentFxLodgeRequest) => agentApi.fxInventory.lodge(data), {
    onSuccess: refresh,
  });
  const confirmReceipt = useCreateData((id: string) => agentApi.fxInventory.confirmReceipt(id), {
    onSuccess: refresh,
  });
  const rejectReceipt = useCreateData(
    ({ id, reason }: { id: string; reason: string }) => agentApi.fxInventory.rejectReceipt(id, { reason }),
    { onSuccess: refresh },
  );

  const errors = [balancesQuery, lodgmentsQuery, disbursementsQuery, transactionsQuery]
    .map((q) => q.error)
    .filter((e): e is Error => e != null);

  return {
    summary,
    positionRows,
    transactions,
    transactionStats,
    disbursements,
    disbursementStats,
    lodgements,
    lodgementStats,
    pendingLodgements: lodgementStats.pendingVerification,
    isLoading:
      balancesQuery.isLoading || lodgmentsQuery.isLoading || disbursementsQuery.isLoading || transactionsQuery.isLoading,
    errorMessage: errors[0]?.message ?? null,
    lodgeCash,
    confirmReceipt,
    rejectReceipt,
  };
}
