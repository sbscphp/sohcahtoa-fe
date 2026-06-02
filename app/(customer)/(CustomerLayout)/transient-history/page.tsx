"use client";

import TransientHistoryTable from "@/app/(customer)/_components/transient-history/TransientHistoryTable";
import type { TableFilterValues } from "@/app/(customer)/_components/common/table/TableFilterSheet";
import { customerApi } from "@/app/(customer)/_services/customer-api";
import { useTableState } from "@/app/_hooks/use-table-state";
import { useCreateData, useFetchData } from "@/app/_lib/api/hooks";
import { customerKeys } from "@/app/_lib/api/query-keys";
import type { CustomerTransientHistoryListParams } from "@/app/_lib/api/types";
import { toDateRangeParams } from "@/app/_lib/utils/query-format";
import { notifications } from "@mantine/notifications";
import { useMemo } from "react";
import { TRANSIENT_HISTORY_FILTER_OPTIONS } from "./constant";
import { mapTransientHistoryItem } from "./helper";

const PAGE_SIZE = 10;

export default function TransientHistoryPage() {
  const table = useTableState({
    initial: {
      q: "",
      selections: {},
      dateRange: null,
      sortBy: "transaction_date",
      sortOrder: "desc",
      page: 1,
      limit: PAGE_SIZE,
    },
  });

  const listParams = useMemo(() => {
    const { startDate, endDate } = toDateRangeParams(table.dateRange);

    return {
      q: table.searchValue || undefined,
      startDate,
      endDate,
      sortBy: table.sortBy,
      sortOrder: table.sortOrder,
      page: table.page ?? 1,
      limit: table.limit ?? PAGE_SIZE,
    };
  }, [
    table.dateRange,
    table.limit,
    table.page,
    table.searchValue,
    table.sortBy,
    table.sortOrder,
  ]);

  const exportMutation = useCreateData(async () => {
    const exportParams = {
      ...listParams,
      page: undefined,
      limit: undefined,
    } as CustomerTransientHistoryListParams;

    const { blob, filename } =
      await customerApi.wallet.transientHistory.export(exportParams);

    return {
      blob,
      filename:
        filename ??
        `transient-history-${new Date().toISOString().slice(0, 10)}.csv`,
    };
  });

  const { data: apiResponse, isLoading } = useFetchData(
    [...customerKeys.wallet.transientHistory(listParams)],
    () => customerApi.wallet.transientHistory.list(listParams),
    true
  );

  const rows = useMemo(
    () => (apiResponse?.data ?? []).map(mapTransientHistoryItem),
    [apiResponse?.data]
  );

  const totalPages = Math.max(1, apiResponse?.pagination?.totalPages ?? 1);

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
          message:
            error.message ||
            "Unable to export transient history. Please try again.",
          color: "red",
        });
      },
    });
  };

  return (
    <div className="bg-white rounded-2xl p-4 md:p-6">
      <TransientHistoryTable
        rows={rows}
        isLoading={isLoading}
        page={table.page ?? 1}
        pageSize={PAGE_SIZE}
        totalPages={totalPages}
        searchValue={table.searchValue}
        onSearchChange={(value) => {
          table.setSearch(value);
          table.setPage(1);
        }}
        filters={TRANSIENT_HISTORY_FILTER_OPTIONS}
        filterValues={{
          selections: table.selections,
          dateRange: table.dateRange,
        }}
        onFiltersApply={(next: TableFilterValues) => {
          table.setSelections(next.selections ?? {});
          table.setDateRange(next.dateRange ?? null);
          table.setPage(1);
        }}
        onExportClick={handleExportClick}
        onPageChange={(next) => table.setPage(next)}
      />
    </div>
  );
}
