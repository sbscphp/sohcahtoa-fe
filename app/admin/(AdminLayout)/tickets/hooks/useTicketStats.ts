"use client";

import { useFetchData } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import { adminApi } from "@/app/admin/_services/admin-api";
import type { ApiResponse } from "@/app/_lib/api/client";

export interface TicketStatsData {
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  unassigned: number;
}

export function useTicketStats() {
  const query = useFetchData<ApiResponse<TicketStatsData>>(
    [...adminKeys.tickets.stats()],
    () =>
      adminApi.tickets.getStats() as unknown as Promise<ApiResponse<TicketStatsData>>,
    true
  );

  const stats = query.data?.data ?? null;
  const totalTickets = stats
    ? (stats.open ?? 0) +
      (stats.inProgress ?? 0) +
      (stats.resolved ?? 0) +
      (stats.closed ?? 0)
    : 0;

  return {
    stats,
    totalTickets,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
