"use client";

import { useFetchSingleData } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import type { ApiResponse } from "@/app/_lib/api/client";
import { adminApi, type BranchDetailsData } from "@/app/admin/_services/admin-api";

export function useBranchDetails(branchId: string) {
  const query = useFetchSingleData<ApiResponse<BranchDetailsData>>(
    [...adminKeys.outlet.branches.detail(branchId)],
    () =>
      adminApi.outlet.branches.getById(branchId) as unknown as Promise<
        ApiResponse<BranchDetailsData>
      >,
    !!branchId
  );

  return {
    branch: query.data?.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/** Maps API status (e.g. PENDING) to display label for StatusBadge */
export function formatBranchStatusForBadge(status: string): string {
  if (!status) return "--";
  const normalized = status.trim().toLowerCase().replace(/_/g, "");
  if (normalized === "pending") return "Pending";
  if (normalized === "active") return "Active";
  if (normalized === "deactivated" || normalized === "inactive") return "Deactivated";
  if (normalized === "pendingapproval") return "Pending";

  return status
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export function formatBranchCreatedAt(createdAt: string): string {
  if (!createdAt) return "--";
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) return "--";
  return d.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}
