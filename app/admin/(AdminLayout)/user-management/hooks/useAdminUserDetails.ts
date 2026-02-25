"use client";

import { useFetchSingleData } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import { adminApi } from "@/app/admin/_services/admin-api";

export interface AdminUserDetails {
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
  roleName?: string | null;
  departmentName?: string | null;
}

interface AdminUserDetailsResponse {
  success: boolean;
  data: {
    user: AdminUserDetails;
    rolePermissions: Record<string, unknown>;
  };
  metadata?: Record<string, unknown> | null;
}

export function useAdminUserDetails(id?: string) {
  const query = useFetchSingleData<AdminUserDetailsResponse>(
    id ? [...adminKeys.management.users.detail(id)] : [],
    () => adminApi.management.users.getById(id!) as unknown as Promise<AdminUserDetailsResponse>,
    !!id
  );

  return {
    user: query.data?.data?.user ?? null,
    rolePermissions: query.data?.data?.rolePermissions ?? {},
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
