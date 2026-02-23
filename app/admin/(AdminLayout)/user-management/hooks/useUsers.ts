"use client";

import { useFetchDataSeperateLoading } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import { adminApi } from "@/app/admin/_services/admin-api";

export interface AdminUserItem {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  altPhoneNumber: string | null;
  position: string | null;
  branch: string | null;
  roleId: string;
  departmentId: string;
  permissions: Record<string, unknown> | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserListEntry {
  user: AdminUserItem;
  rolePermissions: Record<string, unknown>;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface UsersListResponse {
  success: boolean;
  data: UserListEntry[];
  metadata: {
    timestamp: string;
    requestId: string;
    version: string;
    pagination: Pagination;
  } | null;
}

export interface UseUsersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export function useUsers(params: UseUsersParams = {}) {
  const query = useFetchDataSeperateLoading<UsersListResponse>(
    [...adminKeys.management.users.list(params)],
    () =>
      adminApi.management.users.list(params) as unknown as Promise<UsersListResponse>,
    true
  );

  const entries = query.data?.data ?? [];
  const pagination = query.data?.metadata?.pagination;

  return {
    users: entries.map((entry) => entry.user),
    total: pagination?.total ?? 0,
    page: pagination?.page ?? 1,
    totalPages: pagination?.totalPages ?? 1,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
  };
}
