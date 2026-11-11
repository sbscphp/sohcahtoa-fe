"use client";

import { useFetchDataSeperateLoading } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import {
  adminApi,
  type FxInventoryAgentsListParams,
} from "@/app/admin/_services/admin-api";

export const FX_INVENTORY_AGENTS_PAGE_SIZE = 20;

export interface FxInventoryAgentRow {
  agentId: string;
  name: string;
  phoneNumber: string;
  email: string;
  totalDisbursements: number;
  totalLodgments: number;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface AgentsListResponse {
  data?: unknown;
  metadata?: {
    pagination?: Partial<Pagination>;
  } | null;
}

function asString(value: unknown, fallback = ""): string {
  if (value === null || value === undefined) return fallback;
  return typeof value === "string" ? value : String(value);
}

function toCount(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function parseAgent(raw: Record<string, unknown>): FxInventoryAgentRow | null {
  const agentId = asString(raw.agentId).trim();
  if (!agentId) return null;

  const phone = asString(raw.phoneNumber).trim();
  const email = asString(raw.email).trim();

  return {
    agentId,
    name: asString(raw.name, "--").trim() || "--",
    phoneNumber: phone || "--",
    email: email || "--",
    totalDisbursements: toCount(raw.totalDisbursements),
    totalLodgments: toCount(raw.totalLodgments),
  };
}

function extractAgents(data: unknown): FxInventoryAgentRow[] {
  const rows = Array.isArray(data) ? data : [];

  return rows.flatMap((item) => {
    if (typeof item !== "object" || item === null) return [];
    const row = parseAgent(item as Record<string, unknown>);
    return row ? [row] : [];
  });
}

function parsePagination(
  response: AgentsListResponse,
  params: FxInventoryAgentsListParams
): Pagination {
  const meta = response.metadata?.pagination;

  return {
    total: typeof meta?.total === "number" ? meta.total : 0,
    page: typeof meta?.page === "number" ? meta.page : params.page ?? 1,
    limit:
      typeof meta?.limit === "number"
        ? meta.limit
        : params.limit ?? FX_INVENTORY_AGENTS_PAGE_SIZE,
    totalPages: typeof meta?.totalPages === "number" ? meta.totalPages : 0,
  };
}

export function useFxInventoryAgents(
  params: FxInventoryAgentsListParams = {},
  enabled = true
) {
  const page = params.page ?? 1;
  const limit = params.limit ?? FX_INVENTORY_AGENTS_PAGE_SIZE;
  const search = params.search?.trim() || undefined;
  const queryParams = { page, limit, search };

  const query = useFetchDataSeperateLoading<AgentsListResponse>(
    [...adminKeys.fxInventory.agents(queryParams)],
    () =>
      adminApi.fxInventory.listAgents(
        queryParams
      ) as unknown as Promise<AgentsListResponse>,
    enabled
  );

  const agents = extractAgents(query.data?.data);
  const pagination = query.data ? parsePagination(query.data, queryParams) : null;

  return {
    agents,
    total: pagination?.total ?? 0,
    page: pagination?.page ?? page,
    totalPages: pagination?.totalPages ?? 0,
    limit: pagination?.limit ?? limit,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
  };
}
