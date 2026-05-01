"use client";

import type { ApiResponse } from "@/app/_lib/api/client";
import { useFetchData } from "@/app/_lib/api/hooks";
import {
  adminApi,
  type WorkflowManagementStatsData,
} from "@/app/admin/_services/admin-api";

export function useWorkflowManagementStats() {
  const query = useFetchData<ApiResponse<WorkflowManagementStatsData>>(
    ["admin", "workflow", "management", "stats"],
    () =>
      adminApi.workflow.getManagementStats() as unknown as Promise<
        ApiResponse<WorkflowManagementStatsData>
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
