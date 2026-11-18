"use client";

import type { ApiResponse } from "@/app/_lib/api/client";
import { useFetchData } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import {
  adminApi,
  type FxInventoryAgentOverview,
  type FxInventoryAgentOverviewParams,
} from "@/app/admin/_services/admin-api";

function overviewParams(
  params?: FxInventoryAgentOverviewParams
): FxInventoryAgentOverviewParams | undefined {
  if (!params) return undefined;

  const next: FxInventoryAgentOverviewParams = {};
  if (params.currency) next.currency = params.currency;
  if (params.dateFrom) next.dateFrom = params.dateFrom;
  if (params.dateTo) next.dateTo = params.dateTo;
  return next;
}

export function useFxInventoryAgentOverview(
  agentId?: string,
  params?: FxInventoryAgentOverviewParams
) {
  const queryParams = overviewParams(params);
  const query = useFetchData<ApiResponse<FxInventoryAgentOverview>>(
    [...adminKeys.fxInventory.agentOverview(agentId ?? "", queryParams)],
    () =>
      adminApi.fxInventory.getAgentOverview(
        agentId ?? "",
        queryParams
      ) as unknown as Promise<ApiResponse<FxInventoryAgentOverview>>,
    Boolean(agentId)
  );

  return {
    overview: query.data?.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
