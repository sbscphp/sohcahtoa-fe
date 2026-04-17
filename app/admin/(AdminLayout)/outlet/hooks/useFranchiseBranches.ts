"use client";

import { useFetchDataSeperateLoading } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import {
  adminApi,
  type BranchListItemData,
  type BranchListParams,
} from "@/app/admin/_services/admin-api";

export type BranchStatus = "Active" | "Deactivated";

export interface FranchiseBranchListItem {
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

interface FranchiseBranchesResponse {
  data?: BranchListItemData[] | unknown;
  metadata?: {
    pagination?: Pagination;
  } | null;
}

function parseBranch(item: BranchListItemData): FranchiseBranchListItem {
  return {
    id: item.id,
    name: item.branchName || "--",
    managerName: item.branchManager || "--",
    managerEmail: item.email || "--",
    address: item.address || "--",
    status: item.isActive ? "Active" : "Deactivated",
  };
}

function extractBranches(data: unknown): FranchiseBranchListItem[] {
  if (Array.isArray(data)) {
    return data
      .filter(
        (item): item is BranchListItemData =>
          typeof item === "object" && item !== null,
      )
      .map(parseBranch);
  }

  if (!data || typeof data !== "object") return [];

  const dataObj = data as Record<string, unknown>;
  const candidates = [
    dataObj.branches,
    dataObj.items,
    dataObj.rows,
    dataObj.entries,
    dataObj.results,
    dataObj.data,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate
        .filter(
          (item): item is BranchListItemData =>
            typeof item === "object" && item !== null,
        )
        .map(parseBranch);
    }
  }

  return [];
}

export function useFranchiseBranches(
  franchiseId: string,
  params: BranchListParams = {},
) {
  const query = useFetchDataSeperateLoading<FranchiseBranchesResponse>(
    [...adminKeys.outlet.franchises.branches.list(franchiseId, params)],
    () =>
      adminApi.outlet.franchises.branches.list(
        franchiseId,
        params,
      ) as unknown as Promise<FranchiseBranchesResponse>,
    Boolean(franchiseId),
  );

  const branches = extractBranches(query.data?.data);
  const pagination = query.data?.metadata?.pagination ?? null;

  return {
    branches,
    totalPages: pagination?.totalPages ?? 1,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
  };
}
