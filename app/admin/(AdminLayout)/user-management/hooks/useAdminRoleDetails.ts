"use client";

import { useFetchSingleData } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import { adminApi, type AdminRoleDetails } from "@/app/admin/_services/admin-api";

interface AdminRoleDetailsResponse {
  success: boolean;
  data: AdminRoleDetails;
  metadata?: Record<string, unknown> | null;
}

export function useAdminRoleDetails(id?: string) {
  const query = useFetchSingleData<AdminRoleDetailsResponse>(
    id ? [...adminKeys.management.roles.detail(id)] : [],
    () => adminApi.management.roles.getById(id!) as unknown as Promise<AdminRoleDetailsResponse>,
    !!id
  );

  return {
    role: query.data?.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
  };
}

