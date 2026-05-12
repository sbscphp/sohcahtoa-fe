"use client";

import { useMemo } from "react";
import { useFetchData } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import { adminApi } from "@/app/admin/_services/admin-api";

interface ManagementModulesResponse {
  success: boolean;
  data: {
    modules: string[];
  };
  metadata?: Record<string, unknown> | null;
}

export interface RoleModuleDefinition {
  key: string;
  label: string;
  scopes: readonly ["MODULE"];
}

const toLabel = (key: string) =>
  key
    .trim()
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export function useManagementModules() {
  const modulesQuery = useFetchData<ManagementModulesResponse>(
    [...adminKeys.management.modules()],
    () =>
      adminApi.management.modules.list() as unknown as Promise<ManagementModulesResponse>,
    true
  );

  const roleModules = useMemo(() => {
    const items = modulesQuery.data?.data?.modules ?? [];
    const unique = Array.from(new Set(items.filter((item) => item?.trim())));
    return unique.map((item) => ({
      key: item.trim(),
      label: toLabel(item),
      scopes: ["MODULE"] as const,
    }));
  }, [modulesQuery.data?.data?.modules]);

  return {
    roleModules,
    isLoading: modulesQuery.isLoading,
    isError: modulesQuery.isError,
    error: modulesQuery.error,
  };
}
