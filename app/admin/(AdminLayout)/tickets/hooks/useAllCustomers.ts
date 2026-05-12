"use client";

import { useFetchData } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import { adminApi } from "@/app/admin/_services/admin-api";

export interface TicketCustomer {
  id: string;
  name: string;
  email: string;
}

interface CustomersAllResponse {
  success: boolean;
  data: TicketCustomer[];
  metadata: Record<string, unknown> | null;
}

function normalizeCustomers(data: unknown): TicketCustomer[] {
  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
    .map((item) => ({
      id: typeof item.id === "string" ? item.id : "",
      name: typeof item.name === "string" ? item.name : "--",
      email: typeof item.email === "string" ? item.email : "--",
    }))
    .filter((item) => item.id);
}

export function useAllCustomers() {
  const query = useFetchData<CustomersAllResponse>(
    [...adminKeys.customers.allCustomers()],
    () =>
      adminApi.customers.getAll() as unknown as Promise<CustomersAllResponse>,
    true
  );

  return {
    customers: normalizeCustomers(query.data?.data),
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
