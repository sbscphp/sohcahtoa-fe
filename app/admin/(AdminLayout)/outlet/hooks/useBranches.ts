"use client";

import { useFetchDataSeperateLoading } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import {
  adminApi,
  type BranchListItemData,
  type BranchListParams,
} from "@/app/admin/_services/admin-api";

export type BranchStatus = "Active" | "Deactivated";

export interface BranchListItem {
  id: string;
  name: string;
  managerName: string;
  managerEmail: string;
  address: string;
  status: BranchStatus;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface BranchesResponse {
  data?: BranchListItemData[] | unknown;
  metadata?: {
    pagination?: Pagination;
  } | null;
}

function parseBranch(item: BranchListItemData): BranchListItem {
  return {
    id: item.id,
    name: item.branchName || "--",
    managerName: item.branchManager || "--",
    managerEmail: item.email || "--",
    address: item.address || "--",
    status: item.isActive ? "Active" : "Deactivated",
  };
}

function extractBranches(data: unknown): BranchListItem[] {
  if (!Array.isArray(data)) return [];

  return data
    .filter((item): item is BranchListItemData => typeof item === "object" && item !== null)
    .map(parseBranch);
}

export function useBranches(params: BranchListParams = {}) {
  const query = useFetchDataSeperateLoading<BranchesResponse>(
    [...adminKeys.outlet.branches.list(params)],
    () => adminApi.outlet.branches.list(params) as unknown as Promise<BranchesResponse>,
    true
  );

  const branches = extractBranches(query.data?.data);
  const pagination = query.data?.metadata?.pagination ?? null;

  return {
    branches,
    total: pagination?.total ?? 0,
    page: pagination?.page ?? 1,
    totalPages: pagination?.totalPages ?? 1,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
  };
}
