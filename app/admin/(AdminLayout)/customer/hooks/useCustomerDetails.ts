"use client";

import { useFetchSingleData } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import { adminApi } from "@/app/admin/_services/admin-api";

interface CustomerDetailsApiUser {
  id?: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  status?: string;
  dateJoined?: string;
  totalTransactions?: number | string;
  transactionVolume?: number | string;
  lastActive?: string;
}

interface CustomerDetailsResponse {
  success: boolean;
  data: CustomerDetailsApiUser;
  metadata?: Record<string, unknown> | null;
}

export function useCustomerDetails(id?: string) {
  const query = useFetchSingleData<CustomerDetailsResponse>(
    id ? [...adminKeys.customers.detail(id)] : [],
    () =>
      adminApi.customers.getById(
        id!
      ) as unknown as Promise<CustomerDetailsResponse>,
    !!id
  );

  return {
    customer: query.data?.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
