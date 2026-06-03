"use client";

import { useMemo } from "react";
import { MOCK_WALLET_STATS } from "./mockData";

export function useTransientWalletStats() {
  const stats = useMemo(() => MOCK_WALLET_STATS, []);

  return {
    stats,
    isLoading: false,
    isError: false,
  };
}
