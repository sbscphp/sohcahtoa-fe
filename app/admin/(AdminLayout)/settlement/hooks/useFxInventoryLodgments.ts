"use client";

import { useFetchDataSeperateLoading } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import {
  adminApi,
  type FxInventoryLodgmentStatus,
  type FxInventoryLodgmentsListParams,
} from "@/app/admin/_services/admin-api";
import { formatCurrency } from "@/app/utils/helper/formatCurrency";

export const FX_INVENTORY_LODGMENT_PAGE_SIZE = 20;

export const FX_INVENTORY_LODGMENT_STATUS_OPTIONS = [
  { value: "All", label: "Filter By" },
  { value: "PENDING_VERIFICATION", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "REJECTED", label: "Rejected" },
];

const STATUS_LABELS: Record<FxInventoryLodgmentStatus, string> = {
  PENDING_VERIFICATION: "Pending",
  CONFIRMED: "Confirmed",
  REJECTED: "Rejected",
};

export interface FxInventoryLodgmentRow {
  id: string;
  agentName: string;
  agentId: string;
  amountLodged: string;
  updatedAmount: string | null;
  date: string;
  time: string;
  status: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface LodgmentsListResponse {
  data?: unknown;
  metadata?: {
    pagination?: Partial<Pagination>;
  } | null;
}

function asString(value: unknown, fallback = ""): string {
  if (value === null || value === undefined) return fallback;
  return typeof value === "string" ? value : String(value);
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
  const normalized = status.trim().toUpperCase() as FxInventoryLodgmentStatus;
  return STATUS_LABELS[normalized] ?? (status.trim() || "--");
}

function parseLodgment(raw: Record<string, unknown>): FxInventoryLodgmentRow {
  const currency = asString(raw.currency, "NGN");
  const statedAmount = toAmount(raw.statedAmount);
  const confirmedAmount = toAmount(raw.confirmedAmount);
  const { date, time } = formatDateTime(asString(raw.submittedAt));

  return {
    id: asString(raw.id),
    agentName: asString(raw.agentName, "--"),
    agentId: asString(raw.agentId, "--"),
    amountLodged: formatAmount(statedAmount, currency) ?? "-",
    updatedAmount: formatAmount(confirmedAmount, currency),
    date,
    time,
    status: statusLabel(asString(raw.status)),
  };
}

function extractLodgments(data: unknown): FxInventoryLodgmentRow[] {
  const rows = Array.isArray(data) ? data : [];

  return rows
    .filter(
      (item): item is Record<string, unknown> =>
        typeof item === "object" && item !== null
    )
    .map(parseLodgment);
}

function parsePagination(
  response: LodgmentsListResponse,
  params: FxInventoryLodgmentsListParams
): Pagination {
  const meta = response.metadata?.pagination;

  return {
    total: typeof meta?.total === "number" ? meta.total : 0,
    page: typeof meta?.page === "number" ? meta.page : params.page ?? 1,
    limit:
      typeof meta?.limit === "number"
        ? meta.limit
        : params.limit ?? FX_INVENTORY_LODGMENT_PAGE_SIZE,
    totalPages: typeof meta?.totalPages === "number" ? meta.totalPages : 0,
  };
}

export function useFxInventoryLodgments(
  params: FxInventoryLodgmentsListParams = {},
  enabled = true
) {
  const page = params.page ?? 1;
  const limit = params.limit ?? FX_INVENTORY_LODGMENT_PAGE_SIZE;
  const search = params.search?.trim() || undefined;
  const status = params.status;

  const queryParams = { page, limit, search, status };

  const query = useFetchDataSeperateLoading<LodgmentsListResponse>(
    [...adminKeys.fxInventory.lodgments(queryParams)],
    () =>
      adminApi.fxInventory.listLodgments(queryParams) as unknown as Promise<LodgmentsListResponse>,
    enabled
  );

  const lodgments = extractLodgments(query.data?.data);
  const pagination = query.data
    ? parsePagination(query.data, queryParams)
    : null;

  return {
    lodgments,
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
