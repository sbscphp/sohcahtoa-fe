"use client";

import { useMemo } from "react";
import { useFetchData, useFetchDataSeperateLoading } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import {
  adminApi,
  type AdminLedgerEntryDetail,
  type AdminLedgerEntryNote,
  type AdminTransactionSearchItem,
} from "@/app/admin/_services/admin-api";
import {
  MOCK_AUDIT_LOGS,
  paginate,
} from "./mockData";
import { asNumber, formatCreatedAt, normalizeMatchStatus } from "./walletUtils";

export type LedgerEntryStatus = "Matched" | "Unmatched";

export interface TransientEntryDetail {
  id: string;
  walletId: string;
  entryId: string;
  sessionId: string;
  transactionRef: string;
  transactionType: string;
  amount: number;
  entryDate: string;
  entryTime: string;
  status: LedgerEntryStatus;
  matchStatus: string | null;
  isFlagged: boolean;
  refundStatus: string | null;
  disbursementStatus: string | null;
}

function mapEntryDetail(
  item: AdminLedgerEntryDetail,
  walletId: string
): TransientEntryDetail {
  const { dateCreated, timeCreated } = formatCreatedAt(item.createdAt);
  return {
    id: item.id,
    walletId,
    entryId: item.id,
    sessionId: item.sessionId ?? "--",
    transactionRef: item.transactionRef ?? "--",
    transactionType: item.linkedTransaction?.type ?? "--",
    amount: item.amount,
    entryDate: dateCreated,
    entryTime: timeCreated,
    status: normalizeMatchStatus(item.matchStatus),
    matchStatus: item.matchStatus,
    isFlagged: item.isFlagged,
    refundStatus: item.refundStatus,
    disbursementStatus: item.disbursementStatus,
  };
}

export function useTransientWalletEntryDetails(
  walletId: string,
  entryId: string
) {
  const query = useFetchData(
    [...adminKeys.wallet.ledgerEntry(walletId, entryId)],
    () => adminApi.wallet.getLedgerEntry(walletId, entryId),
    Boolean(walletId && entryId)
  );

  const entry = useMemo(() => {
    const data = query.data?.data;
    if (!data) return null;
    return mapEntryDetail(data, walletId);
  }, [query.data?.data, walletId]);

  return {
    entry,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError || (!query.isLoading && !entry),
    error: query.error,
  };
}

// ==================== Admin Notes ====================

interface NoteRow {
  id: string;
  date: string;
  time: string;
  note: string;
  author: string;
}

interface NotesListResponse {
  data?: AdminLedgerEntryNote[] | unknown;
  metadata?: {
    pagination?: {
      page?: number;
      limit?: number;
      total?: number;
      totalPages?: number;
    };
  } | null;
}

function mapNote(item: AdminLedgerEntryNote): NoteRow {
  const { dateCreated, timeCreated } = formatCreatedAt(item.createdAt);
  return {
    id: item.id,
    date: dateCreated,
    time: timeCreated,
    note: item.note,
    author: item.adminName,
  };
}

function parseNotes(data: unknown): NoteRow[] {
  if (!Array.isArray(data)) return [];
  return data
    .filter(
      (item): item is AdminLedgerEntryNote =>
        Boolean(item && typeof item === "object")
    )
    .map(mapNote);
}

export function useTransientEntryAdminNotes(
  walletId: string,
  entryId: string,
  page = 1,
  limit = 20
) {
  const params = useMemo(() => ({ page, limit }), [page, limit]);

  const query = useFetchDataSeperateLoading<NotesListResponse>(
    [...adminKeys.wallet.ledgerNotes(walletId, entryId, params)],
    () =>
      adminApi.wallet.getLedgerNotes(
        walletId,
        entryId,
        params
      ) as unknown as Promise<NotesListResponse>,
    Boolean(walletId && entryId)
  );

  const notes = useMemo(
    () => parseNotes(query.data?.data),
    [query.data?.data]
  );

  const pagination = query.data?.metadata?.pagination;
  const totalPages = asNumber(pagination?.totalPages, 1);

  return {
    notes,
    totalPages,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
  };
}

// ==================== Audit Logs (mock — API WIP) ====================

export interface AuditLogRow {
  id: string;
  entryId: string;
  date: string;
  time: string;
  action: string;
  initiator: string;
}

export function useTransientEntryAuditLogs(
  entryId: string,
  page = 1,
  limit = 10
) {
  const result = useMemo(() => {
    const filtered = MOCK_AUDIT_LOGS.filter((log) => log.entryId === entryId);
    return paginate(filtered, page, limit);
  }, [entryId, page, limit]);

  return {
    logs: result.items,
    totalPages: result.totalPages,
    isLoading: false,
    isFetching: false,
    isError: false,
  };
}

// ==================== Transaction Search ====================

interface TransactionSearchResponse {
  data?: AdminTransactionSearchItem[] | unknown;
}

function parseTransactions(data: unknown): AdminTransactionSearchItem[] {
  if (!Array.isArray(data)) return [];
  return data.filter(
    (item): item is AdminTransactionSearchItem =>
      Boolean(item && typeof item === "object")
  );
}

export function useTransactionSearch(search: string) {
  const trimmed = search.trim();
  const enabled = trimmed.length >= 3;

  const query = useFetchData<TransactionSearchResponse>(
    [...adminKeys.transactions.list({ search: trimmed, limit: 20 })],
    () =>
      adminApi.transactions.list({
        search: trimmed,
        limit: 20,
      }) as unknown as Promise<TransactionSearchResponse>,
    enabled
  );

  const results = useMemo(
    () => parseTransactions(query.data?.data),
    [query.data?.data]
  );

  return {
    results,
    isLoading: query.isLoading,
  };
}
