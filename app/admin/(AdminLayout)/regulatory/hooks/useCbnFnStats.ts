"use client";

import { useMemo } from "react";
import type { ApiResponse } from "@/app/_lib/api/client";
import { useFetchData } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import { adminApi, type AdminCbnFnStatsData } from "@/app/admin/_services/admin-api";

const emptyStats: AdminCbnFnStatsData = {
  dailyFxSalesAllocations: 0,
  fnWindowDailyReports: 0,
  activeComplianceReports: 0,
};

export function useCbnFnStats() {
  const query = useFetchData<ApiResponse<AdminCbnFnStatsData>>(
    [...adminKeys.regulatory.cbnFn.stats()],
    () => adminApi.regulatory.cbnFn.stats() as unknown as Promise<ApiResponse<AdminCbnFnStatsData>>,
    true
  );

  const stats = useMemo(() => query.data?.data ?? emptyStats, [query.data?.data]);

  return {
    stats,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
  };
}
