"use client";

import { useFetchDataSeperateLoading } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import { adminApi } from "@/app/admin/_services/admin-api";

export interface SettlementDiscrepancyListItem {
  title: string;
  displayId: string;
  outlet: string;
  outletKind: string;
  flaggedDate: string;
  flaggedTime: string;
  priority: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface DiscrepanciesListResponse {
  data?: unknown;
  metadata?: {
    pagination?: Partial<Pagination>;
  } | null;
}

export interface UseSettlementDiscrepanciesParams {
  page?: number;
  limit?: number;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : value == null ? fallback : String(value);
}

function formatDateTime(iso: string): { date: string; time: string } {
  if (!iso) {
    return { date: "--", time: "--" };
  }

  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return { date: "--", time: "--" };
  }

  return {
    date: d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    time: d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
  };
}

function normalizePriority(raw: unknown): string {
  const s = asString(raw).trim().toLowerCase();
  if (s === "high" || s === "critical" || s === "urgent") return "High";
  if (s === "medium" || s === "med" || s === "normal") return "Medium";
  if (s === "low") return "Low";
  return "Low";
}

function parseDiscrepancy(raw: Record<string, unknown>): SettlementDiscrepancyListItem {
  const idRaw =
    raw.id ?? raw.discrepancyId ?? raw.reference ?? raw.discrepancyReference;
  const idStr = idRaw == null ? "" : String(idRaw);
  const displayId = idStr ? (idStr.startsWith("ID:") ? idStr : `ID:${idStr}`) : "--";

  const title =
    asString(raw.title) ||
    asString(raw.description) ||
    asString(raw.reason) ||
    asString(raw.type) ||
    "--";

  const outlet =
    asString(raw.outlet) ||
    asString(raw.outletName) ||
    asString(raw.branchName) ||
    asString(raw.location) ||
    "--";

  const outletKind =
    asString(raw.outletType) ||
    asString(raw.branchType) ||
    asString(raw.franchiseType) ||
    asString(raw.kind) ||
    "";

  const iso =
    asString(raw.flaggedAt) ||
    asString(raw.flaggedDate) ||
    asString(raw.createdAt) ||
    asString(raw.updatedAt) ||
    "";
  const { date: flaggedDate, time: flaggedTime } = formatDateTime(iso);

  const priority = normalizePriority(raw.priority ?? raw.severity);

  return {
    title,
    displayId,
    outlet,
    outletKind,
    flaggedDate,
    flaggedTime,
    priority,
  };
}

function extractDiscrepancies(data: unknown): SettlementDiscrepancyListItem[] {
  if (Array.isArray(data)) {
    return data
      .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
      .map(parseDiscrepancy);
  }

  if (!data || typeof data !== "object") {
    return [];
  }

  const objectData = data as Record<string, unknown>;
  const nestedCandidates = [objectData.items, objectData.rows, objectData.discrepancies];

  for (const candidate of nestedCandidates) {
    if (Array.isArray(candidate)) {
      return candidate
        .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
        .map(parseDiscrepancy);
    }
  }

  return [];
}

function parsePagination(response: DiscrepanciesListResponse, params: UseSettlementDiscrepanciesParams): Pagination {
  const meta = response.metadata?.pagination;
  if (meta) {
    return {
      total: typeof meta.total === "number" ? meta.total : 0,
      page: typeof meta.page === "number" ? meta.page : params.page ?? 1,
      limit: typeof meta.limit === "number" ? meta.limit : params.limit ?? 10,
      totalPages: typeof meta.totalPages === "number" ? meta.totalPages : 0,
    };
  }

  return {
    total: 0,
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    totalPages: 0,
  };
}

export function useSettlementDiscrepancies(params: UseSettlementDiscrepanciesParams = {}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;

  const query = useFetchDataSeperateLoading<DiscrepanciesListResponse>(
    [...adminKeys.settlement.discrepancies({ page, limit })],
    () =>
      adminApi.settlement.listDiscrepancies({ page, limit }) as unknown as Promise<DiscrepanciesListResponse>,
    true
  );

  const discrepancies = extractDiscrepancies(query.data?.data);
  const pagination = query.data ? parsePagination(query.data, { page, limit }) : null;

  return {
    discrepancies,
    page: pagination?.page ?? page,
    totalPages: pagination?.totalPages ?? 0,
    limit: pagination?.limit ?? limit,
    total: pagination?.total ?? 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
  };
}
