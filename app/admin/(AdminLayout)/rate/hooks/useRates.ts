"use client";

import { useFetchDataSeperateLoading } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import { adminApi, type RateListParams } from "@/app/admin/_services/admin-api";

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface RatesListResponse {
  data?: unknown;
  metadata?: {
    pagination?: Pagination;
  } | null;
}

export interface RateListItem {
  id: string;
  dateTime: string;
  currencyPair: string;
  buyAt: string;
  sellAt: string;
  lastUpdated: string;
  status: string;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function formatNairaValue(value: unknown): string {
  const numeric = asNumber(value);
  if (numeric !== null) {
    return `₦${numeric.toLocaleString("en-NG")}`;
  }

  const raw = asString(value, "--").trim();
  if (!raw) return "--";
  return raw;
}

function formatDateTime(value: unknown): string {
  const raw = asString(value);
  if (!raw) return "--\n--";

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    return "--\n--";
  }

  const day = date.toLocaleDateString("en-CA");
  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return `${day}\n${time}`;
}

function normalizeStatus(value: unknown): string {
  const raw = asString(value).trim().toLowerCase();
  if (raw === "schedule" || raw === "scheduled") return "Scheduled";
  if (raw === "active") return "Active";
  if (raw === "inactive" || raw === "deactivated") return "Deactivated";
  return raw ? `${raw.charAt(0).toUpperCase()}${raw.slice(1)}` : "--";
}

function parseStatusFromValidityWindow(validFromRaw: unknown, validUntilRaw: unknown): string | null {
  const validFrom = asString(validFromRaw).trim();
  const validUntil = asString(validUntilRaw).trim();
  if (!validFrom || !validUntil) return null;

  const start = new Date(validFrom);
  const end = new Date(validUntil);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;

  const now = Date.now();
  if (now < start.getTime()) return "Scheduled";
  if (now > end.getTime()) return "Expired";
  return "Active";
}

function parseStatus(raw: Record<string, unknown>): string {
  const isActive = raw.isActive ?? raw.is_active;
  if (typeof isActive === "boolean") {
    return isActive ? "Active" : "Deactivated";
  }

  const fromWindow = parseStatusFromValidityWindow(
    raw.validFrom ?? raw.valid_from,
    raw.validUntil ?? raw.valid_until
  );
  if (fromWindow) return fromWindow;

  return normalizeStatus(raw.status);
}

function getCurrencyPair(raw: Record<string, unknown>): string {
  const directPair =
    asString(raw.currencyPair) ||
    asString(raw.pair) ||
    asString(raw.currency_code) ||
    asString(raw.currencyCode);
  if (directPair) return directPair;

  const fromCurrency =
    asString(raw.fromCurrency) ||
    asString(raw.from_currency) ||
    asString(raw.baseCurrency) ||
    asString(raw.base_currency);
  const toCurrency =
    asString(raw.toCurrency) ||
    asString(raw.to_currency) ||
    asString(raw.quoteCurrency) ||
    asString(raw.quote_currency);

  if (fromCurrency && toCurrency) {
    return `${fromCurrency}-${toCurrency}`;
  }

  return "--";
}

function parseRate(raw: Record<string, unknown>): RateListItem {
  const validFrom = raw.validFrom ?? raw.valid_from;
  const validUntil = raw.validUntil ?? raw.valid_until;

  return {
    id: String(raw.id ?? raw.rateId ?? raw.rate_id ?? ""),
    dateTime: formatDateTime(
      validFrom ??
        raw.dateTime ??
        raw.startDateTime ??
        raw.startAt ??
        raw.createdAt ??
        raw.created_at
    ),
    currencyPair: getCurrencyPair(raw),
    buyAt: formatNairaValue(raw.buyRate ?? raw.buy_rate ?? raw.buyAt),
    sellAt: formatNairaValue(raw.sellRate ?? raw.sell_rate ?? raw.sellAt),
    lastUpdated: formatDateTime(
      raw.updatedAt ??
        raw.updated_at ??
        raw.lastUpdated ??
        raw.createdAt ??
        raw.created_at ??
        validUntil
    ),
    status: parseStatus(raw),
  };
}

function extractRates(data: unknown): RateListItem[] {
  if (Array.isArray(data)) {
    return data
      .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
      .map(parseRate);
  }

  if (!data || typeof data !== "object") {
    return [];
  }

  const objectData = data as Record<string, unknown>;
  const candidates = [objectData.rates, objectData.items, objectData.rows, objectData.data];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate
        .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
        .map(parseRate);
    }
  }

  return [];
}

function parsePagination(response: RatesListResponse) {
  const metadataPagination = response.metadata?.pagination;
  if (metadataPagination) {
    return metadataPagination;
  }

  if (!response.data || typeof response.data !== "object") {
    return null;
  }

  const dataObj = response.data as Record<string, unknown>;
  const candidate = dataObj.pagination;
  if (!candidate || typeof candidate !== "object") {
    return null;
  }

  const parsed = candidate as Partial<Pagination>;
  return {
    total: typeof parsed.total === "number" ? parsed.total : 0,
    page: typeof parsed.page === "number" ? parsed.page : 1,
    limit: typeof parsed.limit === "number" ? parsed.limit : 10,
    totalPages: typeof parsed.totalPages === "number" ? parsed.totalPages : 1,
  };
}

export function useRates(params: RateListParams = {}) {
  const query = useFetchDataSeperateLoading<RatesListResponse>(
    [...adminKeys.rate.list(params)],
    () => adminApi.rate.list(params) as unknown as Promise<RatesListResponse>,
    true
  );

  const rates = extractRates(query.data?.data);
  const pagination = query.data ? parsePagination(query.data) : null;

  return {
    rates,
    total: pagination?.total ?? 0,
    page: pagination?.page ?? 1,
    totalPages: pagination?.totalPages ?? 1,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
  };
}
