"use client";

import { useMemo } from "react";
import type { ApiResponse } from "@/app/_lib/api/client";
import { useFetchData } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import {
  adminApi,
  type AdminComplianceDashboardData,
} from "@/app/admin/_services/admin-api";

const emptyDashboard: AdminComplianceDashboardData = {
  overview: {
    submittedReports: 0,
    pendingSubmissions: 0,
    failedSubmissions: 0,
    rejectedReports: 0,
  },
  insights: {
    sla: {
      complianceRate: 0,
      onTime: 0,
      late: 0,
      missed: 0,
      trend: { delta: 0 },
      target: 90,
    },
    screening: {
      passed: 0,
      flagged: 0,
      rejected: 0,
      pendingReview: 0,
      totalScreened: 0,
    },
    fxSold: {
      PTA: 0,
      BTA: 0,
      School: 0,
      Medical: 0,
      Imports: 0,
      total: 0,
    },
  },
};

export function useComplianceDashboard() {
  const query = useFetchData<ApiResponse<AdminComplianceDashboardData>>(
    [...adminKeys.regulatory.compliance.dashboard()],
    () =>
      adminApi.regulatory.compliance.dashboard() as unknown as Promise<
        ApiResponse<AdminComplianceDashboardData>
      >,
    true
  );

  const dashboard = useMemo(() => query.data?.data ?? emptyDashboard, [query.data?.data]);

  return {
    dashboard,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
  };
}
