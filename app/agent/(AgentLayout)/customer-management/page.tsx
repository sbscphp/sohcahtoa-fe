"use client";

import type {
  AgentCustomerSummary,
  AgentCustomerStatsResponse,
} from "@/app/_lib/api/types";
import { useTable } from "@/app/_hooks/use-table";
import { useFetchData } from "@/app/_lib/api/hooks";
import { agentApi } from "@/app/agent/_services/agent-api";
import { CustomerStatCards } from "./_components/CustomerStatCards";
import CustomerTable from "./_components/CustomerTable";
import { useAgentCustomers } from "./hooks/useAgentCustomers";

export default function CustomerManagementPage() {
  const table = useTable<"status">({
    initial: {
      q: "",
      selections: {},
      page: 1,
      limit: 10,
    },
  });

  const {
    customers,
    statusFilter,
    isLoading,
    totalPages,
  } = useAgentCustomers(table);

  const { data: statsResponse } = useFetchData<AgentCustomerStatsResponse>(
    ["agent", "customers", "stats"],
    () => agentApi.customers.stats(),
    true
  );
  const stats = statsResponse?.data;

  const totalCustomers = stats?.totalCustomers ?? 0;
  const verifiedCustomers = stats?.verifiedCustomers ?? 0;
  const repeatCustomers = stats?.repeatCustomers ?? 0;
  const pendingKYC = stats?.pendingKyc ?? 0;

  return (
    <div className="space-y-6">
      <CustomerStatCards
        totalCustomers={totalCustomers}
        verifiedCustomers={verifiedCustomers}
        repeatCustomers={repeatCustomers}
        pendingKYC={pendingKYC}
      />
      <CustomerTable
        customers={customers as AgentCustomerSummary[]}
        loading={isLoading}
        page={table.page ?? 1}
        totalPages={totalPages}
        search={table.searchValue}
        filter={statusFilter}
        onSearchChange={(value) => {
          table.setSearch(value);
        }}
        onFilterChange={(value) => {
          table.setSelections(
            value === "Filter By" || value === "All" ? {} : { status: [value] }
          );
        }}
        onPageChange={table.setPage}
      />
    </div>
  );
}
