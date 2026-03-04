"use client";

import { useFetchDataSeperateLoading } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import { adminApi } from "@/app/admin/_services/admin-api";

type AgentStatus = "Active" | "Deactivated";

interface AgentApiItem {
  id?: string | number;
  agentId?: string | number;
  userId?: string | number;
  fullName?: string;
  agentName?: string;
  name?: string;
  phone?: string;
  phoneNumber?: string;
  email?: string;
  emailAddress?: string;
  totalTransactions?: number | string;
  transactionCount?: number | string;
  numberOfTransactions?: number | string;
  transactionVolume?: number | string;
  totalTransactionVolume?: number | string;
  totalVolume?: number | string;
  isActive?: boolean;
  status?: string;
}

interface AgentsListResponse {
  success: boolean;
  data: AgentApiItem[] | { agents?: AgentApiItem[]; items?: AgentApiItem[] };
  metadata?: {
    pagination?: {
      total?: number;
      page?: number;
      limit?: number;
      totalPages?: number;
    };
  } | null;
}

export interface AgentRowItem {
  agentName: string;
  id: string;
  phone: string;
  email: string;
  totalTransactions: number;
  transactionVolume: number;
  status: AgentStatus;
}

function parseNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) return numeric;
  }
  return 0;
}

function toStatus(value: AgentApiItem): AgentStatus {
  if (typeof value.isActive === "boolean") {
    return value.isActive ? "Active" : "Deactivated";
  }

  const normalized = (value.status ?? "").toLowerCase();
  return normalized === "active" ? "Active" : "Deactivated";
}

function mapAgent(item: AgentApiItem): AgentRowItem {
  return {
    id: String(item.id ?? item.agentId ?? item.userId ?? ""),
    agentName: item.fullName ?? item.agentName ?? item.name ?? "—",
    phone: item.phone ?? item.phoneNumber ?? "—",
    email: item.email ?? item.emailAddress ?? "—",
    totalTransactions: parseNumber(
      item.totalTransactions ?? item.transactionCount ?? item.numberOfTransactions
    ),
    transactionVolume: parseNumber(
      item.transactionVolume ?? item.totalTransactionVolume ?? item.totalVolume
    ),
    status: toStatus(item),
  };
}

function extractAgents(
  responseData: AgentsListResponse["data"] | undefined
): AgentApiItem[] {
  if (Array.isArray(responseData)) return responseData;
  if (!responseData || typeof responseData !== "object") return [];
  return responseData.agents ?? responseData.items ?? [];
}

export interface UseAgentsParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  branch?: string;
  fromDate?: string;
  toDate?: string;
  sort?: string;
}

export function useAgents(params: UseAgentsParams = {}) {
  const query = useFetchDataSeperateLoading<AgentsListResponse>(
    [...adminKeys.agent.list(params)],
    () =>
      adminApi.agent.list(params) as unknown as Promise<AgentsListResponse>,
    true
  );

  const entries = extractAgents(query.data?.data).map(mapAgent);
  const pagination = query.data?.metadata?.pagination;

  return {
    agents: entries,
    total: pagination?.total ?? entries.length,
    page: pagination?.page ?? params.page ?? 1,
    totalPages: pagination?.totalPages ?? 1,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
  };
}
