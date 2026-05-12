"use client";

import { useMemo } from "react";
import { useFetchDataSeperateLoading } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import { adminApi } from "@/app/admin/_services/admin-api";
import type { ApiResponse } from "@/app/_lib/api/client";

interface SelectOption {
  value: string;
  label: string;
}

export function useOutletCities(state?: string | null) {
  const selectedState = state?.trim() || "";
  const enabled = Boolean(selectedState);

  const query = useFetchDataSeperateLoading<ApiResponse<string[]>>(
    [...adminKeys.outlet.states.cities(selectedState)],
    () => adminApi.outlet.states.cities(selectedState),
    enabled
  );

  const cities = useMemo<SelectOption[]>(() => {
    const rawCities = query.data?.data;
    if (!Array.isArray(rawCities)) return [];

    return rawCities
      .filter((city): city is string => typeof city === "string" && city.trim().length > 0)
      .map((city) => ({ value: city, label: city }));
  }, [query.data?.data]);

  return {
    cities,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
