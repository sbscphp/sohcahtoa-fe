"use client";

import { useFetchDataSeperateLoading } from "@/app/_lib/api/hooks";
import { adminApi } from "@/app/admin/_services/admin-api";
import { adminKeys } from "@/app/_lib/api/query-keys";

export interface AdminUserActivity {
  id: string;
  timestamp: string;
  time: string;
  actionBy: string;
  role: string;
  module: string;
  actionTaken: string;
  affectedSystem: string;
  status: string;
  [key: string]: unknown;
}

interface AdminUserActivityApiItem {
  id?: string;
  actionId?: string;
  performedAt?: string;
  createdAt?: string;
  actionDate?: string;
  actionTime?: string;
  time?: string;
  actionLabel?: string;
  actionTaken?: string;
  actionType?: string;
  resourceType?: string;
  module?: string;
  moduleId?: string;
  resourceId?: string;
  affectedSystem?: string;
  status?: string;
  effect?: string;
  admin?: {
    fullName?: string;
    email?: string;
  };
  actionBy?: string;
  role?: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface AdminUserActivitiesResponse {
  success: boolean;
  data:
    | AdminUserActivityApiItem[]
    | {
        activities?: AdminUserActivityApiItem[];
        entries?: AdminUserActivityApiItem[];
        items?: AdminUserActivityApiItem[];
      };
  metadata?: {
    pagination?: Pagination;
    [key: string]: unknown;
  } | null;
}

export interface UseAdminUserActivitiesParams {
  page?: number;
  limit?: number;
  search?: string;
  module?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

function unwrapActivities(
  data: AdminUserActivitiesResponse["data"] | undefined
): AdminUserActivityApiItem[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if ("activities" in data && Array.isArray(data.activities)) return data.activities;
  if ("entries" in data && Array.isArray(data.entries)) return data.entries;
  if ("items" in data && Array.isArray(data.items)) return data.items;
  return [];
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

function mapActivity(item: AdminUserActivityApiItem): AdminUserActivity {
  const dateTimeValue = item.performedAt ?? item.createdAt ?? item.actionDate;
  const split = splitDateTime(dateTimeValue);

  return {
    id: item.id ?? item.actionId ?? "",
    timestamp: split.date,
    time: item.actionTime ?? item.time ?? split.time,
    actionBy: item.actionBy ?? item.admin?.fullName ?? "-",
    role: item.role ?? item.admin?.email ?? "-",
    module: item.resourceType ?? item.module ?? "-",
    actionTaken: item.actionLabel ?? item.actionTaken ?? item.actionType ?? "-",
    affectedSystem: item.resourceId ?? item.moduleId ?? item.affectedSystem ?? "-",
    status: item.status ?? item.effect ?? "PENDING",
  };
}

export function useAdminUserActivities(userId?: string, params: UseAdminUserActivitiesParams = {}) {
  const query = useFetchDataSeperateLoading<AdminUserActivitiesResponse>(
    userId ? [...adminKeys.management.users.activities(userId, params)] : [],
    () =>
      adminApi.management.users.getActivities(userId!, params) as unknown as Promise<AdminUserActivitiesResponse>,
    !!userId
  );

  const pagination = query.data?.metadata?.pagination;

  return {
    activities: unwrapActivities(query.data?.data).map(mapActivity),
    total: pagination?.total ?? 0,
    page: pagination?.page ?? 1,
    totalPages: pagination?.totalPages ?? 1,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
  };
}
