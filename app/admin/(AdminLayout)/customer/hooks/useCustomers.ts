"use client";

import { useFetchDataSeperateLoading } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import { adminApi } from "@/app/admin/_services/admin-api";

type CustomerStatus = "Active" | "Deactivated";

interface CustomerApiItem {
  id?: string | number;
  userId?: string | number;
  customerId?: string | number;
  fullName?: string;
  customerName?: string;
  name?: string;
  phone?: string;
  phoneNumber?: string;
  email?: string;
  emailAddress?: string;
  totalTransactions?: number | string;
  transactionCount?: number | string;
  numberOfTransactions?: number | string;
  transactionVolume?: number | string;
  totalTransactionVolume?: number | string;
  totalVolume?: number | string;
  isActive?: boolean;
  status?: string;
}

interface CustomersListResponse {
  success: boolean;
  data: CustomerApiItem[] | { customers?: CustomerApiItem[]; items?: CustomerApiItem[] };
  metadata?: {
    pagination?: {
      total?: number;
      page?: number;
      limit?: number;
      totalPages?: number;
    };
  } | null;
}

export interface CustomerRowItem {
  customerName: string;
  id: string;
  phone: string;
  email: string;
  totalTransactions: number;
  transactionVolume: number;
  status: CustomerStatus;
}

function parseNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) return numeric;
  }
  return 0;
}

function toStatus(value: CustomerApiItem): CustomerStatus {
  if (typeof value.isActive === "boolean") {
    return value.isActive ? "Active" : "Deactivated";
  }

  const normalized = (value.status ?? "").toLowerCase();
  return normalized === "active" ? "Active" : "Deactivated";
}

function mapCustomer(item: CustomerApiItem): CustomerRowItem {
  return {
    id: String(item.id ?? item.userId ?? item.customerId ?? ""),
    customerName: item.fullName ?? item.customerName ?? item.name ?? "—",
    phone: item.phone ?? item.phoneNumber ?? "—",
    email: item.email ?? item.emailAddress ?? "—",
    totalTransactions: parseNumber(
      item.totalTransactions ?? item.transactionCount ?? item.numberOfTransactions
    ),
    transactionVolume: parseNumber(
      item.transactionVolume ?? item.totalTransactionVolume ?? item.totalVolume
    ),
    status: toStatus(item),
  };
}

function extractCustomers(
  responseData: CustomersListResponse["data"] | undefined
): CustomerApiItem[] {
  if (Array.isArray(responseData)) return responseData;
  if (!responseData || typeof responseData !== "object") return [];
  return responseData.customers ?? responseData.items ?? [];
}

export interface UseCustomersParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export function useCustomers(params: UseCustomersParams = {}) {
  const query = useFetchDataSeperateLoading<CustomersListResponse>(
    [...adminKeys.customers.list(params)],
    () =>
      adminApi.customers.list(params) as unknown as Promise<CustomersListResponse>,
    true
  );

  const entries = extractCustomers(query.data?.data).map(mapCustomer);
  const pagination = query.data?.metadata?.pagination;

  return {
    customers: entries,
    total: pagination?.total ?? entries.length,
    page: pagination?.page ?? params.page ?? 1,
    totalPages: pagination?.totalPages ?? 1,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
  };
}
