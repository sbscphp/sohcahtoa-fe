"use client";

import { useMemo } from "react";
import { useFetchData } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import { adminApi, type AgentAllData } from "@/app/admin/_services/admin-api";
import type { ApiResponse } from "@/app/_lib/api/client";

interface SelectOption {
  value: string;
  label: string;
}

export function useAgentsAll() {
  const query = useFetchData<ApiResponse<AgentAllData[]>>(
    [...adminKeys.agent.all],
    () => adminApi.agent.getAll() as unknown as Promise<ApiResponse<AgentAllData[]>>,
    true
  );

  const agentOptions = useMemo<SelectOption[]>(() => {
    const rawAgents = query.data?.data;
    if (!Array.isArray(rawAgents)) return [];

    return rawAgents
      .filter((agent): agent is AgentAllData => typeof agent?.id === "string")
      .map((agent) => ({
        value: agent.id,
        label: `${agent.name} (${agent.branchName})`,
      }));
  }, [query.data?.data]);

  return {
    agents: query.data?.data,
    agentOptions,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

