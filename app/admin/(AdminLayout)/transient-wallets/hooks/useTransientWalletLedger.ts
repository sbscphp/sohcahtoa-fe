"use client";

import { useMemo } from "react";
import {
  MOCK_LEDGER_ENTRIES,
  filterBySearch,
  paginate,
  type LedgerEntryStatus,
  type TransientLedgerEntry,
} from "./mockData";

export interface UseTransientWalletLedgerParams {
  walletId: string;
  page?: number;
  limit?: number;
  search?: string;
  status?: LedgerEntryStatus | "All";
}

export function useTransientWalletLedger(params: UseTransientWalletLedgerParams) {
  const { walletId, page = 1, limit = 10, search, status = "All" } = params;

  const result = useMemo(() => {
    let filtered = MOCK_LEDGER_ENTRIES.filter((e) => e.walletId === walletId);

    if (status !== "All") {
      filtered = filtered.filter((e) => e.status === status);
    }

    filtered = filterBySearch(filtered, search, (e) =>
      [e.entryId, e.sessionId, e.type, e.status].join(" ")
    );

    return paginate(filtered, page, limit);
  }, [walletId, page, limit, search, status]);

  return {
    entries: result.items as TransientLedgerEntry[],
    total: result.total,
    page: result.page,
    totalPages: result.totalPages,
    isLoading: false,
    isFetching: false,
    isError: false,
  };
}
