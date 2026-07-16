"use client";

import type { ApiResponse } from "@/app/_lib/api/client";
import { useFetchData } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import type { AdminDashboardData } from "@/app/admin/_types/dashboard";
import { adminApi } from "@/app/admin/_services/admin-api";
import {
  mapDashboardTasks,
  mapRecentTransactions,
  mapTransactionSummaryChartData,
  mapTransactionsByTypeDonut,
} from "../mapDashboardData";

type DashboardFilter = { startDate?: string; endDate?: string; range?: string; txnType?: string };

export function useAdminDashboard(filter?: DashboardFilter) {
  const params =
    filter?.startDate || filter?.endDate || filter?.range || filter?.txnType
      ? {
          startDate: filter.startDate || undefined,
          endDate: filter.endDate || undefined,
          range: filter.range || undefined,
          txnType: filter.txnType || undefined,
        }
      : undefined;

  const query = useFetchData<ApiResponse<AdminDashboardData>>(
    [...adminKeys.dashboard.stats(params)],
    () => adminApi.dashboard.getStats(params),
    true
  );

  const raw = query.data?.data ?? null;

  return {
    data: raw,
    counters: raw?.counters ?? null,
    transactionSummary: raw?.transactionSummary ?? null,
    transactionsByType: raw?.transactionsByType ?? null,
    recentTransactions: raw ? mapRecentTransactions(raw.recentTransactions) : [],
    tasks: raw ? mapDashboardTasks(raw.tasks) : [],
    barChartData: raw
      ? mapTransactionSummaryChartData(raw.transactionSummary)
      : [],
    donutData: raw ? mapTransactionsByTypeDonut(raw.transactionsByType) : [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
