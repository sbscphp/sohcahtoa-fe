"use client";

import { useFetchDataSeperateLoading } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import { adminApi } from "@/app/admin/_services/admin-api";

export interface TicketListItem {
  id: string;
  reference: string;
  customerName: string;
  customerEmail: string;
  createdAt: string;
  assignedTo: string;
  assignedRole: string;
  status: string;
  priority: string;
  category: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface TicketsListResponse {
  data?: unknown;
  metadata?: {
    pagination?: Pagination;
  } | null;
}

export interface UseTicketsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  category?: string;
  priority?: string;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function getTicketId(raw: Record<string, unknown>): string {
  const candidate = raw.id ?? raw.ticketId ?? raw.incidentId;
  return candidate == null ? "" : String(candidate);
}

function parseTicket(raw: Record<string, unknown>): TicketListItem {
  const customer =
    raw.customer && typeof raw.customer === "object"
      ? (raw.customer as Record<string, unknown>)
      : null;

  const assignee =
    raw.assignedTo && typeof raw.assignedTo === "object"
      ? (raw.assignedTo as Record<string, unknown>)
      : null;

  return {
    id: getTicketId(raw),
    reference: asString(raw.reference) || getTicketId(raw) || "--",
    customerName: asString(raw.customerName) || asString(customer?.fullName) || asString(customer?.name) || "--",
    customerEmail: asString(raw.customerEmail) || asString(customer?.email) || "--",
    createdAt: asString(raw.createdAt) || asString(raw.date),
    assignedTo:
      asString(raw.assignedAdminName) ||
      asString(raw.assignedTo) ||
      asString(assignee?.fullName) ||
      asString(assignee?.name) ||
      "--",
    assignedRole:
      asString(raw.assignedRole) || asString(assignee?.roleName) || asString(raw.department) || "",
    status: asString(raw.status) || "--",
    priority: asString(raw.priority) || "--",
    category: asString(raw.caseType) || asString(raw.category) || "--",
  };
}

function extractTickets(data: unknown): TicketListItem[] {
  if (Array.isArray(data)) {
    return data
      .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
      .map(parseTicket);
  }

  if (!data || typeof data !== "object") {
    return [];
  }

  const objectData = data as Record<string, unknown>;
  const nestedCandidates = [objectData.tickets, objectData.items, objectData.rows];

  for (const candidate of nestedCandidates) {
    if (Array.isArray(candidate)) {
      return candidate
        .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
        .map(parseTicket);
    }
  }

  return [];
}

function parsePagination(response: TicketsListResponse) {
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

export function useTickets(params: UseTicketsParams = {}) {
  const query = useFetchDataSeperateLoading<TicketsListResponse>(
    [...adminKeys.tickets.list(params)],
    () => adminApi.tickets.list(params) as unknown as Promise<TicketsListResponse>,
    true
  );

  const tickets = extractTickets(query.data?.data);
  const pagination = query.data ? parsePagination(query.data) : null;

  return {
    tickets,
    total: pagination?.total ?? 0,
    page: pagination?.page ?? 1,
    totalPages: pagination?.totalPages ?? 1,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
  };
}
