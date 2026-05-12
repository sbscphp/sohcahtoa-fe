"use client";

import type { ApiResponse } from "@/app/_lib/api/client";
import { useFetchData } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import type { AdminDashboardData } from "@/app/admin/_types/dashboard";
import { adminApi } from "@/app/admin/_services/admin-api";
import {
  mapRecentTransactions,
  mapTransactionSummaryChartData,
  mapTransactionsByTypeDonut,
  mergeDashboardFeedSorted,
} from "../mapDashboardData";

export function useAdminDashboard() {
  const query = useFetchData<ApiResponse<AdminDashboardData>>(
    [...adminKeys.dashboard.stats()],
    () => adminApi.dashboard.getStats(),
    true
  );

  const raw = query.data?.data ?? null;

  return {
    data: raw,
    counters: raw?.counters ?? null,
    transactionSummary: raw?.transactionSummary ?? null,
    transactionsByType: raw?.transactionsByType ?? null,
    recentTransactions: raw ? mapRecentTransactions(raw.recentTransactions) : [],
    taskNotificationFeed: raw
      ? mergeDashboardFeedSorted(raw.tasks, raw.notifications)
      : [],
    barChartData: raw
      ? mapTransactionSummaryChartData(raw.transactionSummary)
      : [],
    donutData: raw ? mapTransactionsByTypeDonut(raw.transactionsByType) : [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
