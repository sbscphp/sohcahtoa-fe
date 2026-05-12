"use client";

import { useFetchDataSeperateLoading } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import {
  adminApi,
  type FranchiseTransactionListParams,
} from "@/app/admin/_services/admin-api";

type UnknownRecord = Record<string, unknown>;

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface FranchiseTransactionsResponse {
  data?: unknown;
  metadata?: {
    pagination?: Partial<Pagination>;
  } | null;
}

export interface FranchiseTransactionListItem {
  id: string;
  transactionId: string;
  actionDate: string;
  actionTime: string;
  branchName: string;
  agentName: string;
  type: string;
  actionEffect: string;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : fallback;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
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

function parseTransaction(raw: UnknownRecord): FranchiseTransactionListItem {
  const createdAt = raw.createdAt ?? raw.transactionDate ?? raw.date ?? raw.updatedAt;
  const { date, time } = formatDateAndTime(createdAt);
  const branch =
    raw.branch && typeof raw.branch === "object" ? (raw.branch as UnknownRecord) : null;
  const agent =
    raw.agent && typeof raw.agent === "object" ? (raw.agent as UnknownRecord) : null;

  return {
    id: String(raw.id ?? raw.transactionId ?? ""),
    transactionId:
      asString(raw.transactionId) || asString(raw.reference) || String(raw.id ?? "--"),
    actionDate: date,
    actionTime: time,
    branchName: asString(raw.branchName) || asString(branch?.name) || "--",
    agentName:
      asString(raw.agentName) || asString(agent?.fullName) || asString(agent?.name) || "--",
    type: toSentenceCase(asString(raw.type) || asString(raw.transactionType) || "--"),
    actionEffect: toSentenceCase(asString(raw.status) || "Pending"),
  };
}

function parseTransactions(data: unknown): FranchiseTransactionListItem[] {
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

function parsePagination(response: FranchiseTransactionsResponse) {
  const metadataPagination = response.metadata?.pagination;
  if (!metadataPagination) return null;

  return {
    total: asNumber(metadataPagination.total, 0),
    page: asNumber(metadataPagination.page, 1),
    limit: asNumber(metadataPagination.limit, 10),
    totalPages: asNumber(metadataPagination.totalPages, 1),
  };
}

export function useFranchiseTransactions(
  franchiseId: string,
  params: FranchiseTransactionListParams = {}
) {
  const query = useFetchDataSeperateLoading<FranchiseTransactionsResponse>(
    [...adminKeys.outlet.franchises.transactions.list(franchiseId, params)],
    () =>
      adminApi.outlet.franchises.transactions.list(
        franchiseId,
        params
      ) as unknown as Promise<FranchiseTransactionsResponse>,
    Boolean(franchiseId)
  );

  const transactions = parseTransactions(query.data?.data);
  const pagination = query.data ? parsePagination(query.data) : null;

  return {
    transactions,
    totalPages: pagination?.totalPages ?? 1,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
  };
}
