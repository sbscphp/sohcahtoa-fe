"use client";

import type { TableFilterValues } from "@/app/(customer)/_components/common/table/TableFilterSheet";
import TransactionSummaryCards from "@/app/(customer)/_components/transactions/TransactionSummaryCards";
import TransactionTableOverview, { type Transaction } from "@/app/(customer)/_components/transactions/table/TransactionTableOverview";
import { customerApi } from "@/app/(customer)/_services/customer-api";
import { useTableState } from "@/app/_hooks/use-table-state";
import { useCreateData, useFetchData } from "@/app/_lib/api/hooks";
import { customerKeys } from "@/app/_lib/api/query-keys";
import { toCsvParam, toDateRangeParams } from "@/app/_lib/utils/query-format";
import type { TransactionListParams } from "@/app/_lib/api/types";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { notifications } from "@mantine/notifications";
import { FILTER_OPTIONS, TX_FILTER_OPTIONS } from "./constant";
import { mapListItemToTransaction } from "./helper";
import {
  resolveTransactionListGroup,
  TRANSACTION_GROUP_TAB_ALL,
} from "@/app/(customer)/_lib/transaction-group-tabs";

const PAGE_SIZE = 10;


export default function TransactionsPage() {
  const router = useRouter();
  const [activeType, setActiveType] = useState<string>(TRANSACTION_GROUP_TAB_ALL);
  const group = resolveTransactionListGroup(activeType);

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
      mode: group,
      group: type ? undefined : group,
      currency,
      stage,
      startDate,
      endDate,
      sortBy: table.sortBy,
      sortOrder: table.sortOrder,
      page: table.page ?? 1,
      limit: table.limit ?? PAGE_SIZE,
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

    const { blob, filename } = await customerApi.transactions.export(exportParams);
    return {
      blob,
      filename: filename ?? `transactions-${new Date().toISOString().slice(0, 10)}.csv`,
    };
  });

  const { data: apiResponse, isLoading } = useFetchData(
    [...customerKeys.transactions.list(listParams)],
    () => customerApi.transactions.list(listParams),
    true
  );

  const tableRowsRaw: Transaction[] = useMemo(
    () => (apiResponse?.data ?? []).map(mapListItemToTransaction),
    [apiResponse?.data]
  );

  const tableRows: Transaction[] = tableRowsRaw;

  const totalTransactions = apiResponse?.pagination?.total ?? 0;
  const totalPages = Math.max(1, apiResponse?.pagination?.totalPages ?? 1);
  const completed = tableRows.filter(
    (t) => t.status === "COMPLETED" || t.status === "APPROVED"
  ).length;
  const rejected = tableRows.filter((t) => t.status === "REJECTED").length;
  const pending = tableRows.filter(
    (t) =>
      t.status !== "COMPLETED" &&
      t.status !== "APPROVED" &&
      t.status !== "REJECTED"
  ).length;

  const handleRowClick = (transaction: Transaction) => {
    router.push(`/transactions/detail/${transaction.id}`);
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
          onTypeChange={(type) => {
            setActiveType(type);
            table.setPage(1);
          }}
          filterOptions={FILTER_OPTIONS}
          filters={TX_FILTER_OPTIONS}
          filterValues={{ selections: table.selections, dateRange: table.dateRange }}
          onFiltersApply={(next: TableFilterValues) => {
            table.setSelections(next.selections ?? {});
            table.setDateRange(next.dateRange ?? null);
            table.setPage(1);
          }}
          onExportClick={handleExportClick}
          transactions={tableRows}
          page={table.page ?? 1}
          pageSize={PAGE_SIZE}
          totalPages={totalPages}
          onPageChange={table.setPage}
          onRowClick={handleRowClick}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
