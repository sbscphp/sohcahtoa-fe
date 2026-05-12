"use client";

import type { ApiResponse } from "@/app/_lib/api/client";
import { useFetchData } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import { adminApi } from "@/app/admin/_services/admin-api";

export interface AgentStatsData {
  total: number;
  activeAgents: number;
  deactivatedAgents: number;
  pendingApproval: number;
}

export function useAgentStats() {
  const query = useFetchData<ApiResponse<AgentStatsData>>(
    [...adminKeys.agent.stats()],
    () =>
      adminApi.agent.getStats() as unknown as Promise<
        ApiResponse<AgentStatsData>
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
