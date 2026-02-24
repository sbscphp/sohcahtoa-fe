"use client";

import { useFetchData } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import { adminApi } from "@/app/admin/_services/admin-api";
import type { ApiResponse } from "@/app/_lib/api/client";

export interface DepartmentStatsData {
  totalDepartments: number;
  activeDepartments: number;
  deactivatedDepartments?: number;
  inactiveDepartments?: number;
}

export function useDepartmentStats() {
  const query = useFetchData<ApiResponse<DepartmentStatsData>>(
    [...adminKeys.management.departments.stats()],
    () =>
      adminApi.management.departments.getStats() as unknown as Promise<
        ApiResponse<DepartmentStatsData>
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
