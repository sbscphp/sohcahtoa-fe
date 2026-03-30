"use client";

import { useFetchDataSeperateLoading } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import { adminApi } from "@/app/admin/_services/admin-api";
import type { BranchAgentListItemData, BranchAgentListParams } from "@/app/admin/_services/admin-api";

type BranchAgentStatus = "Active" | "Deactivated";

export interface BranchAgentListItem {
  id: string;
  agentName: string;
  phone: string;
  email: string;
  totalTransactions: number;
  transactionVolume: number;
  status: BranchAgentStatus;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface BranchAgentsResponse {
  data?: unknown;
  metadata?: {
    pagination?: Partial<Pagination>;
  } | null;
}

type UnknownRecord = Record<string, unknown>;

function parseNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) return numeric;
  }
  return 0;
}

function toStatus(value: BranchAgentListItemData): BranchAgentStatus {
  if (typeof value.isActive === "boolean") {
    return value.isActive ? "Active" : "Deactivated";
  }

  const normalized = String(value.status ?? "").toLowerCase();
  return normalized === "active" ? "Active" : "Deactivated";
}

function mapAgent(item: BranchAgentListItemData): BranchAgentListItem {
  return {
    id: String(item.id ?? item.agentId ?? item.userId ?? ""),
    agentName: item.fullName ?? item.agentName ?? item.name ?? "—",
    phone: item.phone ?? item.phoneNumber ?? "—",
    email: item.email ?? item.emailAddress ?? "—",
    totalTransactions: parseNumber(
      item.totalTransactions ?? item.transactionCount ?? item.numberOfTransactions
    ),
    transactionVolume: parseNumber(
      item.transactionVolume ??
        item.totalTransactionVolume ??
        item.totalVolume
    ),
    status: toStatus(item),
  };
}

function extractAgents(data: BranchAgentsResponse["data"]): BranchAgentListItem[] {
  if (Array.isArray(data)) {
    return data
      .filter((item): item is BranchAgentListItemData => typeof item === "object" && item !== null)
      .map(mapAgent);
  }

  if (!data || typeof data !== "object") return [];

  const obj = data as UnknownRecord;
  const agents = (obj as { agents?: BranchAgentListItemData[]; items?: BranchAgentListItemData[] })
    .agents ?? (obj as { agents?: BranchAgentListItemData[]; items?: BranchAgentListItemData[] }).items;

  if (!Array.isArray(agents)) return [];
  return agents.map(mapAgent);
}

function parsePagination(response: BranchAgentsResponse): number | null {
  const metadataPagination = response.metadata?.pagination;
  if (!metadataPagination) return null;

  const totalPages = metadataPagination.totalPages;
  if (typeof totalPages === "number" && Number.isFinite(totalPages)) return totalPages;
  if (typeof totalPages === "string" && totalPages.trim()) {
    const parsed = Number(totalPages);
    if (Number.isFinite(parsed)) return parsed;
  }

  return null;
}

export function useBranchAgents(branchId: string, params: BranchAgentListParams = {}) {
  const query = useFetchDataSeperateLoading<BranchAgentsResponse>(
    [...adminKeys.outlet.branches.agents.list(branchId, params)],
    () =>
      adminApi.outlet.branches.agents.list(
        branchId,
        params
      ) as unknown as Promise<BranchAgentsResponse>,
    Boolean(branchId)
  );

  const agents = extractAgents(query.data?.data);
  const totalPages = query.data ? parsePagination(query.data) ?? 1 : 1;

  return {
    agents,
    totalPages,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
  };
}

