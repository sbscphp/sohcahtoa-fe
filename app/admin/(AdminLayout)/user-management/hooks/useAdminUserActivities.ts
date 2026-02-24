"use client";

import { useFetchDataSeperateLoading } from "@/app/_lib/api/hooks";
import { adminApi } from "@/app/admin/_services/admin-api";
import { adminKeys } from "@/app/_lib/api/query-keys";

export interface AdminUserActivity {
  id: string;
  actionId?: string;
  module?: string;
  moduleId?: string;
  actionTaken?: string;
  effect?: string;
  createdAt?: string;
  actionDate?: string;
  actionTime?: string;
  [key: string]: unknown;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface AdminUserActivitiesResponse {
  success: boolean;
  data: AdminUserActivity[] | { activities: AdminUserActivity[] };
  metadata?: {
    pagination?: Pagination;
    [key: string]: unknown;
  } | null;
}

export interface UseAdminUserActivitiesParams {
  page?: number;
  limit?: number;
  search?: string;
}

function unwrapActivities(data: AdminUserActivitiesResponse["data"] | undefined): AdminUserActivity[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if ("activities" in data && Array.isArray(data.activities)) return data.activities;
  return [];
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
    activities: unwrapActivities(query.data?.data),
    total: pagination?.total ?? 0,
    page: pagination?.page ?? 1,
    totalPages: pagination?.totalPages ?? 1,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
  };
}
