// Note: This file is not used in the project. currently, it's meant to be to populate the url with hte params from the table to persist or share information
"use client";

import { useMemo, useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { DatesRangeValue } from "@mantine/dates";
import type { TableSelections } from "./use-table-state";

export interface TableUrlSyncConfig<TFilterKey extends string = string> {
  tableName: string;
  namespace?: boolean;
  multiValueSeparator?: string;

  // what to sync (opt-in)
  sync?: Partial<{
    q: string; // url param name
    sortBy: string;
    sortOrder: string;
    startDate: string;
    endDate: string;
    selections: Partial<Record<TFilterKey, string>>; // key -> url param name
  }>;
}

export interface TableUrlSyncState<TFilterKey extends string = string> {
  q: string;
  selections: TableSelections<TFilterKey>;
  dateRange: DatesRangeValue | null;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface UseTableUrlSyncInput<TFilterKey extends string = string> {
  state: TableUrlSyncState<TFilterKey>;
  setState: (patch: Partial<TableUrlSyncState<TFilterKey>>) => void;
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

export function useTableUrlSync<TFilterKey extends string = string>(
  input: UseTableUrlSyncInput<TFilterKey>,
  config: TableUrlSyncConfig<TFilterKey>
) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const didHydrateFromUrl = useRef(false);

  const sep = config.multiValueSeparator ?? ",";
  const ns = config.namespace ?? true;
  const sync = useMemo(() => config.sync ?? {}, [config.sync]);

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

  const initialFromUrl = useMemo(() => {
    const patch: Partial<TableUrlSyncState<TFilterKey>> = {};

    if (sync.q) patch.q = searchParams.get(keyOf(sync.q)) ?? "";
    if (sync.sortBy) patch.sortBy = searchParams.get(keyOf(sync.sortBy)) ?? undefined;
    if (sync.sortOrder) patch.sortOrder = normalizeSortOrder(searchParams.get(keyOf(sync.sortOrder)));

    if (sync.startDate || sync.endDate) {
      const start = sync.startDate ? searchParams.get(keyOf(sync.startDate)) : null;
      const end = sync.endDate ? searchParams.get(keyOf(sync.endDate)) : null;
      patch.dateRange = buildDateRange(start, end);
    }

    if (sync.selections) {
      const selections: TableSelections<TFilterKey> = {};
      (Object.keys(sync.selections) as TFilterKey[]).forEach((k) => {
        const raw = searchParams.get(selectionParamFor(k));
        const decoded = decodeMulti(raw, sep);
        if (decoded) selections[k] = decoded;
      });
      patch.selections = selections;
    }

    return patch;
  }, [keyOf, searchParams, selectionParamFor, sep, sync]);

  // Apply URL -> state once on mount
  useEffect(() => {
    input.setState(initialFromUrl);
    didHydrateFromUrl.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync state -> URL whenever relevant pieces change
  const { q, sortBy, sortOrder, dateRange, selections } = input.state;

  const applyToParams = useCallback(
    (params: URLSearchParams) => {
      if (sync.q) setOrDelete(params, keyOf(sync.q), q);
      if (sync.sortBy) setOrDelete(params, keyOf(sync.sortBy), sortBy ?? null);
      if (sync.sortOrder) setOrDelete(params, keyOf(sync.sortOrder), sortOrder ?? null);
      if (sync.startDate) setOrDelete(params, keyOf(sync.startDate), encodeDate(dateRange?.[0] ?? null));
      if (sync.endDate) setOrDelete(params, keyOf(sync.endDate), encodeDate(dateRange?.[1] ?? null));

      if (sync.selections) {
        (Object.keys(sync.selections) as TFilterKey[]).forEach((k) => {
          const urlKey = selectionParamFor(k);
          const values = selections?.[k];
          setOrDelete(params, urlKey, values?.length ? values.join(sep) : null);
        });
      }
    },
    [dateRange, keyOf, q, selectionParamFor, selections, sep, sortBy, sortOrder, sync]
  );

  useEffect(() => {
    // Avoid writing back to URL during initial hydration pass.
    if (!didHydrateFromUrl.current) return;

    const params = new URLSearchParams(searchParams.toString());
    applyToParams(params);

    const next = params.toString();
    const current = searchParams.toString();
    if (next !== current) {
      router.replace(`?${next}`, { scroll: false });
    }
  }, [applyToParams, router, searchParams]);
}

