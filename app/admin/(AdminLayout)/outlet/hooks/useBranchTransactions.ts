"use client";

import { useFetchDataSeperateLoading } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import { adminApi } from "@/app/admin/_services/admin-api";
import type {
  BranchTransactionListParams,
} from "@/app/admin/_services/admin-api";

type UnknownRecord = Record<string, unknown>;

export interface BranchTransactionListItem {
  id: string;
  transactionId: string;
  transactionDate: string;
  transactionTime: string;
  customerName: string;
  transactionType: string;
  transactionStage: string;
  workflowStage: string;
  transactionValue: string;
  status: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface BranchTransactionsResponse {
  data?: unknown;
  metadata?: {
    pagination?: Partial<Pagination>;
  } | null;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function toSentenceCase(value: string): string {
  const normalized = value.trim().replace(/[_-]+/g, " ");
  if (!normalized) return "";

  return normalized
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDateAndTime(value: unknown): { date: string; time: string } {
  if (!value) return { date: "--", time: "--" };

  const stringValue = String(value);
  const parsed = new Date(stringValue);

  if (Number.isNaN(parsed.getTime())) {
    return { date: stringValue, time: "--" };
  }

  return {
    date: parsed.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    time: parsed.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
  };
}

function parseTransaction(raw: UnknownRecord): BranchTransactionListItem {
  const dateAndId =
    raw.dateAndId && typeof raw.dateAndId === "object"
      ? (raw.dateAndId as UnknownRecord)
      : null;
  const createdAt =
    dateAndId?.date ?? raw.createdAt ?? raw.transactionDate ?? raw.date ?? raw.updatedAt;
  const { date, time } = formatDateAndTime(createdAt);
  const transactionValue =
    typeof raw.transactionValue === "number" || typeof raw.transactionValue === "string"
      ? Number(raw.transactionValue).toLocaleString("en-US")
      : "--";

  return {
    id: String(raw.id ?? raw.transactionId ?? ""),
    transactionId:
      asString(dateAndId?.reference) ||
      asString(raw.transactionId) ||
      asString(raw.reference) ||
      String(raw.id ?? "--"),
    transactionDate: date,
    transactionTime: time,
    customerName: asString(raw.customerName) || "--",
    transactionType: toSentenceCase(asString(raw.transactionType) || asString(raw.type) || "--"),
    transactionStage: toSentenceCase(asString(raw.transactionStage) || "--"),
    workflowStage: toSentenceCase(asString(raw.workflowStage) || "--"),
    transactionValue,
    status: toSentenceCase(asString(raw.status) || "Pending"),
  };
}

function parseTransactions(data: unknown): BranchTransactionListItem[] {
  if (Array.isArray(data)) {
    return data
      .filter((item): item is UnknownRecord => typeof item === "object" && item !== null)
      .map(parseTransaction);
  }

  if (!data || typeof data !== "object") return [];

  const dataObj = data as UnknownRecord;
  const candidates = [
    dataObj.transactions,
    dataObj.items,
    dataObj.rows,
    dataObj.entries,
    dataObj.results,
    dataObj.data,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate
        .filter((item): item is UnknownRecord => typeof item === "object" && item !== null)
        .map(parseTransaction);
    }
  }

  return [];
}

function parsePagination(response: BranchTransactionsResponse): number | null {
  const metadataPagination = response.metadata?.pagination;
  if (!metadataPagination) return null;

  const totalPages: unknown = metadataPagination.totalPages;
  if (typeof totalPages === "number" && Number.isFinite(totalPages)) return totalPages;
  if (typeof totalPages === "string" && totalPages.trim()) {
    const parsed = Number(totalPages);
    if (Number.isFinite(parsed)) return parsed;
  }

  return null;
}

export function useBranchTransactions(
  branchId: string,
  params: BranchTransactionListParams = {}
) {
  const query = useFetchDataSeperateLoading<BranchTransactionsResponse>(
    [...adminKeys.outlet.branches.transactions.list(branchId, params)],
    () =>
      adminApi.outlet.branches.transactions.list(
        branchId,
        params
      ) as unknown as Promise<BranchTransactionsResponse>,
    Boolean(branchId)
  );

  const transactions = parseTransactions(query.data?.data);
  const totalPages = query.data ? parsePagination(query.data) ?? 1 : 1;

  return {
    transactions,
    totalPages,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
  };
}

