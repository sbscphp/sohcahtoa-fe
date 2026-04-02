"use client";

import { useFetchData } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import type { ApiResponse } from "@/app/_lib/api/client";
import { adminApi, type BranchStatsData } from "@/app/admin/_services/admin-api";

export function useBranchStats() {
  const query = useFetchData<ApiResponse<BranchStatsData>>(
    [...adminKeys.outlet.branches.stats()],
    () =>
      adminApi.outlet.branches.getStats() as unknown as Promise<ApiResponse<BranchStatsData>>,
    true
  );

  return {
    stats: query.data?.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
