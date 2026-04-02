"use client";

import { useFetchDataSeperateLoading } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import { adminApi } from "@/app/admin/_services/admin-api";

export interface SettlementFundingTransactionListItem {
  id: string;
  amount: string;
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

interface FundingTransactionsListResponse {
  data?: unknown;
  metadata?: {
    pagination?: Partial<Pagination>;
  } | null;
}

export interface UseSettlementFundingTransactionsParams {
  page?: number;
  limit?: number;
}

function asString(value: unknown, fallback = ""): string {
  if (value === null || value === undefined) return fallback;
  return typeof value === "string" ? value : String(value);
}

function toDisplayAmount(raw: unknown): string {
  if (raw === null || raw === undefined) return "--";

  if (typeof raw === "string") {
    const trimmed = raw.trim();
    return trimmed || "--";
  }

  if (typeof raw === "number") {
    if (!Number.isFinite(raw)) return "--";
    return raw.toLocaleString("en-NG");
  }

  return asString(raw, "--");
}

function formatDateTime(iso: string): { date: string; time: string } {
  if (!iso) return { date: "--", time: "--" };

  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: "--", time: "--" };

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

function normalizeStatus(raw: unknown): string {
  const s = asString(raw).trim().toLowerCase();
  if (!s) return "Pending approval";

  if (
    s.includes("confirmed") ||
    s.includes("approved") ||
    s.includes("success") ||
    s.includes("completed") ||
    s === "true"
  ) {
    return "Confirmed";
  }

  return "Pending approval";
}

function parseFundingTransaction(
  raw: Record<string, unknown>
): SettlementFundingTransactionListItem {
  const idRaw =
    raw.id ??
    raw.referenceId ??
    raw.reference ??
    raw.transactionId ??
    raw.fundingId ??
    raw.fundId;
  const id = asString(idRaw, "--") || "--";

  const amountRaw =
    raw.amount ??
    raw.value ??
    raw.transactionValue ??
    raw.total ??
    raw.amountSent ??
    raw.fundingAmount;
  const amount = toDisplayAmount(amountRaw);

  const status = normalizeStatus(raw.status ?? raw.state);

  const dateTimeIso =
    asString(raw.dateTime) ||
    asString(raw.fundedAt) ||
    asString(raw.fundDateTime) ||
    asString(raw.createdAt) ||
    asString(raw.dateTimeCreated) ||
    asString(raw.updatedAt) ||
    asString(raw.transactionDateTime);

  const dateFromFields = asString(raw.date);
  const timeFromFields = asString(raw.time);

  if (dateFromFields && timeFromFields) {
    return {
      id,
      amount,
      date: dateFromFields,
      time: timeFromFields,
      status,
    };
  }

  const { date, time } = formatDateTime(dateTimeIso);

  return {
    id,
    amount,
    date,
    time,
    status,
  };
}

function extractFundingTransactions(
  data: unknown
): SettlementFundingTransactionListItem[] {
  if (Array.isArray(data)) {
    return data
      .filter(
        (item): item is Record<string, unknown> =>
          typeof item === "object" && item !== null
      )
      .map(parseFundingTransaction);
  }

  if (!data || typeof data !== "object") return [];

  const obj = data as Record<string, unknown>;
  const candidates = [obj.items, obj.rows, obj.fundingTransactions, obj.transactions];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate
        .filter(
          (item): item is Record<string, unknown> =>
            typeof item === "object" && item !== null
        )
        .map(parseFundingTransaction);
    }
  }

  return [];
}

function parsePagination(
  response: FundingTransactionsListResponse,
  params: UseSettlementFundingTransactionsParams
): Pagination {
  const meta = response.metadata?.pagination;

  return {
    total: typeof meta?.total === "number" ? meta.total : 0,
    page: typeof meta?.page === "number" ? meta.page : params.page ?? 1,
    limit: typeof meta?.limit === "number" ? meta.limit : params.limit ?? 10,
    totalPages: typeof meta?.totalPages === "number" ? meta.totalPages : 0,
  };
}

export function useSettlementFundingTransactions(
  params: UseSettlementFundingTransactionsParams = {}
) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;

  const query = useFetchDataSeperateLoading<FundingTransactionsListResponse>(
    [...adminKeys.settlement.fundingTransactions({ page, limit })],
    () =>
      adminApi.settlement.listFundingTransactions({ page, limit }) as unknown as Promise<
        FundingTransactionsListResponse
      >,
    true
  );

  const transactions = extractFundingTransactions(query.data?.data);
  const pagination = query.data ? parsePagination(query.data, { page, limit }) : null;

  return {
    transactions,
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

