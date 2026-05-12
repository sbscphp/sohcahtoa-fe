"use client";

import { useFetchDataSeperateLoading } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import { adminApi } from "@/app/admin/_services/admin-api";

export interface SettlementPendingReconciliationListItem {
  id: string;
  location: string;
  priority: string;
  time: string;
  isOverdue: boolean;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface PendingReconciliationsListResponse {
  data?: unknown;
  metadata?: {
    pagination?: Partial<Pagination>;
  } | null;
}

export interface UseSettlementPendingReconciliationsParams {
  page?: number;
  limit?: number;
}

function asString(value: unknown, fallback = ""): string {
  if (value === null || value === undefined) return fallback;
  return typeof value === "string" ? value : String(value);
}

function normalizePriority(raw: unknown): string {
  const s = asString(raw).trim().toLowerCase();
  if (s === "high" || s === "critical" || s === "urgent") return "High";
  if (s === "medium" || s === "med" || s === "normal") return "Medium";
  if (s === "low") return "Low";
  return "Low";
}

function parsePendingReconciliation(
  raw: Record<string, unknown>
): SettlementPendingReconciliationListItem {
  const idRaw =
    raw.id ??
    raw.reference ??
    raw.ticketId ??
    raw.reconciliationId ??
    raw.discrepancyId ??
    raw.flagId;
  const id = asString(idRaw, "--") || "--";

  const location =
    asString(raw.location) ||
    asString(raw.outlet) ||
    asString(raw.outletName) ||
    asString(raw.branchName) ||
    asString(raw.branch) ||
    asString(raw.state) ||
    "--";

  const priority = normalizePriority(raw.priority ?? raw.severity);

  const time =
    asString(raw.time) ||
    asString(raw.dueIn) ||
    asString(raw.dueAt) ||
    asString(raw.overdueDuration) ||
    asString(raw.createdAt) ||
    "--";

  const isOverdue =
    raw.isOverdue === true ||
    raw.overdue === true ||
    raw.overdueFlag === true ||
    (typeof raw.time === "string" && raw.time.toLowerCase().includes("overdue")) ||
    (typeof raw.dueIn === "string" && raw.dueIn.toLowerCase().includes("overdue")) ||
    time.toLowerCase().includes("overdue");

  return {
    id,
    location,
    priority,
    time,
    isOverdue: Boolean(isOverdue),
  };
}

function extractPendingReconciliations(
  data: unknown
): SettlementPendingReconciliationListItem[] {
  if (Array.isArray(data)) {
    return data
      .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
      .map(parsePendingReconciliation);
  }

  if (!data || typeof data !== "object") return [];

  const objectData = data as Record<string, unknown>;
  const nestedCandidates = [
    objectData.items,
    objectData.rows,
    objectData.pendingReconciliations,
  ];

  for (const candidate of nestedCandidates) {
    if (Array.isArray(candidate)) {
      return candidate
        .filter(
          (item): item is Record<string, unknown> =>
            typeof item === "object" && item !== null
        )
        .map(parsePendingReconciliation);
    }
  }

  return [];
}

function parsePagination(
  response: PendingReconciliationsListResponse,
  params: UseSettlementPendingReconciliationsParams
): Pagination {
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

export function useSettlementPendingReconciliations(
  params: UseSettlementPendingReconciliationsParams = {}
) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;

  const query = useFetchDataSeperateLoading<PendingReconciliationsListResponse>(
    [...adminKeys.settlement.pendingReconciliations({ page, limit })],
    () =>
      adminApi.settlement.listPendingReconciliations({ page, limit }) as unknown as Promise<
        PendingReconciliationsListResponse
      >,
    true
  );

  const pendingReconciliations = extractPendingReconciliations(query.data?.data);
  const pagination = query.data
    ? parsePagination(query.data, { page, limit })
    : null;

  return {
    pendingReconciliations,
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

