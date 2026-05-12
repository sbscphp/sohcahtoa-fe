"use client";

import { useCallback, useMemo, useState } from "react";
import { useFetchData } from "@/app/_lib/api/hooks";
import { agentKeys } from "@/app/_lib/api/query-keys";
import type {
  AgentPaymentMovementType,
  AgentPaymentMovementsResponse,
} from "@/app/_lib/api/types";
import { useTable } from "@/app/_hooks/use-table";
import { agentApi } from "@/app/agent/_services/agent-api";
import { filterMovementRowsByQuery } from "../_lib/filter-movement-rows";

const PAGE_SIZE = 10;

const DEFAULT_MOVEMENT: AgentPaymentMovementType = "cash_disbursed";

/**
 * Table state (`useTable`) + payment movements query. Keeps paging/search aligned with other agent tables.
 */
export function useCashInventoryMovements() {
  const table = useTable({
    initial: { page: 1, limit: PAGE_SIZE, q: "" },
  });

  const [movementType, setMovementType] =
    useState<AgentPaymentMovementType>(DEFAULT_MOVEMENT);

  const handleMovementTypeChange = useCallback(
    (value: string) => {
      setMovementType(value as AgentPaymentMovementType);
      table.setPage(1);
    },
    [table]
  );

  const page = table.page ?? 1;
  const limit = table.limit ?? PAGE_SIZE;

  const queryKey = useMemo(
    () =>
      agentKeys.transactions.paymentMovements({
        type: movementType,
        page,
        limit,
      }) as unknown as unknown[],
    [movementType, page, limit]
  );

  const { data, isLoading, error } = useFetchData<AgentPaymentMovementsResponse>(
    queryKey,
    () =>
      agentApi.transactions.paymentMovements({
        type: movementType,
        page,
        limit,
      }),
    true
  );

  const rawRows = data?.data ?? [];
  const totalPages = Math.max(1, data?.pagination?.totalPages ?? 1);

  const currencyCode = useMemo(() => {
    const first = rawRows[0];
    if (!first?.currency_pair) return "NGN";
    return first.currency_pair.split("/")[1] ?? "NGN";
  }, [rawRows]);

  const displayRows = useMemo(
    () => filterMovementRowsByQuery(rawRows, table.searchValue),
    [rawRows, table.searchValue]
  );

  return {
    table,
    movementType,
    handleMovementTypeChange,
    rows: displayRows,
    totalPages,
    currencyCode,
    isLoading,
    error,
    pageSize: limit,
  };
}
