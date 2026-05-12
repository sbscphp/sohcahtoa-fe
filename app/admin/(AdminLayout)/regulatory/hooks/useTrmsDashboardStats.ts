"use client";

import { useMemo } from "react";
import type { ApiResponse } from "@/app/_lib/api/client";
import { useFetchData } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import { adminApi, type AdminTrmsDashboardData } from "@/app/admin/_services/admin-api";

const emptyStats: AdminTrmsDashboardData = {
  submittedReports: 0,
  pendingSubmissions: 0,
  failedSubmissions: 0,
  rejectedReports: 0,
};

export function useTrmsDashboardStats() {
  const query = useFetchData<ApiResponse<AdminTrmsDashboardData>>(
    [...adminKeys.regulatory.trms.stats()],
    () => adminApi.regulatory.trms.stats() as unknown as Promise<ApiResponse<AdminTrmsDashboardData>>,
    true
  );

  const stats = useMemo(
    () => query.data?.data ?? emptyStats,
    [query.data?.data]
  );

  return {
    stats,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
  };
}

