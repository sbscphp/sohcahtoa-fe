"use client";

import { useFetchData } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import { adminApi, type AdminTransactionStatsData } from "@/app/admin/_services/admin-api";
import type { ApiResponse } from "@/app/_lib/api/client";

export function useTransactionStats() {
  const query = useFetchData<ApiResponse<AdminTransactionStatsData>>(
    [...adminKeys.transactions.stats()],
    () =>
      adminApi.transactions.getStats() as unknown as Promise<
        ApiResponse<AdminTransactionStatsData>
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
