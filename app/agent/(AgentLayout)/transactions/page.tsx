"use client";

import type {
  TableFilterValues
} from "@/app/(customer)/_components/common/table/TableFilterSheet";
import { useTableState } from "@/app/_hooks/use-table-state";
import { useCreateData, useFetchData } from "@/app/_lib/api/hooks";
import { agentKeys } from "@/app/_lib/api/query-keys";
import { toCsvParam, toDateRangeParams } from "@/app/_lib/utils/query-format";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { notifications } from "@mantine/notifications";
import TransactionSummaryCards from "./_components/TransactionSummaryCards";
import TransactionTableOverview from "./_components/TransactionTableOverview";
import { TX_FILTER_OPTIONS } from "./constant";
import { mapListItemToTransaction } from "./helper";
import { agentApi } from "../../_services/agent-api";
import { Transaction } from './types';
import type { TransactionListParams } from "@/app/_lib/api/types";

const TAB_TO_GROUP = {
  "Buy FX": "BUY" as const,
  "Sell FX": "SELL" as const,
  "Receive FX": "REMITTANCE" as const,
};

export default function AgentTransactionsPage() {
  const router = useRouter();
  const [activeType, setActiveType] = useState<string>("Buy FX");
  const group = TAB_TO_GROUP[activeType as keyof typeof TAB_TO_GROUP] ?? undefined;

  type TransactionSelectionKey = "status" | "transactionType" | "currency" | "stage";

  const table = useTableState<TransactionSelectionKey>({
    initial: {
      q: "",
      selections: {},
      dateRange: null,
      sortBy: "createdAt",
      sortOrder: "desc",
    }
  });

  const listParams = useMemo(() => {
    const status = toCsvParam(table.selections.status);
    const type = toCsvParam(table.selections.transactionType);
    const currency = toCsvParam(table.selections.currency);
    const stage = toCsvParam(table.selections.stage);
    const { startDate, endDate } = toDateRangeParams(table.dateRange);

    return {
      q: table.searchValue || undefined,
      status,
      type,
      group: type ? undefined : group,
      currency,
      stage,
      startDate,
      endDate,
      sortBy: table.sortBy,
      sortOrder: table.sortOrder,
      page: table.page ?? 1,
      limit: table.limit ?? 20,
    };
  }, [
    group,
    table.dateRange,
    table.limit,
    table.page,
    table.searchValue,
    table.selections,
    table.sortBy,
    table.sortOrder,
  ]);

  const exportMutation = useCreateData(async () => {
    const exportParams = {
      ...listParams,
      page: undefined,
      limit: undefined,
    } as TransactionListParams;

    const { blob, filename } = await agentApi.transactions.export(exportParams);
    return {
      blob,
      filename: filename ?? `transactions-${new Date().toISOString().slice(0, 10)}.csv`,
    };
  });



  const { data: apiResponse, isLoading } = useFetchData(
    [...agentKeys.transactions.list(listParams)],
    () => agentApi.transactions.list(listParams),
    true
  );
  const { data: transactionStats } = useFetchData(
    [...agentKeys.transactions.stats()],
    () => agentApi.transactions.stats(),
    true
  );

    const tableRowsRaw = useMemo(
    () => (apiResponse?.data ?? []).map(mapListItemToTransaction),
    [apiResponse?.data]
  );

  const tableRows = tableRowsRaw;

  const stats = (transactionStats as unknown as { data?: { total?: number; pending?: number; settled?: number; rejected?: number } })?.data;
  const totalTransactions = stats?.total ?? apiResponse?.pagination?.total ?? 0;
  const completed = stats?.settled ?? 0;
  const rejected = stats?.rejected ?? 0;
  const pending = stats?.pending ?? 0;

  const handleRowClick = (transaction: Transaction) => {
    router.push(`/agent/transactions/detail/${transaction.id}`);
  };

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
          message: error.message || "Unable to export transactions. Please try again.",
          color: "red",
        });
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-4">
        <TransactionSummaryCards
          totalTransactions={totalTransactions}
          completed={completed}
          rejected={rejected}
          pending={pending}
        />
      </div>

      <div className="bg-white rounded-2xl p-4">
        <TransactionTableOverview
          activeType={activeType}
          onTypeChange={setActiveType}
          filters={TX_FILTER_OPTIONS}
          filterValues={{ selections: table.selections, dateRange: table.dateRange }}
          onFiltersApply={(next: TableFilterValues) => {
            table.setSelections(next.selections ?? {});
            table.setDateRange(next.dateRange ?? null);
          }}
          onExportClick={handleExportClick}
          transactions={tableRows}
          pageSize={10}
          onRowClick={handleRowClick}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
