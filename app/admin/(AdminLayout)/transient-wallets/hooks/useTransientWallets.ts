"use client";

import { useMemo } from "react";
import { useFetchDataSeperateLoading } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import {
  adminApi,
  type AdminWalletListItem,
  type AdminWalletListParams,
} from "@/app/admin/_services/admin-api";
import {
  asNumber,
  formatCreatedAt,
} from "./walletUtils";

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface WalletsListResponse {
  data?: AdminWalletListItem[] | unknown;
  metadata?: {
    pagination?: Partial<Pagination>;
  } | null;
}

export interface TransientWalletListItem {
  id: string;
  walletId: string;
  customerId: string;
  customerName: string;
  totalDebit: number;
  totalCredit: number;
  dateCreated: string;
  timeCreated: string;
  currency: string;
}

export type UseTransientWalletsParams = AdminWalletListParams;

function mapWalletItem(item: AdminWalletListItem): TransientWalletListItem {
  const { dateCreated, timeCreated } = formatCreatedAt(item.createdAt);
  return {
    id: item.id,
    walletId: item.walletId,
    customerId: item.userId,
    customerName: item.customerName,
    totalDebit: item.totalDebits,
    totalCredit: item.totalCredits,
    dateCreated,
    timeCreated,
    currency: item.currency,
  };
}

function parseWallets(data: unknown): TransientWalletListItem[] {
  if (!Array.isArray(data)) return [];
  return data
    .filter((item): item is AdminWalletListItem => Boolean(item && typeof item === "object"))
    .map(mapWalletItem);
}

function parsePagination(response?: WalletsListResponse | null) {
  const metadataPagination = response?.metadata?.pagination;
  if (metadataPagination) {
    return {
      total: asNumber(metadataPagination.total, 0),
      page: asNumber(metadataPagination.page, 1),
      limit: asNumber(metadataPagination.limit, 10),
      totalPages: asNumber(metadataPagination.totalPages, 1),
    };
  }
  return null;
}

export function useTransientWallets(params: UseTransientWalletsParams = {}) {
  const queryParams = useMemo(
    () => ({
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      search: params.search?.trim() || undefined,
      sortOrder: params.sortOrder,
    }),
    [params.page, params.limit, params.search, params.sortOrder]
  );

  const query = useFetchDataSeperateLoading<WalletsListResponse>(
    [...adminKeys.wallet.list(queryParams)],
    () => adminApi.wallet.list(queryParams) as unknown as Promise<WalletsListResponse>
  );

  const wallets = useMemo(
    () => parseWallets(query.data?.data),
    [query.data?.data]
  );

  const pagination = parsePagination(query.data);
  const total = pagination?.total ?? wallets.length;
  const page = pagination?.page ?? queryParams.page ?? 1;
  const totalPages = pagination?.totalPages ?? 1;

  return {
    wallets,
    total,
    page,
    totalPages,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
  };
}
