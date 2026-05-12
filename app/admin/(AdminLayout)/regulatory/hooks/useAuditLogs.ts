"use client";

import { useMemo } from "react";
import type { ApiResponse } from "@/app/_lib/api/client";
import { useFetchDataSeperateLoading, useFetchSingleData } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import {
  adminApi,
  type AdminRegulatoryAuditLogDetailsData,
  type AdminRegulatoryAuditLogListItem,
  type AdminRegulatoryAuditLogsListParams,
} from "@/app/admin/_services/admin-api";

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface AuditLogsListMetadata extends Record<string, unknown> {
  pagination?: Partial<Pagination>;
}

interface AuditLogsListResponse extends Omit<ApiResponse<AdminRegulatoryAuditLogListItem[]>, "metadata"> {
  metadata: AuditLogsListMetadata | null;
}
type AuditLogDetailsResponse = ApiResponse<AdminRegulatoryAuditLogDetailsData>;

type UnknownRecord = Record<string, unknown>;

export interface AuditLogRowItem {
  id: string;
  timestamp: string;
  userOrSystem: string;
  actionPerformed: string;
  actionResult: string;
  channel: string;
  auditId: string;
}

export interface AuditLogDetailViewModel {
  timestamp: string;
  source: string;
  description: string;
  duplicateLabel: string;
  result: string;
  auditId: string;
  fileUrl: string;
  user: string;
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

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" ? (value as UnknownRecord) : {};
}

function toTitleCase(value: string): string {
  const normalized = value.trim().replace(/[_-]+/g, " ");
  if (!normalized) return "";
  return normalized
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDateTime(value: unknown): string {
  const source = String(value ?? "").trim();
  if (!source) return "--";
  const parsed = new Date(source);
  if (Number.isNaN(parsed.getTime())) return source;
  return parsed.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function normalizeActionResult(value: unknown): string {
  const normalized = asString(value).trim().toUpperCase();
  if (!normalized) return "--";
  if (normalized === "INFO") return "Info";
  if (normalized === "WARNING") return "Warning";
  if (normalized === "ERROR") return "Error";
  if (normalized === "CRITICAL") return "Critical";
  return toTitleCase(normalized);
}

function normalizeDetail(
  value: AdminRegulatoryAuditLogDetailsData | null
): AuditLogDetailViewModel | null {
  if (!value) return null;
  const data = asRecord(value);
  return {
    timestamp: formatDateTime(data.timestamp),
    source: asString(data.source, "--"),
    description: asString(data.description, "--"),
    duplicateLabel: typeof data.duplicate === "boolean" ? (data.duplicate ? "Yes" : "No") : "--",
    result: normalizeActionResult(data.result),
    auditId: asString(data.auditId, "--"),
    fileUrl: asString(data.fileUrl, ""),
    user: asString(data.user, "--"),
  };
}

function normalizeListItem(
  item: AdminRegulatoryAuditLogListItem | UnknownRecord
): AuditLogRowItem {
  const record = asRecord(item);
  return {
    id: asString(record.id),
    timestamp: formatDateTime(record.timestamp),
    userOrSystem: asString(record.userOrSystem, "--"),
    actionPerformed: asString(record.actionPerformed, "--"),
    actionResult: normalizeActionResult(record.actionResult),
    channel: asString(record.channel, "--"),
    auditId: asString(record.auditId, "--"),
  };
}

function normalizeListResponse(data: unknown): AuditLogRowItem[] {
  if (Array.isArray(data)) {
    return data
      .filter((item): item is AdminRegulatoryAuditLogListItem | UnknownRecord => Boolean(item))
      .map(normalizeListItem);
  }

  const record = asRecord(data);
  const candidates = [
    record.items,
    record.logs,
    record.rows,
    record.results,
    record.entries,
    record.data,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate
        .filter((item): item is AdminRegulatoryAuditLogListItem | UnknownRecord => Boolean(item))
        .map(normalizeListItem);
    }
  }

  return [];
}

function parsePagination(response?: AuditLogsListResponse | null) {
  const pagination = response?.metadata?.pagination;
  if (!pagination) return null;
  return {
    total: asNumber(pagination.total, 0),
    page: asNumber(pagination.page, 1),
    limit: asNumber(pagination.limit, 10),
    totalPages: asNumber(pagination.totalPages, 1),
  };
}

export function useAuditLogs(params: AdminRegulatoryAuditLogsListParams = {}) {
  const query = useFetchDataSeperateLoading<AuditLogsListResponse>(
    [...adminKeys.regulatory.logs.audit.list(params)],
    () =>
      adminApi.regulatory.logs.audit.list(params) as unknown as Promise<AuditLogsListResponse>,
    true
  );

  const logs = useMemo(() => normalizeListResponse(query.data?.data), [query.data?.data]);
  const pagination = parsePagination(query.data);

  return {
    logs,
    total: pagination?.total ?? logs.length,
    page: pagination?.page ?? params.page ?? 1,
    totalPages: pagination?.totalPages ?? 1,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
  };
}

export function useAuditLogDetails(id?: string) {
  const query = useFetchSingleData<AuditLogDetailsResponse>(
    [...adminKeys.regulatory.logs.audit.detail(id ?? "")],
    () =>
      adminApi.regulatory.logs.audit.getById(id ?? "") as unknown as Promise<AuditLogDetailsResponse>,
    Boolean(id)
  );

  const details = useMemo(() => normalizeDetail(query.data?.data ?? null), [query.data?.data]);

  return {
    details,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
  };
}

