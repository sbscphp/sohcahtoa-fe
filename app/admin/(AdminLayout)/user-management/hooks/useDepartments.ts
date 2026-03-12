"use client";

import { useFetchDataSeperateLoading } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import { adminApi } from "@/app/admin/_services/admin-api";

export interface DepartmentItem {
  id: string;
  name: string;
  departmentEmail: string | null;
  description: string | null;
  branch: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    users: number;
  };
  usersCount: number;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface DepartmentsListResponse {
  success: boolean;
  data: DepartmentItem[];
  metadata: {
    timestamp: string;
    requestId: string;
    version: string;
    pagination: Pagination;
  } | null;
}

export interface UseDepartmentsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export function useDepartments(params: UseDepartmentsParams = {}) {
  const query = useFetchDataSeperateLoading<DepartmentsListResponse>(
    [...adminKeys.management.departments.list(params)],
    () =>
      adminApi.management.departments.list(params) as unknown as Promise<DepartmentsListResponse>,
    true
  );

  const pagination = query.data?.metadata?.pagination;

  return {
    departments: query.data?.data ?? [],
    total: pagination?.total ?? 0,
    page: pagination?.page ?? 1,
    totalPages: pagination?.totalPages ?? 1,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
  };
}
