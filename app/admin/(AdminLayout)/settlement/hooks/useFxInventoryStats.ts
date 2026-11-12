"use client";

import type { ApiResponse } from "@/app/_lib/api/client";
import { useFetchData } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import { adminApi, type FxInventoryStats } from "@/app/admin/_services/admin-api";

export function useFxInventoryStats() {
  const query = useFetchData<ApiResponse<FxInventoryStats>>(
    [...adminKeys.fxInventory.stats()],
    () =>
      adminApi.fxInventory.getStats() as unknown as Promise<
        ApiResponse<FxInventoryStats>
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
