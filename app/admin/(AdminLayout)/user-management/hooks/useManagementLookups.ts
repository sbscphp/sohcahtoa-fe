"use client";

import { useMemo } from "react";
import { useFetchData } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import { adminApi, type LookupQuery } from "@/app/admin/_services/admin-api";

interface LookupItem {
  id: string;
  name: string;
  isActive: boolean;
}

interface LookupResponse {
  success: boolean;
  data: {
    roles?: LookupItem[];
    departments?: LookupItem[];
  };
  metadata?: Record<string, unknown> | null;
}

export interface LookupOption {
  value: string;
  label: string;
}

export function useManagementLookups(query: LookupQuery) {
  const lookupQuery = useFetchData<LookupResponse>(
    [...adminKeys.management.lookups(query)],
    () => adminApi.management.lookups(query) as unknown as Promise<LookupResponse>,
    true
  );

  const options = useMemo(() => {
    const items =
      query === "role"
        ? lookupQuery.data?.data?.roles ?? []
        : lookupQuery.data?.data?.departments ?? [];

    return items
      .filter((item) => item.isActive)
      .map((item) => ({
        value: item.id,
        label: item.name,
      }));
  }, [lookupQuery.data?.data?.departments, lookupQuery.data?.data?.roles, query]);

  return {
    options,
    isLoading: lookupQuery.isLoading,
    isError: lookupQuery.isError,
    error: lookupQuery.error,
  };
}
