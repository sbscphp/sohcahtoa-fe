"use client";

import { useMemo } from "react";
import { useFetchDataSeperateLoading } from "@/app/_lib/api/hooks";
import { agentKeys } from "@/app/_lib/api/query-keys";
import type {
  AgentCustomerExportParams,
  AgentCustomerListParams,
  AgentCustomerListResponse,
  AgentCustomerSegment,
} from "@/app/_lib/api/types";
import { agentApi } from "@/app/agent/_services/agent-api";
import type { UseTableResult } from "@/app/_hooks/use-table";
import { toDateRangeParams } from "@/app/_lib/utils/query-format";
import type { AgentCustomerFilterKey } from "../constant";

function firstSelection(
  selections: Partial<Record<AgentCustomerFilterKey, string[]>>,
  key: AgentCustomerFilterKey
): string | undefined {
  const value = selections[key]?.[0]?.trim();
  return value || undefined;
}

function toIsoDateTime(dateOnly: string | undefined, endOfDay: boolean): string | undefined {
  if (!dateOnly) return undefined;
  return endOfDay ? `${dateOnly}T23:59:59.999Z` : `${dateOnly}T00:00:00.000Z`;
}

export function useAgentCustomers(table: UseTableResult<AgentCustomerFilterKey>) {
  const requestParams = useMemo<AgentCustomerListParams>(() => {
    const segment = firstSelection(table.selections, "segment") as
      | AgentCustomerSegment
      | undefined;
    const status = firstSelection(table.selections, "status");
    const customerType = firstSelection(table.selections, "customerType");
    const lastTransactionType = firstSelection(
      table.selections,
      "lastTransactionType"
    );
    const { startDate, endDate } = toDateRangeParams(table.dateRange);

    return {
      page: table.page ?? 1,
      limit: table.limit ?? 10,
      search: table.searchValue?.trim() || undefined,
      status,
      customerType,
      lastTransactionType,
      segment: segment && segment !== "ALL" ? segment : undefined,
      fromDate: toIsoDateTime(startDate, false),
      toDate: toIsoDateTime(endDate, true),
    };
  }, [
    table.dateRange,
    table.limit,
    table.page,
    table.searchValue,
    table.selections,
  ]);

  const exportParams = useMemo<AgentCustomerExportParams>(
    () => ({
      search: requestParams.search,
      status: requestParams.status,
      customerType: requestParams.customerType,
      lastTransactionType: requestParams.lastTransactionType,
      segment: requestParams.segment,
      fromDate: requestParams.fromDate,
      toDate: requestParams.toDate,
    }),
    [requestParams]
  );

  const query = useFetchDataSeperateLoading<AgentCustomerListResponse>(
    [...agentKeys.customers.list(requestParams)],
    () => agentApi.customers.list(requestParams),
    true
  );

  const customers = query.data?.data ?? [];
  const pagination = query.data?.metadata?.pagination;

  return {
    customers,
    exportParams,
    requestParams,
    page: pagination?.page ?? requestParams.page ?? 1,
    limit: pagination?.limit ?? requestParams.limit ?? 10,
    total: pagination?.total ?? customers.length,
    totalPages: pagination?.totalPages ?? 1,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
  };
}
