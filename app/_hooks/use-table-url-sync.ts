"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { DatesRangeValue } from "@mantine/dates";
import type { TableSelections, TableState } from "./use-table-state";

export interface TableUrlSyncConfig<TFilterKey extends string = string> {
  tableName: string;
  /** Prefix param keys with `tableName.` when true. Default false. */
  namespace?: boolean;
  multiValueSeparator?: string;
  sync?: Partial<{
    q: string;
    page: string;
    sortBy: string;
    sortOrder: string;
    startDate: string;
    endDate: string;
    selections: Partial<Record<TFilterKey, string>>;
    /** Extra string params (e.g. group tab). state key -> url param name */
    params: Record<string, string>;
  }>;
}

export interface TableUrlSyncState<TFilterKey extends string = string> {
  q: string;
  selections: TableSelections<TFilterKey>;
  dateRange: DatesRangeValue | null;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  /** Extra string params synced to the URL (omit empty / default values). */
  params?: Record<string, string | undefined>;
}

export interface UseTableUrlSyncInput<TFilterKey extends string = string> {
  state: TableUrlSyncState<TFilterKey>;
}

function encodeDate(date: Date | string | null | undefined) {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString();
}

function decodeMulti(raw: string | null, sep: string): string[] | undefined {
  if (!raw) return undefined;
  const parts = raw
    .split(sep)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length ? parts : undefined;
}

function normalizeSortOrder(value: string | null): "asc" | "desc" | undefined {
  if (value === "asc") return "asc";
  if (value === "desc") return "desc";
  return undefined;
}

function buildDateRange(start?: string | null, end?: string | null): DatesRangeValue | null {
  if (!start && !end) return null;
  return [start ? new Date(start) : null, end ? new Date(end) : null];
}

function setOrDelete(params: URLSearchParams, key: string, value?: string | null) {
  if (value) params.set(key, value);
  else params.delete(key);
}

function parsePage(raw: string | null): number | undefined {
  if (!raw) return undefined;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return undefined;
  return Math.floor(n);
}

/** Read table filter/page/sort state from the current URL (for initial mount). */
export function readTableStateFromSearchParams<TFilterKey extends string = string>(
  searchParams: URLSearchParams,
  config: TableUrlSyncConfig<TFilterKey>
): Partial<TableUrlSyncState<TFilterKey>> {
  const sep = config.multiValueSeparator ?? ",";
  const ns = config.namespace ?? false;
  const sync = config.sync ?? {};
  const keyOf = (param: string) => (ns ? `${config.tableName}.${param}` : param);

  const patch: Partial<TableUrlSyncState<TFilterKey>> = {};

  if (sync.q) {
    const raw = searchParams.get(keyOf(sync.q));
    if (raw != null) patch.q = raw;
  }

  if (sync.page) {
    const page = parsePage(searchParams.get(keyOf(sync.page)));
    if (page != null) patch.page = page;
  }

  if (sync.sortBy) {
    const raw = searchParams.get(keyOf(sync.sortBy));
    if (raw) patch.sortBy = raw;
  }

  if (sync.sortOrder) {
    const order = normalizeSortOrder(searchParams.get(keyOf(sync.sortOrder)));
    if (order) patch.sortOrder = order;
  }

  if (sync.startDate || sync.endDate) {
    const start = sync.startDate ? searchParams.get(keyOf(sync.startDate)) : null;
    const end = sync.endDate ? searchParams.get(keyOf(sync.endDate)) : null;
    if (start || end) patch.dateRange = buildDateRange(start, end);
  }

  if (sync.selections) {
    const selections: TableSelections<TFilterKey> = {};
    let hasAny = false;
    (Object.keys(sync.selections) as TFilterKey[]).forEach((k) => {
      const mapping = sync.selections?.[k] ?? (k as unknown as string);
      const decoded = decodeMulti(searchParams.get(keyOf(mapping)), sep);
      if (decoded) {
        selections[k] = decoded;
        hasAny = true;
      }
    });
    if (hasAny) patch.selections = selections;
  }

  if (sync.params) {
    const params: Record<string, string | undefined> = {};
    let hasAny = false;
    Object.entries(sync.params).forEach(([stateKey, urlKey]) => {
      const raw = searchParams.get(keyOf(urlKey));
      if (raw) {
        params[stateKey] = raw;
        hasAny = true;
      }
    });
    if (hasAny) patch.params = params;
  }

  return patch;
}

