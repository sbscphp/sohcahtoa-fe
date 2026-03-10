"use client";

import { useFetchData } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import { adminApi } from "@/app/admin/_services/admin-api";
import type { ApiResponse } from "@/app/_lib/api/client";

export interface TicketStatsData {
  totalTickets: number;
  resolvedTickets: number;
  openTickets: number;
  avgResolutionTime: string | number;
}

export function useTicketStats() {
  const query = useFetchData<ApiResponse<TicketStatsData>>(
    [...adminKeys.tickets.stats()],
    () =>
      adminApi.tickets.getStats() as unknown as Promise<ApiResponse<TicketStatsData>>,
    true
  );

  return {
    stats: query.data?.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
