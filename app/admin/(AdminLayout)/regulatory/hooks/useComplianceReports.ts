"use client";

import { useMemo } from "react";
import type { ApiResponse } from "@/app/_lib/api/client";
import { useFetchDataSeperateLoading, useFetchSingleData } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import {
  adminApi,
  type AdminComplianceReportDetailsData,
  type AdminComplianceReportListItem,
  type AdminComplianceReportsListParams,
} from "@/app/admin/_services/admin-api";

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ComplianceListMetadata extends Record<string, unknown> {
  pagination?: Partial<Pagination>;
}

interface ComplianceListResponse
  extends Omit<ApiResponse<AdminComplianceReportListItem[]>, "metadata"> {
  metadata: ComplianceListMetadata | null;
}

type ComplianceDetailResponse = ApiResponse<AdminComplianceReportDetailsData>;

export interface ComplianceReportRowItem {
  id: string;
  reportName: string;
  reportingDate: string;
  reportingTime: string;
  fileType: string;
  status: string;
  channel: string;
  reference: string;
  fileUrl: string;
  createdAt: string;
}

export interface ComplianceReportDetailViewModel {
  reportName: string;
  type: string;
  fileType: string;
  channel: string;
  status: string;
  reference: string;
  submittedOnLabel: string;
  reportDateLabel: string;
  endDateLabel: string;
  fileUrl: string;
  fileSizeLabel: string;
}

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" ? (value as UnknownRecord) : {};
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
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

export function mapComplianceApiStatusToUi(value: unknown): string {
  const normalized = asString(value).trim().toUpperCase();
  if (!normalized) return "--";
  if (normalized === "SUCCESS" || normalized === "COMPLETED") return "Completed";
  if (normalized === "PENDING") return "Pending";
  if (normalized === "FAILED") return "Failed";
  return toTitleCase(normalized);
}

export function mapComplianceFilterToApiStatus(
  value: string
): "" | "PENDING" | "SUCCESS" | "FAILED" {
  const normalized = value.trim().toUpperCase();
  if (!normalized) return "";
  if (normalized === "COMPLETED") return "SUCCESS";
  if (normalized === "PENDING") return "PENDING";
  if (normalized === "FAILED") return "FAILED";
  if (normalized === "SUCCESS") return "SUCCESS";
  return "";
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

function normalizeListItem(item: AdminComplianceReportListItem | UnknownRecord): ComplianceReportRowItem {
  const record = asRecord(item);
  const id = asString(record.id);
  const reportDateRaw = asString(record.reportingDate);
  const createdAt = asString(record.createdAt);

  return {
    id,
    reportName: asString(record.reportName, "--"),
    reportingDate: formatDate(reportDateRaw),
    reportingTime: formatTime(createdAt || reportDateRaw),
    fileType: asString(record.fileType, "--"),
    status: mapComplianceApiStatusToUi(record.status),
    channel: asString(record.channel, "--"),
    reference: asString(record.reference, "--"),
    fileUrl: asString(record.url, ""),
    createdAt,
  };
}

function normalizeListResponse(data: unknown): ComplianceReportRowItem[] {
  if (Array.isArray(data)) {
    return data
      .filter((item): item is AdminComplianceReportListItem | UnknownRecord => Boolean(item))
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
        .filter((item): item is AdminComplianceReportListItem | UnknownRecord => Boolean(item))
        .map(normalizeListItem);
    }
  }

  return [];
}

function parsePagination(response?: ComplianceListResponse | null) {
  const pagination = response?.metadata?.pagination;
  if (!pagination) {
    return null;
  }

  const asNumber = (value: unknown, fallback: number) => {
    if (typeof value === "number") return Number.isFinite(value) ? value : fallback;
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : fallback;
    }
    return fallback;
  };

  return {
    total: asNumber(pagination.total, 0),
    page: asNumber(pagination.page, 1),
    limit: asNumber(pagination.limit, 10),
    totalPages: asNumber(pagination.totalPages, 1),
  };
}

function normalizeDetail(data: AdminComplianceReportDetailsData | null): ComplianceReportDetailViewModel | null {
  if (!data) return null;

  return {
    reportName: asString(data.reportName, "--"),
    type: toTitleCase(asString(data.type, "--")),
    fileType: asString(data.fileType, "--"),
    channel: asString(data.channel, "--"),
    status: mapComplianceApiStatusToUi(data.status),
    reference: asString(data.reference, "--"),
    submittedOnLabel: formatDateTime(data.submittedOn),
    reportDateLabel: formatDate(data.reportDate),
    endDateLabel: formatDate(data.endDate),
    fileUrl: asString(data.fileUrl, ""),
    fileSizeLabel:
      data.fileSize === null || data.fileSize === undefined || data.fileSize === ""
        ? "--"
        : String(data.fileSize),
  };
}

export function useComplianceReports(params: AdminComplianceReportsListParams = {}) {
  const query = useFetchDataSeperateLoading<ComplianceListResponse>(
    [...adminKeys.regulatory.compliance.reports.list(params)],
    () =>
      adminApi.regulatory.compliance.list(params) as unknown as Promise<ComplianceListResponse>,
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

export function useComplianceReportDetails(id?: string) {
  const query = useFetchSingleData<ComplianceDetailResponse>(
    [...adminKeys.regulatory.compliance.reports.detail(id ?? "")],
    () =>
      adminApi.regulatory.compliance.getById(id ?? "") as unknown as Promise<ComplianceDetailResponse>,
    Boolean(id)
  );

  const report = useMemo(() => normalizeDetail(query.data?.data ?? null), [query.data?.data]);

  return {
    report,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
  };
}
