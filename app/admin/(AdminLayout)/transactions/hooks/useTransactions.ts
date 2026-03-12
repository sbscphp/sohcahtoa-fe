"use client";

import { useFetchDataSeperateLoading } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import { adminApi, type AdminTransactionListParams } from "@/app/admin/_services/admin-api";

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface TransactionsListResponse {
  data?: unknown;
  metadata?: {
    pagination?: Partial<Pagination>;
  } | null;
}

type UnknownRecord = Record<string, unknown>;

export interface TransactionListItem {
  customerName: string;
  id: string;
  date: string;
  type: string;
  stage: string;
  workflow: string;
  amount: number;
  status: "Pending" | "Settled" | "Rejected" | "More Info";
}

export interface UseTransactionsParams extends AdminTransactionListParams {}

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
  const normalized = value.trim();
  if (!normalized) return "";
  return normalized
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeStatus(value: unknown): TransactionListItem["status"] {
  const status = String(value ?? "").trim().toLowerCase().replace(/[_-]+/g, " ");
  if (status === "approved" || status === "settled" || status === "completed") return "Settled";
  if (status === "rejected") return "Rejected";
  if (status === "request information" || status === "request more info" || status === "more info") {
    return "More Info";
  }
  return "Pending";
}

function formatDate(value: unknown): string {
  if (!value) return "--";
  const stringValue = String(value);
  const date = new Date(stringValue);
  if (Number.isNaN(date.getTime())) {
    return stringValue;
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getCustomerName(raw: UnknownRecord): string {
  const customer = raw.customer && typeof raw.customer === "object" ? (raw.customer as UnknownRecord) : null;
  return (
    asString(raw.customerName) ||
    asString(raw.customer_name) ||
    asString(customer?.fullName) ||
    asString(customer?.name) ||
    "--"
  );
}

function getId(raw: UnknownRecord): string {
  const candidate = raw.id ?? raw.transactionId ?? raw.txId;
  return candidate == null ? "" : String(candidate);
}

function parseTransaction(raw: UnknownRecord): TransactionListItem {
  return {
    customerName: getCustomerName(raw),
    id: getId(raw),
    date: formatDate(raw.createdAt ?? raw.date ?? raw.transactionDate ?? raw.updatedAt),
    type: toSentenceCase(asString(raw.type) || asString(raw.transactionType) || "--"),
    stage: toSentenceCase(asString(raw.step) || asString(raw.stage) || asString(raw.transactionStage) || "--"),
    workflow: toSentenceCase(asString(raw.workflow) || asString(raw.workflowStage) || "--"),
    amount: asNumber(raw.amount ?? raw.value ?? raw.transactionValue),
    status: normalizeStatus(raw.status),
  };
}

function parseTransactions(data: unknown): TransactionListItem[] {
  if (Array.isArray(data)) {
    return data
      .filter((item): item is UnknownRecord => typeof item === "object" && item !== null)
      .map(parseTransaction);
  }

  if (!data || typeof data !== "object") {
    return [];
  }

  const dataObj = data as UnknownRecord;
  const nestedCandidates = [
    dataObj.transactions,
    dataObj.items,
    dataObj.rows,
    dataObj.entries,
    dataObj.results,
    dataObj.data,
  ];

  for (const candidate of nestedCandidates) {
    if (Array.isArray(candidate)) {
      return candidate
        .filter((item): item is UnknownRecord => typeof item === "object" && item !== null)
        .map(parseTransaction);
    }
  }

  return [];
}

function parsePagination(response: TransactionsListResponse) {
  const metadataPagination = response.metadata?.pagination;
  if (metadataPagination) {
    return {
      total: asNumber(metadataPagination.total, 0),
      page: asNumber(metadataPagination.page, 1),
      limit: asNumber(metadataPagination.limit, 10),
      totalPages: asNumber(metadataPagination.totalPages, 1),
    };
  }

  if (!response.data || typeof response.data !== "object") {
    return null;
  }

  const dataObj = response.data as UnknownRecord;
  const candidate = dataObj.pagination;
  if (!candidate || typeof candidate !== "object") {
    return null;
  }

  const parsed = candidate as Partial<Pagination>;
  return {
    total: asNumber(parsed.total, 0),
    page: asNumber(parsed.page, 1),
    limit: asNumber(parsed.limit, 10),
    totalPages: asNumber(parsed.totalPages, 1),
  };
}

export function useTransactions(params: UseTransactionsParams = {}) {
  const query = useFetchDataSeperateLoading<TransactionsListResponse>(
    [...adminKeys.transactions.list(params)],
    () => adminApi.transactions.list(params) as unknown as Promise<TransactionsListResponse>,
    true
  );

  const transactions = parseTransactions(query.data?.data);
  const pagination = query.data ? parsePagination(query.data) : null;

  return {
    transactions,
    total: pagination?.total ?? transactions.length,
    page: pagination?.page ?? params.page ?? 1,
    totalPages: pagination?.totalPages ?? 1,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
  };
}
