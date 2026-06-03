"use client";

import type { ApiResponse } from "@/app/_lib/api/client";
import { useFetchData } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import { adminApi } from "@/app/admin/_services/admin-api";

export interface RateStatsData {
  all: number;
  active: number;
  scheduled: number;
}

export function useRateStats() {
  const query = useFetchData<ApiResponse<RateStatsData>>(
    [...adminKeys.rate.stats()],
    () =>
      adminApi.rate.getStats() as unknown as Promise<ApiResponse<RateStatsData>>,
    true
  );

  return {
    stats: query.data?.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
