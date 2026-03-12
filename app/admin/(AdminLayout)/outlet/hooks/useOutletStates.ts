"use client";

import { useMemo } from "react";
import { useFetchData } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import type { ApiResponse } from "@/app/_lib/api/client";
import { adminApi, type OutletStatesData } from "@/app/admin/_services/admin-api";

interface SelectOption {
  value: string;
  label: string;
}

export function useOutletStates() {
  const query = useFetchData<ApiResponse<OutletStatesData>>(
    [...adminKeys.outlet.states.list()],
    () =>
      adminApi.outlet.states.list() as unknown as Promise<ApiResponse<OutletStatesData>>,
    true
  );

  const states = useMemo<SelectOption[]>(() => {
    const rawStates = query.data?.data?.states;
    if (!Array.isArray(rawStates)) return [];

    return rawStates
      .filter((state): state is string => typeof state === "string" && state.trim().length > 0)
      .map((state) => ({ value: state, label: state }));
  }, [query.data?.data?.states]);

  return {
    states,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
