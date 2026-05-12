"use client";

import { useFetchDataSeperateLoading } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import { adminApi, type FranchiseListParams } from "@/app/admin/_services/admin-api";

export type OutletStatus = "Active" | "Pending" | "Deactivated";

export interface FranchiseListItem {
  id: string;
  name: string;
  contactName: string;
  contactEmail: string;
  address: string;
  status: OutletStatus;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface FranchiseApiItem {
  id: string;
  franchiseName: string;
  contactPerson: string;
  email: string;
  address: string;
  status: string;
}

interface FranchiseListData {
  items?: FranchiseApiItem[] | unknown;
  pagination?: Pagination;
}

interface FranchiseListResponse {
  data?: FranchiseListData | unknown;
  metadata?: {
    pagination?: Pagination;
  } | null;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function parseStatus(raw: Record<string, unknown>): OutletStatus {
  const status = asString(raw.status).trim().toLowerCase().replace(/[\s_-]+/g, "");

  if (status === "active" || status === "activated") {
    return "Active";
  }

  if (
    status === "pending" ||
    status === "pendingapproval" ||
    status === "awaitingapproval" ||
    status === "awaitingactivation"
  ) {
    return "Pending";
  }

  if (status === "deactivated" || status === "inactive" || status === "disabled") {
    return "Deactivated";
  }

  if (typeof raw.isActive === "boolean") {
    return raw.isActive ? "Active" : "Deactivated";
  }

  if (typeof raw.isApproved === "boolean" && !raw.isApproved) {
    return "Pending";
  }

  return "Pending";
}

function parseAddress(raw: Record<string, unknown>): string {
  const address = raw.address;
  if (typeof address === "string") {
    return address;
  }

  if (address && typeof address === "object") {
    const addressObj = address as Record<string, unknown>;
    return (
      asString(addressObj.fullAddress) ||
      asString(addressObj.street) ||
      asString(addressObj.line1) ||
      asString(addressObj.name)
    );
  }

  return asString(raw.location) || asString(raw.fullAddress) || "--";
}

function parseFranchise(raw: Record<string, unknown>): FranchiseListItem {
  const contact =
    raw.contact && typeof raw.contact === "object"
      ? (raw.contact as Record<string, unknown>)
      : null;
  const contactPerson =
    raw.contactPerson && typeof raw.contactPerson === "object"
      ? (raw.contactPerson as Record<string, unknown>)
      : null;
  const manager =
    raw.manager && typeof raw.manager === "object"
      ? (raw.manager as Record<string, unknown>)
      : null;

  const idCandidate = raw.id ?? raw.franchiseId ?? raw.outletId ?? raw.code;

  return {
    id: idCandidate == null ? "" : String(idCandidate),
    name:
      asString(raw.name) ||
      asString(raw.franchiseName) ||
      asString(raw.businessName) ||
      asString(raw.title) ||
      "--",
    contactName:
      asString(raw.contactName) ||
      asString(raw.contactPerson) ||
      asString(raw.contactPersonName) ||
      asString(raw.ownerName) ||
      asString(raw.managerName) ||
      asString(contact?.name) ||
      asString(contactPerson?.name) ||
      asString(manager?.name) ||
      "--",
    contactEmail:
      asString(raw.contactEmail) ||
      asString(raw.email) ||
      asString(contact?.email) ||
      asString(contactPerson?.email) ||
      asString(manager?.email) ||
      "--",
    address: parseAddress(raw) || "--",
    status: parseStatus(raw),
  };
}

function extractFranchises(data: unknown): FranchiseListItem[] {
  if (Array.isArray(data)) {
    return data
      .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
      .map(parseFranchise);
  }

  if (!data || typeof data !== "object") {
    return [];
  }

  const dataObj = data as Record<string, unknown>;
  const candidates = [dataObj.items, dataObj.franchises, dataObj.rows];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate
        .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
        .map(parseFranchise);
    }
  }

  return [];
}

function parsePagination(response: FranchiseListResponse): Pagination | null {
  if (!response.data || typeof response.data !== "object") {
    return response.metadata?.pagination ?? null;
  }

  const dataObj = response.data as Record<string, unknown>;
  const candidate = dataObj.pagination;

  if (!candidate || typeof candidate !== "object") {
    return response.metadata?.pagination ?? null;
  }

  const parsed = candidate as Partial<Pagination>;
  return {
    total: typeof parsed.total === "number" ? parsed.total : 0,
    page: typeof parsed.page === "number" ? parsed.page : 1,
    limit: typeof parsed.limit === "number" ? parsed.limit : 10,
    totalPages: typeof parsed.totalPages === "number" ? parsed.totalPages : 1,
  };
}

export function useFranchises(params: FranchiseListParams = {}) {
  const query = useFetchDataSeperateLoading<FranchiseListResponse>(
    [...adminKeys.outlet.franchises.list(params)],
    () => adminApi.outlet.franchises.list(params) as unknown as Promise<FranchiseListResponse>,
    true
  );

  const items = extractFranchises(query.data?.data);
  const pagination = query.data ? parsePagination(query.data) : null;

  return {
    franchises: items,
    total: pagination?.total ?? 0,
    page: pagination?.page ?? 1,
    totalPages: pagination?.totalPages ?? 1,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
  };
}
