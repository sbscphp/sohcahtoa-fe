"use client";

import { useMemo } from "react";
import {
  MOCK_WALLETS,
  filterBySearch,
  paginate,
  type TransientWalletListItem,
} from "./mockData";

export type WalletFilterStatus = "All" | "Matched" | "Unmatched";

export interface UseTransientWalletsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: WalletFilterStatus;
}

export function useTransientWallets(params: UseTransientWalletsParams = {}) {
  const { page = 1, limit = 10, search, status = "All" } = params;

  const result = useMemo(() => {
    let filtered = [...MOCK_WALLETS];

    if (status === "Matched") {
      filtered = filtered.filter((w) => !w.hasUnmatched);
    } else if (status === "Unmatched") {
      filtered = filtered.filter((w) => w.hasUnmatched);
    }

    filtered = filterBySearch(filtered, search, (w) =>
      [w.walletId, w.customerId, w.customerName].join(" ")
    );

    return paginate(filtered, page, limit);
  }, [page, limit, search, status]);

  return {
    wallets: result.items as TransientWalletListItem[],
    total: result.total,
    page: result.page,
    totalPages: result.totalPages,
    isLoading: false,
    isFetching: false,
    isError: false,
  };
}
