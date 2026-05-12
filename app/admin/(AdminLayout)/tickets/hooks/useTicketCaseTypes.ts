"use client";

import { useMemo } from "react";
import { useFetchData } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import { adminApi } from "@/app/admin/_services/admin-api";

interface TicketCaseTypesResponse {
  success: boolean;
  data: string[];
  metadata: Record<string, unknown> | null;
}

export interface TicketCaseTypeOption {
  value: string;
  label: string;
}

export function useTicketCaseTypes() {
  const query = useFetchData<TicketCaseTypesResponse>(
    [...adminKeys.tickets.caseTypes()],
    () =>
      adminApi.tickets.getCaseTypes() as unknown as Promise<TicketCaseTypesResponse>,
    true
  );

  const options = useMemo<TicketCaseTypeOption[]>(
    () =>
      (query.data?.data ?? [])
        .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
        .map((item) => ({
          value: item,
          label: item,
        })),
    [query.data?.data]
  );

  return {
    options,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
