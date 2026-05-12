"use client";

import { useMemo } from "react";
import type { ApiResponse } from "@/app/_lib/api/client";
import { useFetchDataSeperateLoading } from "@/app/_lib/api/hooks";
import {
  adminApi,
  type AdminWorkflowActionListItem,
  type AdminWorkflowActionsListParams,
} from "@/app/admin/_services/admin-api";

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface WorkflowActionsMetadata extends Record<string, unknown> {
  pagination?: Partial<Pagination>;
}

interface WorkflowActionsResponse
  extends Omit<ApiResponse<AdminWorkflowActionListItem[]>, "metadata"> {
  metadata?: WorkflowActionsMetadata | null;
}

type UnknownRecord = Record<string, unknown>;
type WorkflowActionUiStatus = "Pending" | "Completed" | "Rejected";

export interface WorkflowActionTableRow {
  id: string;
  dateInitiated: string;
  timeInitiated: string;
  escalationPeriod: string;
  escalationMinutes: number;
  module: string;
  workflowAction: string;
  actionNeeded: string;
  status: WorkflowActionUiStatus;
  title: string;
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

function formatEscalationPeriod(escalationMinutes: number): string {
  return `${escalationMinutes.toLocaleString("en-US")} mins`;
}

export function mapWorkflowApiStatusToUi(value: unknown): WorkflowActionUiStatus {
  const normalized = asString(value).trim().toUpperCase();
  if (normalized === "APPROVED" || normalized === "COMPLETED" || normalized === "SUCCESS") {
    return "Completed";
  }
  if (normalized === "REJECTED" || normalized === "DECLINED" || normalized === "FAILED") {
    return "Rejected";
  }
  return "Pending";
}

export function mapWorkflowTabToApiStatus(
  value: string
): AdminWorkflowActionsListParams["status"] | undefined {
  const normalized = value.trim().toUpperCase();
  if (!normalized || normalized === "ALL") return undefined;
  if (normalized === "PENDING") return "Pending";
  if (normalized === "REJECTED") return "Rejected";
  if (normalized === "COMPLETED" || normalized === "APPROVED") return "Approved";
  return undefined;
}

function normalizeItem(item: AdminWorkflowActionListItem | UnknownRecord): WorkflowActionTableRow {
  const record = asRecord(item);
  const initiatedAt = asString(record.dateInitiated);
  const escalationMinutes = Math.max(0, asNumber(record.escalationMinutes, 0));

  return {
    id: asString(record.id),
    dateInitiated: formatDate(initiatedAt),
    timeInitiated: formatTime(initiatedAt),
    escalationPeriod: formatEscalationPeriod(escalationMinutes),
    escalationMinutes,
    module: asString(record.module, "--"),
    workflowAction: asString(record.workflowAction, "--"),
    actionNeeded: asString(record.actionNeeded, "--"),
    status: mapWorkflowApiStatusToUi(record.status),
    title: asString(record.title, ""),
  };
}

function normalizeListResponse(data: unknown): WorkflowActionTableRow[] {
  if (Array.isArray(data)) {
    return data
      .filter((item): item is AdminWorkflowActionListItem | UnknownRecord => Boolean(item))
      .map(normalizeItem);
  }

  const record = asRecord(data);
  const candidates = [
    record.items,
    record.actions,
    record.workflowActions,
    record.rows,
    record.results,
    record.entries,
    record.data,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate
        .filter((item): item is AdminWorkflowActionListItem | UnknownRecord => Boolean(item))
        .map(normalizeItem);
    }
  }

  return [];
}

function parsePagination(response?: WorkflowActionsResponse | null) {
  const pagination = response?.metadata?.pagination;
  if (!pagination) return null;

  return {
    total: asNumber(pagination.total, 0),
    page: asNumber(pagination.page, 1),
    limit: asNumber(pagination.limit, 10),
    totalPages: asNumber(pagination.totalPages, 1),
  };
}

export function useWorkflowActions(params: AdminWorkflowActionsListParams = {}) {
  const query = useFetchDataSeperateLoading<WorkflowActionsResponse>(
    ["admin", "workflow", "actions", params],
    () => adminApi.workflow.listActions(params) as unknown as Promise<WorkflowActionsResponse>,
    true
  );

  const actions = useMemo(() => normalizeListResponse(query.data?.data), [query.data?.data]);
  const pagination = parsePagination(query.data);

  return {
    actions,
    total: pagination?.total ?? actions.length,
    page: pagination?.page ?? params.page ?? 1,
    totalPages: pagination?.totalPages ?? 1,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
  };
}