export function mergeTableStateFromUrl<TFilterKey extends string = string>(
  defaults: Partial<TableState<TFilterKey>>,
  fromUrl: Partial<TableUrlSyncState<TFilterKey>>
): Partial<TableState<TFilterKey>> {
  return {
    ...defaults,
    ...(fromUrl.q != null ? { q: fromUrl.q } : null),
    ...(fromUrl.page != null ? { page: fromUrl.page } : null),
    ...(fromUrl.sortBy != null ? { sortBy: fromUrl.sortBy } : null),
    ...(fromUrl.sortOrder != null ? { sortOrder: fromUrl.sortOrder } : null),
    ...(fromUrl.dateRange !== undefined ? { dateRange: fromUrl.dateRange } : null),
    ...(fromUrl.selections ? { selections: fromUrl.selections } : null),
  };
}

/**
 * Keeps table filters / page / sort in the URL so browser back restores them.
 * Initialize local state with `readTableStateFromSearchParams` + `mergeTableStateFromUrl`.
 */
export function useTableUrlSync<TFilterKey extends string = string>(
  input: UseTableUrlSyncInput<TFilterKey>,
  config: TableUrlSyncConfig<TFilterKey>
) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const sep = config.multiValueSeparator ?? ",";
  const ns = config.namespace ?? false;
  const sync = config.sync ?? {};

  const keyOf = useCallback(
    (param: string) => (ns ? `${config.tableName}.${param}` : param),
    [config.tableName, ns]
  );

  const selectionParamFor = useCallback(
    (key: TFilterKey) => {
      const mapping = sync.selections?.[key] ?? (key as unknown as string);
      return keyOf(mapping);
    },
    [keyOf, sync.selections]
  );

  const { q, sortBy, sortOrder, dateRange, selections, page, params: extraParams } = input.state;

  const applyToParams = useCallback(
    (params: URLSearchParams) => {
      if (sync.q) setOrDelete(params, keyOf(sync.q), q || null);
      if (sync.page) {
        setOrDelete(params, keyOf(sync.page), page && page > 1 ? String(page) : null);
      }
      if (sync.sortBy) setOrDelete(params, keyOf(sync.sortBy), sortBy ?? null);
      if (sync.sortOrder) setOrDelete(params, keyOf(sync.sortOrder), sortOrder ?? null);
      if (sync.startDate) {
        setOrDelete(params, keyOf(sync.startDate), encodeDate(dateRange?.[0] ?? null));
      }
      if (sync.endDate) {
        setOrDelete(params, keyOf(sync.endDate), encodeDate(dateRange?.[1] ?? null));
      }

      if (sync.selections) {
        (Object.keys(sync.selections) as TFilterKey[]).forEach((k) => {
          const urlKey = selectionParamFor(k);
          const values = selections?.[k];
          setOrDelete(params, urlKey, values?.length ? values.join(sep) : null);
        });
      }

      if (sync.params) {
        Object.entries(sync.params).forEach(([stateKey, urlKey]) => {
          setOrDelete(params, keyOf(urlKey), extraParams?.[stateKey] || null);
        });
      }
    },
    [
      dateRange,
      extraParams,
      keyOf,
      page,
      q,
      selectionParamFor,
      selections,
      sep,
      sortBy,
      sortOrder,
      sync,
    ]
  );

  const syncedKeys = useMemo(() => {
    const keys = new Set<string>();
    if (sync.q) keys.add(keyOf(sync.q));
    if (sync.page) keys.add(keyOf(sync.page));
    if (sync.sortBy) keys.add(keyOf(sync.sortBy));
    if (sync.sortOrder) keys.add(keyOf(sync.sortOrder));
    if (sync.startDate) keys.add(keyOf(sync.startDate));
    if (sync.endDate) keys.add(keyOf(sync.endDate));
    if (sync.selections) {
      (Object.keys(sync.selections) as TFilterKey[]).forEach((k) => {
        keys.add(selectionParamFor(k));
      });
    }
    if (sync.params) {
      Object.values(sync.params).forEach((urlKey) => keys.add(keyOf(urlKey)));
    }
    return keys;
  }, [keyOf, selectionParamFor, sync]);

  // Skip the mount write — state is already hydrated from the URL.
  const skipNextWrite = useRef(true);

  useEffect(() => {
    if (skipNextWrite.current) {
      skipNextWrite.current = false;
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    // Drop only keys we manage, then re-apply — preserves unrelated params.
    syncedKeys.forEach((key) => params.delete(key));
    applyToParams(params);

    const next = params.toString();
    const current = searchParams.toString();
    if (next !== current) {
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    }
  }, [applyToParams, pathname, router, searchParams, syncedKeys]);
}
