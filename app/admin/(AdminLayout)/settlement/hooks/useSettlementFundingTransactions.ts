"use client";

import { useFetchDataSeperateLoading } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import { adminApi } from "@/app/admin/_services/admin-api";
import { toSentenceCase } from "@/app/utils/helper/toSentence";
import { formatTransactionTypeForTables } from "@/app/utils/helper/formatTransactionType";

export const SETTLEMENT_STATUS_FILTER_ORDER = [
  "PENDING",
  "AWAITING_CONFIRMATION",
  "CONFIRMED",
  "FAILED",
  "REFUNDED",
] as const;

export type SettlementStatusFilter =
  (typeof SETTLEMENT_STATUS_FILTER_ORDER)[number];

export const SETTLEMENT_STATUS_FILTER_OPTIONS =
  SETTLEMENT_STATUS_FILTER_ORDER.map((status) => ({
    value: status,
    label: toSentenceCase(status),
  }));

export interface SettlementFundingTransactionListItem {
  id: string;
  transactionId: string;
  referenceId: string;
  customerName: string;
  customerEmail: string;
  transactionType: string;
  transactionStatus: string;
  amount: number;
  currency: string;
  date: string;
  time: string;
  paymentMethod: string;
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
  status?: string;
}

function asString(value: unknown, fallback = ""): string {
  if (value === null || value === undefined) return fallback;
  return typeof value === "string" ? value : String(value);
}

function toNumericAmount(raw: unknown): number {
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string") {
    const parsed = parseFloat(raw.replace(/,/g, ""));
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
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


function getCustomerField(
  raw: Record<string, unknown>,
  field: "name" | "email"
): string {
  const customer =
    raw.customer && typeof raw.customer === "object"
      ? (raw.customer as Record<string, unknown>)
      : null;

  if (field === "name") {
    return asString(customer?.name) || asString(raw.customerName) || "--";
  }

  return asString(customer?.email) || asString(raw.customerEmail) || "--";
}

function parseFundingTransaction(
  raw: Record<string, unknown>
): SettlementFundingTransactionListItem {
  const id = asString(raw.id, "--") || "--";
  const transactionId = asString(raw.transactionId, "--") || "--";
  const referenceId =
    asString(raw.referenceNumber ?? raw.referenceId ?? raw.reference, "--") ||
    "--";
  const customerName = getCustomerField(raw, "name");
  const customerEmail = getCustomerField(raw, "email");
  const transactionType = formatTransactionTypeForTables(
    asString(raw.transactionType ?? raw.type, "--")
  );
  const transactionStatus = asString(raw.transactionStatus, "--");

  const amountRaw = raw.amount ?? raw.value ?? raw.transactionValue ?? raw.total;
  const amount = toNumericAmount(amountRaw);

  const currency = asString(raw.currency, "NGN");

  const paymentMethod = asString(raw.paymentMethod ?? raw.method, "--");
  const status = asString(raw.status, "--");

  const dateTimeIso =
    asString(raw.depositedAt) ||
    asString(raw.confirmedAt) ||
    asString(raw.fundDate) ||
    asString(raw.fundedAt) ||
    asString(raw.dateTime) ||
    asString(raw.createdAt) ||
    asString(raw.updatedAt);

  const { date, time } = formatDateTime(dateTimeIso);

  return {
    id,
    transactionId,
    referenceId,
    customerName,
    customerEmail,
    transactionType,
    transactionStatus,
    amount,
    currency,
    date,
    time,
    paymentMethod,
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
  const status = params.status;

  const query = useFetchDataSeperateLoading<FundingTransactionsListResponse>(
    [...adminKeys.settlement.fundingTransactions({ page, limit, status })],
    () =>
      adminApi.settlement.listFundingTransactions({
        page,
        limit,
        status,
      }) as unknown as Promise<FundingTransactionsListResponse>,
    true
  );

  const transactions = extractFundingTransactions(query.data?.data);
  const pagination = query.data
    ? parsePagination(query.data, { page, limit, status })
    : null;

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

