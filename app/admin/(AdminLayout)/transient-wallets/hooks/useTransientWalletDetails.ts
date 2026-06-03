"use client";

import { useMemo } from "react";
import { getWalletDetail } from "./mockData";

export function useTransientWalletDetails(walletId: string) {
  const wallet = useMemo(() => getWalletDetail(walletId), [walletId]);

  return {
    wallet,
    isLoading: false,
    isFetching: false,
    isError: !wallet,
  };
}
