"use client";

import { useMemo } from "react";
import {
  MOCK_AUDIT_LOGS,
  MOCK_ADMIN_NOTES,
  getEntryDetail,
  paginate,
} from "./mockData";

export function useTransientWalletEntryDetails(
  walletId: string,
  entryId: string
) {
  const entry = useMemo(
    () => getEntryDetail(walletId, entryId),
    [walletId, entryId]
  );

  return {
    entry,
    isLoading: false,
    isFetching: false,
    isError: !entry,
  };
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

export function useTransientEntryAdminNotes(
  entryId: string,
  page = 1,
  limit = 10
) {
  const result = useMemo(() => {
    const filtered = MOCK_ADMIN_NOTES.filter((note) => note.entryId === entryId);
    return paginate(filtered, page, limit);
  }, [entryId, page, limit]);

  return {
    notes: result.items,
    totalPages: result.totalPages,
    isLoading: false,
    isFetching: false,
    isError: false,
  };
}
