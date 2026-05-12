"use client";

import { useMemo } from "react";
import type { ApiResponse } from "@/app/_lib/api/client";
import { useFetchDataSeperateLoading, useFetchSingleData } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import {
  adminApi,
  type AdminTrmsSubmissionDetailsData,
  type AdminTrmsSubmissionListItem,
  type AdminTrmsSubmissionsListParams,
} from "@/app/admin/_services/admin-api";

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface TrmsListMetadata extends Record<string, unknown> {
  pagination?: Partial<Pagination>;
}

interface TrmsListResponse extends Omit<ApiResponse<AdminTrmsSubmissionListItem[]>, "metadata"> {
  metadata: TrmsListMetadata | null;
}

type TrmsDetailResponse = ApiResponse<AdminTrmsSubmissionDetailsData>;

type UnknownRecord = Record<string, unknown>;

export interface TrmsSubmissionRowItem {
  id: string;
  transactionId: string;
  customerName: string;
  currencyPair: string;
  transactionType: string;
  amount: number;
  documents: number;
  status: string;
  createdAt: string;
}

export interface TrmsSubmissionDetailViewModel {
  applicantName: string;
  transactionId: string;
  type: string;
  currencyPair: string;
  amount: number;
  documentsLabel: string;
  status: string;
  formAId: string;
  submittedOnLabel: string;
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

export function mapTrmsApiStatusToUi(value: unknown): string {
  const normalized = asString(value).trim().toUpperCase();
  if (!normalized) return "--";
  if (normalized === "AWAITING_VERIFICATION") return "Awaiting Approval";
  if (normalized === "APPROVED") return "Approved";
  if (normalized === "REJECTED") return "Rejected";
  if (normalized === "BUSY") return "Busy";
  return toTitleCase(normalized);
}

export function mapTrmsFilterToApiStatus(
  value: string
): "" | "BUSY" | "AWAITING_VERIFICATION" | "APPROVED" | "REJECTED" {
  const normalized = value.trim().toUpperCase();
  if (!normalized) return "";
  if (normalized === "AWAITING APPROVAL") return "AWAITING_VERIFICATION";
  if (normalized === "AWAITING_VERIFICATION") return "AWAITING_VERIFICATION";
  if (normalized === "BUSY") return "BUSY";
  if (normalized === "APPROVED") return "APPROVED";
  if (normalized === "REJECTED") return "REJECTED";
  return "";
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

function normalizeListItem(item: AdminTrmsSubmissionListItem | UnknownRecord): TrmsSubmissionRowItem {
  const record = asRecord(item);
  return {
    id: asString(record.id),
    transactionId: asString(record.transactionId, "--"),
    customerName: asString(record.customerName, "--"),
    currencyPair: asString(record.currencyPair, "--"),
    transactionType: toTitleCase(asString(record.type, "--")),
    amount: asNumber(record.amount, 0),
    documents: asNumber(record.documents, 0),
    status: mapTrmsApiStatusToUi(record.status),
    createdAt: asString(record.createdAt, ""),
  };
}

function normalizeListResponse(data: unknown): TrmsSubmissionRowItem[] {
  if (Array.isArray(data)) {
    return data
      .filter((item): item is AdminTrmsSubmissionListItem | UnknownRecord => Boolean(item))
      .map(normalizeListItem);
  }

  const record = asRecord(data);
  const candidates = [
    record.items,
    record.submissions,
    record.rows,
    record.results,
    record.entries,
    record.data,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate
        .filter((item): item is AdminTrmsSubmissionListItem | UnknownRecord => Boolean(item))
        .map(normalizeListItem);
    }
  }

  return [];
}

function parsePagination(response?: TrmsListResponse | null) {
  const pagination = response?.metadata?.pagination;
  if (!pagination) return null;

  return {
    total: asNumber(pagination.total, 0),
    page: asNumber(pagination.page, 1),
    limit: asNumber(pagination.limit, 10),
    totalPages: asNumber(pagination.totalPages, 1),
  };
}

function normalizeDetail(data: AdminTrmsSubmissionDetailsData | null): TrmsSubmissionDetailViewModel | null {
  if (!data) return null;

  const documentsCount = asNumber(data.documents, 0);
  const fileWord = documentsCount === 1 ? "file" : "files";

  return {
    applicantName: asString(data.applicantName, "--"),
    transactionId: asString(data.transactionId, "--"),
    type: toTitleCase(asString(data.type, "--")),
    currencyPair: asString(data.currencyPair, "--"),
    amount: asNumber(data.amount, 0),
    documentsLabel: `${documentsCount} ${fileWord} uploaded`,
    status: mapTrmsApiStatusToUi(data.status),
    formAId: asString(data.formAId, "--"),
    submittedOnLabel: formatDateTime(data.submittedOn),
    fileUrl: asString(data.fileUrl, ""),
  };
}

export function useTrmsSubmissions(params: AdminTrmsSubmissionsListParams = {}) {
  const query = useFetchDataSeperateLoading<TrmsListResponse>(
    [...adminKeys.regulatory.trms.list(params)],
    () => adminApi.regulatory.trms.list(params) as unknown as Promise<TrmsListResponse>,
    true
  );

  const submissions = useMemo(
    () => normalizeListResponse(query.data?.data),
    [query.data?.data]
  );
  const pagination = parsePagination(query.data);

  return {
    submissions,
    total: pagination?.total ?? submissions.length,
    page: pagination?.page ?? params.page ?? 1,
    totalPages: pagination?.totalPages ?? 1,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
  };
}

export function useTrmsSubmissionDetails(transactionId?: string) {
  const query = useFetchSingleData<TrmsDetailResponse>(
    [...adminKeys.regulatory.trms.detail(transactionId ?? "")],
    () =>
      adminApi.regulatory.trms.getByTransactionId(transactionId ?? "") as unknown as Promise<
        TrmsDetailResponse
      >,
    Boolean(transactionId)
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
