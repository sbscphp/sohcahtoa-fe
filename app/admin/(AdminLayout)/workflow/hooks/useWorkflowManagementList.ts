"use client";

import { useMemo } from "react";
import type { ApiResponse } from "@/app/_lib/api/client";
import { useFetchDataSeperateLoading } from "@/app/_lib/api/hooks";
import {
  adminApi,
  type AdminWorkflowManagementListItem,
  type AdminWorkflowManagementListParams,
} from "@/app/admin/_services/admin-api";

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface WorkflowManagementListMetadata extends Record<string, unknown> {
  pagination?: Partial<Pagination>;
}

interface WorkflowManagementListResponse
  extends Omit<ApiResponse<AdminWorkflowManagementListItem[]>, "metadata"> {
  metadata?: WorkflowManagementListMetadata | null;
}

type UnknownRecord = Record<string, unknown>;

export interface WorkflowManagementTableRow {
  id: string;
  displayId: string;
  name: string;
  workflowType: string;
  workflowAction: string;
  status: "Active" | "Deactivated" | "Draft";
  dateCreated: string;
  timeCreated: string;
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

function mapWorkflowManagementStatus(value: unknown): "Active" | "Deactivated" | "Draft" {
  const normalized = asString(value).trim().toUpperCase();
  if (normalized === "DEACTIVATED" || normalized === "INACTIVE") return "Deactivated";
  if (normalized === "DRAFT") return "Draft";
  return "Active";
}

function formatDate(value: unknown): string {
  const source = String(value ?? "").trim();
  if (!source) return "--";

  const parsed = new Date(source);
  if (Number.isNaN(parsed.getTime())) return source;

  return parsed.toLocaleDateString("en-US", {
    month: "long",
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

function normalizeItem(
  item: AdminWorkflowManagementListItem | UnknownRecord
): WorkflowManagementTableRow {
  const record = asRecord(item);
  const dateCreated = asString(record.dateCreated);
  const id = asString(record.id);
  const displayId = asString(record.displayId);

  return {
    id,
    displayId: displayId || id || "--",
    name: asString(record.workflowName, "--"),
    workflowType: asString(record.workflowType, "--"),
    workflowAction: asString(record.workflowAction, "--"),
    status: mapWorkflowManagementStatus(record.status),
    dateCreated: formatDate(dateCreated),
    timeCreated: formatTime(dateCreated),
  };
}

function normalizeListResponse(data: unknown): WorkflowManagementTableRow[] {
  if (Array.isArray(data)) {
    return data
      .filter((item): item is AdminWorkflowManagementListItem | UnknownRecord => Boolean(item))
      .map(normalizeItem);
  }

  const record = asRecord(data);
  const candidates = [
    record.items,
    record.workflows,
    record.rows,
    record.results,
    record.entries,
    record.data,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate
        .filter((item): item is AdminWorkflowManagementListItem | UnknownRecord => Boolean(item))
        .map(normalizeItem);
    }
  }

  return [];
}

function parsePagination(response?: WorkflowManagementListResponse | null) {
  const pagination = response?.metadata?.pagination;
  if (!pagination) return null;

  return {
    total: asNumber(pagination.total, 0),
    page: asNumber(pagination.page, 1),
    limit: asNumber(pagination.limit, 10),
    totalPages: asNumber(pagination.totalPages, 1),
  };
}

export function useWorkflowManagementList(params: AdminWorkflowManagementListParams = {}) {
  const query = useFetchDataSeperateLoading<WorkflowManagementListResponse>(
    ["admin", "workflow", "management", "list", params],
    () => adminApi.workflow.listManagement(params) as unknown as Promise<WorkflowManagementListResponse>,
    true
  );

  const rows = useMemo(() => normalizeListResponse(query.data?.data), [query.data?.data]);
  const pagination = parsePagination(query.data);

  return {
    rows,
    total: pagination?.total ?? rows.length,
    page: pagination?.page ?? params.page ?? 1,
    totalPages: pagination?.totalPages ?? 1,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
  };
}
