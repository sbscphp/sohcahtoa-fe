"use client";

import { useMemo } from "react";
import type { ApiResponse } from "@/app/_lib/api/client";
import { useFetchDataSeperateLoading, useFetchSingleData } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import {
  adminApi,
  type AdminCbnFnReportDetailsData,
  type AdminCbnFnReportListItem,
  type AdminCbnFnReportListParams,
} from "@/app/admin/_services/admin-api";

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface CbnFnListMetadata extends Record<string, unknown> {
  pagination?: Partial<Pagination>;
}

interface CbnFnListResponse extends Omit<ApiResponse<AdminCbnFnReportListItem[]>, "metadata"> {
  metadata: CbnFnListMetadata | null;
}

type UnknownRecord = Record<string, unknown>;

export interface CbnFnReportRowItem {
  id: string;
  reportName: string;
  reportType: string;
  submittedDate: string;
  submittedTime: string;
  status: string;
  channel: string;
  reference: string;
  fileType: string;
}

export interface CbnFnReportDetailViewModel {
  reportName: string;
  type: string;
  fileType: string;
  channel: string;
  status: string;
  reference: string;
  lastAction: string;
  submissionTimeLabel: string;
  cbnCode: string;
  errorCode: string;
  fileSizeLabel: string;
  fileUrl: string;
}

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" ? (value as UnknownRecord) : {};
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

function formatDate(value: unknown): string {
  const source = String(value ?? "").trim();
  if (!source) return "--";
  const parsed = new Date(source);
  if (Number.isNaN(parsed.getTime())) return source;

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(value: unknown): string {
  const source = String(value ?? "").trim();
  if (!source) return "--";
  const parsed = new Date(source);
  if (Number.isNaN(parsed.getTime())) return "--";

  return parsed.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
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

export function mapCbnFnApiStatusToUi(value: unknown): string {
  const normalized = asString(value, "--").trim();
  if (!normalized) return "--";
  return toTitleCase(normalized);
}

export function mapCbnFnFilterToApiStatus(
  value: string
): "" | "Pending" | "Submitted" | "Completed" | "Failed" {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return "";
  if (normalized === "pending") return "Pending";
  if (normalized === "submitted") return "Submitted";
  if (normalized === "completed") return "Completed";
  if (normalized === "failed") return "Failed";
  return "";
}

function normalizeListItem(item: AdminCbnFnReportListItem | UnknownRecord): CbnFnReportRowItem {
  const record = asRecord(item);
  const createdAt = asString(record.createdAt);
  return {
    id: asString(record.id),
    reportName: asString(record.reportName, "--"),
    reportType: asString(record.reportType, "--"),
    submittedDate: formatDate(createdAt),
    submittedTime: formatTime(createdAt),
    status: mapCbnFnApiStatusToUi(record.status),
    channel: asString(record.channel, "--"),
    reference: asString(record.reference, "--"),
    fileType: asString(record.fileType, "--"),
  };
}

function normalizeListResponse(data: unknown): CbnFnReportRowItem[] {
  if (Array.isArray(data)) {
    return data
      .filter((item): item is AdminCbnFnReportListItem | UnknownRecord => Boolean(item))
      .map(normalizeListItem);
  }

  const record = asRecord(data);
  const candidates = [
    record.items,
    record.reports,
    record.rows,
    record.results,
    record.entries,
    record.data,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate
        .filter((item): item is AdminCbnFnReportListItem | UnknownRecord => Boolean(item))
        .map(normalizeListItem);
    }
  }

  return [];
}

function parsePagination(response?: CbnFnListResponse | null) {
  const pagination = response?.metadata?.pagination;
  if (!pagination) return null;

  return {
    total: asNumber(pagination.total, 0),
    page: asNumber(pagination.page, 1),
    limit: asNumber(pagination.limit, 10),
    totalPages: asNumber(pagination.totalPages, 1),
  };
}

function normalizeDetail(
  data: AdminCbnFnReportDetailsData | null
): CbnFnReportDetailViewModel | null {
  if (!data) return null;

  return {
    reportName: asString(data.reportName, "--"),
    type: toTitleCase(asString(data.type, "--")),
    fileType: asString(data.fileType, "--"),
    channel: asString(data.channel, "--"),
    status: mapCbnFnApiStatusToUi(data.status),
    reference: asString(data.reference, "--"),
    lastAction: toTitleCase(asString(data.lastAction, "--")) || "--",
    submissionTimeLabel: formatDateTime(data.submissionTime),
    cbnCode: asString(data.cbnCode, "--") || "--",
    errorCode: asString(data.errorCode, "--") || "--",
    fileSizeLabel:
      data.fileSize === null || data.fileSize === undefined || data.fileSize === ""
        ? "--"
        : String(data.fileSize),
    fileUrl: asString(data.fileUrl, ""),
  };
}

export function useCbnFnReports(params: AdminCbnFnReportListParams = {}) {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([_, value]) => value !== undefined && value !== "")
  ) as AdminCbnFnReportListParams;

  const query = useFetchDataSeperateLoading<CbnFnListResponse>(
    [...adminKeys.regulatory.cbnFn.list(cleanParams), cleanParams],
    () => adminApi.regulatory.cbnFn.list(cleanParams) as unknown as Promise<CbnFnListResponse>,
    true
  );

  const reports = useMemo(() => normalizeListResponse(query.data?.data), [query.data?.data]);
  const pagination = parsePagination(query.data);

  return {
    reports,
    total: pagination?.total ?? reports.length,
    page: pagination?.page ?? params.page ?? 1,
    totalPages: pagination?.totalPages ?? 1,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
  };
}

type CbnFnDetailResponse = ApiResponse<AdminCbnFnReportDetailsData>;

export function useCbnFnReportDetails(reportId?: string) {
  const query = useFetchSingleData<CbnFnDetailResponse>(
    [...adminKeys.regulatory.cbnFn.detail(reportId ?? "")],
    () =>
      adminApi.regulatory.cbnFn.getById(reportId ?? "") as unknown as Promise<CbnFnDetailResponse>,
    Boolean(reportId)
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
