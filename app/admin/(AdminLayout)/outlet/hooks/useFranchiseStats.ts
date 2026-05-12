"use client";

import { useFetchData } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import type { ApiResponse } from "@/app/_lib/api/client";
import { adminApi, type FranchiseStatsData } from "@/app/admin/_services/admin-api";

export function useFranchiseStats() {
  const query = useFetchData<ApiResponse<FranchiseStatsData>>(
    [...adminKeys.outlet.franchises.stats()],
    () =>
      adminApi.outlet.franchises.getStats() as unknown as Promise<ApiResponse<FranchiseStatsData>>,
    true
  );

  return {
    stats: query.data?.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
