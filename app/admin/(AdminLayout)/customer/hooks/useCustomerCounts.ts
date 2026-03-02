"use client";

import type { ApiResponse } from "@/app/_lib/api/client";
import { useFetchData } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import { adminApi } from "@/app/admin/_services/admin-api";

export interface CustomerCountsData {
  totalCustomer: number;
  activeCustomer: number;
  deactivatedCustomer: number;
}

export function useCustomerCounts() {
  const query = useFetchData<ApiResponse<CustomerCountsData>>(
    [...adminKeys.customers.counts()],
    () =>
      adminApi.customers.getCounts() as unknown as Promise<
        ApiResponse<CustomerCountsData>
      >,
    true
  );

  return {
    counts: query.data?.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
