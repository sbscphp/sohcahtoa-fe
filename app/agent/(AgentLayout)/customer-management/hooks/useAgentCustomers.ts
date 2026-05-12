"use client";

import { useMemo } from "react";
import { useFetchDataSeperateLoading } from "@/app/_lib/api/hooks";
import { agentKeys } from "@/app/_lib/api/query-keys";
import type { AgentCustomerListResponse } from "@/app/_lib/api/types";
import { agentApi } from "@/app/agent/_services/agent-api";
import type { UseTableResult } from "@/app/_hooks/use-table";

export type AgentCustomerUiStatusFilter =
  | "Filter By"
  | "All"
  | "Pending"
  | "Approved"
  | "Rejected";

function mapStatusFilterToApiStatus(status?: AgentCustomerUiStatusFilter) {
  if (!status || status === "Filter By" || status === "All") return undefined;
  if (status === "Approved") return "VERIFIED";
  if (status === "Rejected") return "REJECTED";
  return "NOT_STARTED";
}

type AgentCustomerSelectionKey = "status";

export function useAgentCustomers(
  table: UseTableResult<AgentCustomerSelectionKey>
) {
  const statusFilter = (table.selections.status?.[0] ??
    "Filter By") as AgentCustomerUiStatusFilter;

  const requestParams = useMemo(
    () => ({
      page: table.page ?? 1,
      limit: table.limit ?? 10,
      search: table.searchValue?.trim() || undefined,
      status: mapStatusFilterToApiStatus(statusFilter),
    }),
    [statusFilter, table.limit, table.page, table.searchValue]
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
    statusFilter,
    page: pagination?.page ?? requestParams.page,
    limit: pagination?.limit ?? requestParams.limit,
    total: pagination?.total ?? customers.length,
    totalPages: pagination?.totalPages ?? 1,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
  };
}
