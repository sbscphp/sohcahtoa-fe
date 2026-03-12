"use client";

import { useFetchData } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import { adminApi } from "@/app/admin/_services/admin-api";
import type { ApiResponse } from "@/app/_lib/api/client";

export interface RoleStatsData {
  totalRoles: number;
  activeRoles: number;
  inactiveRoles: number;
}

export function useRoleStats() {
  const query = useFetchData<ApiResponse<RoleStatsData>>(
    [...adminKeys.management.roles.stats()],
    () =>
      adminApi.management.roles.getStats() as unknown as Promise<
        ApiResponse<RoleStatsData>
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
