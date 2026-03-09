"use client";

import type { ApiError } from "@/app/_lib/api/client";
import { useFetchSingleData } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import { adminApi, type AgentDetailsResponseData } from "@/app/admin/_services/admin-api";

interface AgentDetailsResponse {
  success: boolean;
  data?: AgentDetailsResponseData;
  message?: string;
  metadata?: Record<string, unknown> | null;
}

export function useAgentDetails(id?: string) {
  const query = useFetchSingleData<AgentDetailsResponse>(
    [...adminKeys.agent.detail(id ?? "")],
    () => adminApi.agent.getById(id!) as unknown as Promise<AgentDetailsResponse>,
    !!id
  );

  const apiError = query.error as ApiError | null;
  const errorMessage =
    apiError?.message ??
    ((apiError?.data as { message?: string } | undefined)?.message ?? "");
  const isNotFound =
    apiError?.status === 404 ||
    errorMessage.toLowerCase().includes("resource not found");

  return {
    agent: query.data?.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isNotFound,
  };
}
