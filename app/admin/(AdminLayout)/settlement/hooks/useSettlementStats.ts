"use client";

import type { ApiResponse } from "@/app/_lib/api/client";
import { useFetchData } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import {
  adminApi,
  type SettlementDashboardStats,
} from "@/app/admin/_services/admin-api";

export function useSettlementStats() {
  const query = useFetchData<ApiResponse<SettlementDashboardStats>>(
    [...adminKeys.settlement.stats()],
    () =>
      adminApi.settlement.getStats() as unknown as Promise<
        ApiResponse<SettlementDashboardStats>
      >,
    true
  );

  return {
    stats: query.data?.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
