"use client";

import { useFetchDataSeperateLoading } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import { adminApi } from "@/app/admin/_services/admin-api";

export interface RoleItem {
  id: string;
  name: string;
  description: string | null;
  permissions: string[];
  branch: string | null;
  departmentId: string | null;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    users: number;
    rolePermissions: number;
  };
  permissionsCount: number;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface RolesListResponse {
  success: boolean;
  data: RoleItem[];
  metadata: {
    timestamp: string;
    requestId: string;
    version: string;
    pagination: Pagination;
  } | null;
}

export interface UseRolesParams {
  page?: number;
  limit?: number;
  search?: string;
}

export function useRoles(params: UseRolesParams = {}) {
  const query = useFetchDataSeperateLoading<RolesListResponse>(
    [...adminKeys.management.roles.list(params)],
    () =>
      adminApi.management.roles.list(params) as unknown as Promise<RolesListResponse>,
    true
  );

  const pagination = query.data?.metadata?.pagination;

  return {
    roles: query.data?.data ?? [],
    total: pagination?.total ?? 0,
    page: pagination?.page ?? 1,
    totalPages: pagination?.totalPages ?? 1,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
  };
}
