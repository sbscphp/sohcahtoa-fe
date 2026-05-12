"use client";

import type { ApiResponse } from "@/app/_lib/api/client";
import { useFetchData } from "@/app/_lib/api/hooks";
import { adminApi, type WorkflowStatsData } from "@/app/admin/_services/admin-api";

export function useWorkflowActionStats() {
  const query = useFetchData<ApiResponse<WorkflowStatsData>>(
    ["admin", "workflow", "stats"],
    () =>
      adminApi.workflow.getStats() as unknown as Promise<
        ApiResponse<WorkflowStatsData>
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
