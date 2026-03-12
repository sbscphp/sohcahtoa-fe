"use client";

import { useFetchDataSeperateLoading } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import { adminApi } from "@/app/admin/_services/admin-api";

interface AuditTrailApiItem {
  id?: string | number;
  auditId?: string | number;
  actionId?: string | number;
  performedAt?: string;
  timestamp?: string;
  createdAt?: string;
  actionDate?: string;
  actionTime?: string;
  time?: string;
  actionLabel?: string;
  actionType?: string;
  resourceType?: string;
  resourceId?: string;
  actionBy?: string;
  adminName?: string;
  fullName?: string;
  admin?: {
    id?: string;
    fullName?: string;
    email?: string;
    departmentId?: string;
  };
  role?: string;
  roleName?: string;
  module?: string;
  moduleAffected?: string;
  actionTaken?: string;
  action?: string;
  affectedSystem?: string;
  system?: string;
  status?: string;
}

interface AuditTrailListResponse {
  success: boolean;
  data:
    | AuditTrailApiItem[]
    | {
        entries?: AuditTrailApiItem[];
        items?: AuditTrailApiItem[];
        auditTrail?: AuditTrailApiItem[];
      };
  metadata?: {
    pagination?: {
      total?: number;
      page?: number;
      limit?: number;
      totalPages?: number;
    };
  } | null;
}

export interface AuditTrailRowItem {
  id: string;
  timestamp: string;
  time: string;
  actionBy: string;
  role: string;
  module: string;
  actionTaken: string;
  affectedSystem: string;
  status: string;
}

export interface UseAuditTrailParams {
  page?: number;
  limit?: number;
  search?: string;
  module?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

function splitDateTime(value: string | undefined): { date: string; time: string } {
  if (!value) return { date: "-", time: "-" };

  const dateValue = new Date(value);
  if (Number.isNaN(dateValue.getTime())) {
    return { date: value, time: "-" };
  }

  return {
    date: dateValue.toISOString().slice(0, 10),
    time: dateValue.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

function mapAuditTrailItem(item: AuditTrailApiItem): AuditTrailRowItem {
  const dateTimeValue =
    item.performedAt ?? item.timestamp ?? item.createdAt ?? item.actionDate;
  const split = splitDateTime(dateTimeValue);

  return {
    id: String(item.id ?? item.auditId ?? item.actionId ?? ""),
    timestamp: split.date,
    time: item.actionTime ?? item.time ?? split.time,
    actionBy:
      item.actionBy ?? item.admin?.fullName ?? item.adminName ?? item.fullName ?? "-",
    role: item.role ?? item.roleName ?? item.admin?.email ?? "-",
    module: item.resourceType ?? item.module ?? item.moduleAffected ?? "-",
    actionTaken: item.actionLabel ?? item.actionTaken ?? item.action ?? "-",
    affectedSystem: item.resourceId ?? item.affectedSystem ?? item.system ?? "-",
    status: item.status ?? "PENDING",
  };
}

function extractAuditTrailEntries(
  responseData: AuditTrailListResponse["data"] | undefined
): AuditTrailApiItem[] {
  if (Array.isArray(responseData)) return responseData;
  if (!responseData || typeof responseData !== "object") return [];

  return responseData.entries ?? responseData.items ?? responseData.auditTrail ?? [];
}

export function useAuditTrail(params: UseAuditTrailParams = {}) {
  const query = useFetchDataSeperateLoading<AuditTrailListResponse>(
    [...adminKeys.auditTrail.list(params)],
    () =>
      adminApi.auditTrail.list(params) as unknown as Promise<AuditTrailListResponse>,
    true
  );

  const entries = extractAuditTrailEntries(query.data?.data).map(mapAuditTrailItem);
  const pagination = query.data?.metadata?.pagination;

  return {
    entries,
    total: pagination?.total ?? entries.length,
    page: pagination?.page ?? params.page ?? 1,
    totalPages: pagination?.totalPages ?? 1,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
  };
}
