"use client";

import { useCallback, useMemo, useState } from "react";
import type { DatesRangeValue } from "@mantine/dates";

export type TableSelections<TFilterKey extends string = string> = Partial<
  Record<TFilterKey, string[]>
>;

export interface TableState<TFilterKey extends string = string> {
  q: string;
  selections: TableSelections<TFilterKey>;
  dateRange: DatesRangeValue | null;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface UseTableStateOptions<TFilterKey extends string = string> {
  initial?: Partial<TableState<TFilterKey>>;
}

export interface UseTableStateResult<TFilterKey extends string = string> {
  tableState: TableState<TFilterKey>;
  setTableState: (patch: Partial<TableState<TFilterKey>>) => void;

  searchValue: string;
  setSearch: (val: string) => void;

  selections: TableSelections<TFilterKey>;
  setSelections: (next: TableSelections<TFilterKey>) => void;

  dateRange: DatesRangeValue | null;
  setDateRange: (next: DatesRangeValue | null) => void;

  sortBy?: string;
  sortOrder?: "asc" | "desc";
  setSort: (sortBy?: string, sortOrder?: "asc" | "desc") => void;

  page?: number;
  limit?: number;
  setPage: (page?: number) => void;
  setLimit: (limit?: number) => void;

  reset: () => void;
  hasActiveFilters: boolean;
}

export function useTableState<TFilterKey extends string = string>(
  options?: UseTableStateOptions<TFilterKey>
): UseTableStateResult<TFilterKey> {
  const defaults: TableState<TFilterKey> = useMemo(
    () => ({
      q: options?.initial?.q ?? "",
      selections: options?.initial?.selections ?? {},
      dateRange: options?.initial?.dateRange ?? null,
      sortBy: options?.initial?.sortBy,
      sortOrder: options?.initial?.sortOrder,
      page: options?.initial?.page ?? 1,
      limit: options?.initial?.limit ?? 20,
    }),
    [options?.initial]
  );

  const [tableState, setTableState] = useState<TableState<TFilterKey>>(defaults);

  const patchTableState = useCallback((patch: Partial<TableState<TFilterKey>>) => {
    setTableState((prev) => ({ ...prev, ...patch }));
  }, []);

  const reset = useCallback(() => {
    setTableState(defaults);
  }, [defaults]);

  const hasActiveFilters = useMemo(() => {
    const hasSelections = Object.values(tableState.selections).some(
      (v) => Array.isArray(v) && v.length > 0
    );
    const hasDates = !!(tableState.dateRange?.[0] || tableState.dateRange?.[1]);
    return !!(tableState.q || hasSelections || hasDates);
  }, [tableState.dateRange, tableState.q, tableState.selections]);

  return {
    tableState,
    setTableState: patchTableState,
    searchValue: tableState.q,
    setSearch: (val) => patchTableState({ q: val, page: 1 }),
    selections: tableState.selections,
    setSelections: (next) => patchTableState({ selections: next, page: 1 }),
    dateRange: tableState.dateRange,
    setDateRange: (next) => patchTableState({ dateRange: next, page: 1 }),
    sortBy: tableState.sortBy,
    sortOrder: tableState.sortOrder,
    setSort: (sortBy, sortOrder) => patchTableState({ sortBy, sortOrder, page: 1 }),
    page: tableState.page,
    limit: tableState.limit,
    setPage: (page) => patchTableState({ page }),
    setLimit: (limit) => patchTableState({ limit, page: 1 }),
    reset,
    hasActiveFilters,
  };
}

