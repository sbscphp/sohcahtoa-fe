"use client";

import { useFetchDataSeperateLoading } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import {
  adminApi,
  type FxInventoryDisbursementStatus,
  type FxInventoryDisbursementsListParams,
} from "@/app/admin/_services/admin-api";
import { formatCurrency } from "@/app/utils/helper/formatCurrency";

export const FX_INVENTORY_DISBURSEMENT_PAGE_SIZE = 20;

export const FX_INVENTORY_DISBURSEMENT_STATUS_OPTIONS = [
  { value: "All", label: "Filter By" },
  { value: "PENDING_APPROVAL", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "COMPLETED", label: "Completed" },
];

const STATUS_LABELS: Record<FxInventoryDisbursementStatus, string> = {
  PENDING_APPROVAL: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  COMPLETED: "Completed",
};

export interface FxInventoryDisbursementRow {
  id: string;
  agentName: string;
  agentId: string;
  amount: string;
  date: string;
  time: string;
  workflowStage: string;
  status: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface DisbursementsListResponse {
  data?: unknown;
  metadata?: {
    pagination?: Partial<Pagination>;
  } | null;
}

function asString(value: unknown, fallback = ""): string {
  if (value === null || value === undefined) return fallback;
  return typeof value === "string" ? value : String(value);
}

function firstString(raw: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = asString(raw[key]).trim();
    if (value) return value;
  }
  return "";
}

function toAmount(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function formatAmount(amount: number | null, currency: string): string | null {
  if (amount === null) return null;
  const formatted = formatCurrency(amount, currency || "NGN");
  return formatted || null;
}

function formatDateTime(iso: string): { date: string; time: string } {
  if (!iso) return { date: "--", time: "--" };

  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return { date: "--", time: "--" };

  return {
    date: parsed.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    time: parsed.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
  };
}

function statusLabel(status: string): string {
  const normalized = status.trim().toUpperCase() as FxInventoryDisbursementStatus;
  return STATUS_LABELS[normalized] ?? (status.trim() || "--");
}

function workflowStageLabel(raw: Record<string, unknown>): string {
  const direct = firstString(raw, ["workflowStage", "workflowStageName"]);
  if (direct) return direct;

  const current = raw.currentWorkflowStage;
  if (typeof current === "string" && current.trim()) return current.trim();
  if (current && typeof current === "object") {
    const record = current as Record<string, unknown>;
    const nested = firstString(record, ["name", "label", "stage"]);
    if (nested) return nested;
  }

  return "--";
}

function parseDisbursement(raw: Record<string, unknown>): FxInventoryDisbursementRow {
  const currency = asString(raw.currency, "NGN");
  const amount = toAmount(raw.amount) ?? toAmount(raw.disbursedAmount);
  const { date, time } = formatDateTime(
    firstString(raw, ["disbursedAt", "submittedAt", "createdAt"])
  );

  return {
    id: asString(raw.id),
    agentName: asString(raw.agentName, "--"),
    agentId: asString(raw.agentId, "--"),
    amount: formatAmount(amount, currency) ?? "-",
    date,
    time,
    workflowStage: workflowStageLabel(raw),
    status: statusLabel(asString(raw.status)),
  };
}

function extractDisbursements(data: unknown): FxInventoryDisbursementRow[] {
  const rows = Array.isArray(data) ? data : [];

  return rows
    .filter(
      (item): item is Record<string, unknown> =>
        typeof item === "object" && item !== null
    )
    .map(parseDisbursement);
}

function parsePagination(
  response: DisbursementsListResponse,
  params: FxInventoryDisbursementsListParams
): Pagination {
  const meta = response.metadata?.pagination;

  return {
    total: typeof meta?.total === "number" ? meta.total : 0,
    page: typeof meta?.page === "number" ? meta.page : params.page ?? 1,
    limit:
      typeof meta?.limit === "number"
        ? meta.limit
        : params.limit ?? FX_INVENTORY_DISBURSEMENT_PAGE_SIZE,
    totalPages: typeof meta?.totalPages === "number" ? meta.totalPages : 0,
  };
}

export function useFxInventoryDisbursements(
  params: FxInventoryDisbursementsListParams = {},
  enabled = true
) {
  const page = params.page ?? 1;
  const limit = params.limit ?? FX_INVENTORY_DISBURSEMENT_PAGE_SIZE;
  const search = params.search?.trim() || undefined;
  const status = params.status;

  const queryParams = { page, limit, search, status };

  const query = useFetchDataSeperateLoading<DisbursementsListResponse>(
    [...adminKeys.fxInventory.disbursements(queryParams)],
    () =>
      adminApi.fxInventory.listDisbursements(
        queryParams
      ) as unknown as Promise<DisbursementsListResponse>,
    enabled
  );

  const disbursements = extractDisbursements(query.data?.data);
  const pagination = query.data
    ? parsePagination(query.data, queryParams)
    : null;

  return {
    disbursements,
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
