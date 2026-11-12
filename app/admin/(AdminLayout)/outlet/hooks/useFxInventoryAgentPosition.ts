"use client";

import type { ApiResponse } from "@/app/_lib/api/client";
import { useFetchData } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import {
  adminApi,
  type FxInventoryAgentPosition,
  type FxInventoryAgentPositionParams,
} from "@/app/admin/_services/admin-api";

export function useFxInventoryAgentPosition(
  agentId?: string,
  params?: FxInventoryAgentPositionParams
) {
  const query = useFetchData<ApiResponse<FxInventoryAgentPosition>>(
    [...adminKeys.fxInventory.agentInventoryPosition(agentId ?? "", params)],
    () =>
      adminApi.fxInventory.getAgentInventoryPosition(
        agentId ?? "",
        params
      ) as unknown as Promise<ApiResponse<FxInventoryAgentPosition>>,
    Boolean(agentId)
  );

  return {
    position: query.data?.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
  };
}
