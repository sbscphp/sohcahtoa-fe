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
    branches?: LookupItem[];
  };
  metadata?: Record<string, unknown> | null;
}

export interface LookupOption {
  value: string;
  label: string;
}

type LookupOptionValueField = "id" | "name";

export function useManagementLookups(
  query: LookupQuery,
  valueField: LookupOptionValueField = "id"
) {
  const lookupQuery = useFetchData<LookupResponse>(
    [...adminKeys.management.lookups(query)],
    () => adminApi.management.lookups(query) as unknown as Promise<LookupResponse>,
    true
  );

  const options = useMemo(() => {
    const items =
      query === "role"
        ? lookupQuery.data?.data?.roles ?? []
        : query === "department"
          ? lookupQuery.data?.data?.departments ?? []
          : lookupQuery.data?.data?.branches ?? [];

    return items
      .filter((item) => item.isActive)
      .map((item) => ({
        value: valueField === "name" ? item.name : item.id,
        label: item.name,
      }));
  }, [
    lookupQuery.data?.data?.branches,
    lookupQuery.data?.data?.departments,
    lookupQuery.data?.data?.roles,
    query,
    valueField,
  ]);

  return {
    options,
    isLoading: lookupQuery.isLoading,
    isError: lookupQuery.isError,
    error: lookupQuery.error,
  };
}
