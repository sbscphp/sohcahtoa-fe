"use client";

import { useFetchData } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import { adminApi } from "@/app/admin/_services/admin-api";
import type { ApiResponse } from "@/app/_lib/api/client";

export interface UserStatsData {
  totalUsers: number;
  activeUsers: number;
  deactivatedUsers: number;
}

export function useUserStats() {
  const query = useFetchData<ApiResponse<UserStatsData>>(
    [...adminKeys.management.users.stats()],
    () =>
      adminApi.management.users.getStats() as unknown as Promise<
        ApiResponse<UserStatsData>
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
