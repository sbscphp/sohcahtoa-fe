"use client";

import { useMemo } from "react";
import { useFetchDataSeperateLoading } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import {
  adminApi,
  type AdminWalletLedgerEntry,
  type AdminWalletLedgerParams,
} from "@/app/admin/_services/admin-api";
import {
  asNumber,
  formatLedgerDateTime,
  mapLedgerType,
  normalizeMatchStatus,
} from "./walletUtils";

export type LedgerEntryStatus = "Matched" | "Unmatched";
export type LedgerEntryType = "Credit" | "Debit";

export interface TransientLedgerEntry {
  id: string;
  walletId: string;
  entryId: string;
  date: string;
  time: string;
  sessionId: string;
  type: LedgerEntryType;
  amount: number;
  status: LedgerEntryStatus;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface LedgerListResponse {
  data?: AdminWalletLedgerEntry[] | unknown;
  metadata?: {
    pagination?: Partial<Pagination>;
  } | null;
}

export interface UseTransientWalletLedgerParams {
  walletId: string;
  page?: number;
  limit?: number;
  search?: string;
  type?: "" | "DEBIT" | "CREDIT";
}

function mapLedgerEntry(
  item: AdminWalletLedgerEntry,
  walletId: string
): TransientLedgerEntry {
  const { date, time } = formatLedgerDateTime(item.createdAt);
  return {
    id: item.id,
    walletId,
    entryId: item.id,
    date,
    time,
    sessionId: item.sessionId ?? "--",
    type: mapLedgerType(item.type),
    amount: item.amount,
    status: normalizeMatchStatus(item.matchStatus),
  };
}

function parseLedgerEntries(
  data: unknown,
  walletId: string
): TransientLedgerEntry[] {
  if (!Array.isArray(data)) return [];
  return data
    .filter(
      (item): item is AdminWalletLedgerEntry =>
        Boolean(item && typeof item === "object")
    )
    .map((item) => mapLedgerEntry(item, walletId));
}

function parsePagination(response?: LedgerListResponse | null) {
  const metadataPagination = response?.metadata?.pagination;
  if (metadataPagination) {
    return {
      total: asNumber(metadataPagination.total, 0),
      page: asNumber(metadataPagination.page, 1),
      limit: asNumber(metadataPagination.limit, 20),
      totalPages: asNumber(metadataPagination.totalPages, 1),
    };
  }
  return null;
}

export function useTransientWalletLedger(params: UseTransientWalletLedgerParams) {
  const { walletId, page = 1, limit = 20, search, type = "" } = params;

  const queryParams = useMemo<AdminWalletLedgerParams>(
    () => ({
      page,
      limit,
      search: search?.trim() || undefined,
      type: type || undefined,
    }),
    [page, limit, search, type]
  );

  const query = useFetchDataSeperateLoading<LedgerListResponse>(
    [...adminKeys.wallet.ledger(walletId, queryParams)],
    () =>
      adminApi.wallet.ledger(walletId, queryParams) as unknown as Promise<LedgerListResponse>,
    Boolean(walletId)
  );

  const entries = useMemo(
    () => parseLedgerEntries(query.data?.data, walletId),
    [query.data?.data, walletId]
  );

  const pagination = parsePagination(query.data);
  const total = pagination?.total ?? entries.length;
  const currentPage = pagination?.page ?? page;
  const totalPages = pagination?.totalPages ?? 1;

  return {
    entries,
    total,
    page: currentPage,
    totalPages,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
  };
}
