"use client";

import type {
  AgentCustomerSegment,
  AgentCustomerStatsResponse,
  AgentCustomerSummary,
} from "@/app/_lib/api/types";
import { useTable } from "@/app/_hooks/use-table";
import { useCreateData, useFetchData } from "@/app/_lib/api/hooks";
import { agentApi } from "@/app/agent/_services/agent-api";
import { notifications } from "@mantine/notifications";
import { CustomerStatCards } from "./_components/CustomerStatCards";
import CustomerTable from "./_components/CustomerTable";
import { useAgentCustomers } from "./hooks/useAgentCustomers";
import type { AgentCustomerFilterKey } from "./constant";

export default function CustomerManagementPage() {
  const table = useTable<AgentCustomerFilterKey>({
    initial: {
      q: "",
      selections: {},
      dateRange: null,
      page: 1,
      limit: 10,
    },
  });

  const {
    customers,
    isLoading,
    totalPages,
    exportParams,
  } = useAgentCustomers(table);

  const exportMutation = useCreateData(async () => {
    const { blob, filename } = await agentApi.customers.export(exportParams);
    return {
      blob,
      filename: filename ?? `agent-customers-${new Date().toISOString().slice(0, 10)}.csv`,
    };
  });

  const handleExportClick = () => {
    if (exportMutation.isPending) return;
    exportMutation.mutate(undefined, {
      onSuccess: ({ blob, filename }) => {
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(objectUrl);
      },
      onError: (error) => {
        notifications.show({
          title: "Export failed",
          message: error.message || "Unable to export customers. Please try again.",
          color: "red",
        });
      },
    });
  };

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
  const activeSegment =
    (table.selections.segment?.[0] as AgentCustomerSegment | undefined) ?? "ALL";

  const handleSegmentChange = (segment: AgentCustomerSegment) => {
    table.applyFilters({
      selections: {
        ...table.selections,
        segment: segment === "ALL" ? [] : [segment],
      },
      dateRange: table.dateRange,
    });
  };

  return (
    <div className="space-y-6">
      <CustomerStatCards
        totalCustomers={totalCustomers}
        verifiedCustomers={verifiedCustomers}
        repeatCustomers={repeatCustomers}
        pendingKYC={pendingKYC}
        activeSegment={activeSegment}
        onSegmentChange={handleSegmentChange}
      />
      <CustomerTable
        customers={customers as AgentCustomerSummary[]}
        loading={isLoading}
        page={table.page ?? 1}
        totalPages={totalPages}
        search={table.searchValue}
        filterValues={{
          selections: table.selections,
          dateRange: table.dateRange,
        }}
        onSearchChange={(value) => {
          table.setSearch(value);
        }}
        onFiltersApply={(values) => {
          table.applyFilters(values);
        }}
        onPageChange={table.setPage}
        onExportClick={handleExportClick}
      />
    </div>
  );
}
