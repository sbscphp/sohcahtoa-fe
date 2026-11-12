"use client";

import type { ApiResponse } from "@/app/_lib/api/client";
import { useFetchData } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import {
  adminApi,
  type FxInventoryAgentOverview,
} from "@/app/admin/_services/admin-api";

export function useFxInventoryAgentOverview(agentId?: string) {
  const query = useFetchData<ApiResponse<FxInventoryAgentOverview>>(
    [...adminKeys.fxInventory.agentOverview(agentId ?? "")],
    () =>
      adminApi.fxInventory.getAgentOverview(agentId ?? "") as unknown as Promise<
        ApiResponse<FxInventoryAgentOverview>
      >,
    Boolean(agentId)
  );

  return {
    overview: query.data?.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
