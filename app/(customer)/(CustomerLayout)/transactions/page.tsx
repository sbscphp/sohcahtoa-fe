"use client";

import type { TableFilterValues } from "@/app/(customer)/_components/common/table/TableFilterSheet";
import TransactionSummaryCards from "@/app/(customer)/_components/transactions/TransactionSummaryCards";
import TransactionTableOverview, { type Transaction } from "@/app/(customer)/_components/transactions/table/TransactionTableOverview";
import { customerApi } from "@/app/(customer)/_services/customer-api";
import { useTableState } from "@/app/_hooks/use-table-state";
import {
  mergeTableStateFromUrl,
  readTableStateFromSearchParams,
  useTableUrlSync,
} from "@/app/_hooks/use-table-url-sync";
import { useCreateData, useFetchData } from "@/app/_lib/api/hooks";
import { customerKeys } from "@/app/_lib/api/query-keys";
import { toCsvParam, toDateRangeParams } from "@/app/_lib/utils/query-format";
import type { TransactionListParams } from "@/app/_lib/api/types";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { notifications } from "@mantine/notifications";
import { FILTER_OPTIONS, TX_FILTER_OPTIONS } from "./constant";
import { mapListItemToTransaction } from "./helper";
import { TRANSACTION_GROUP_TAB_ALL } from "@/app/(customer)/_lib/transaction-group-tabs";
import { buildTransactionListQueryParams } from "@/app/(customer)/_lib/transaction-list-params";
import {
  TRANSACTION_LIST_PAGE_SIZE,
  TRANSACTION_LIST_URL_SYNC,
  resolveTransactionListGroupTab,
  type TransactionListSelectionKey,
} from "@/app/(customer)/_lib/transaction-list-url-sync";

function TransactionsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialFromUrl = useMemo(() => {
    const fromUrl = readTableStateFromSearchParams(
      searchParams,
      TRANSACTION_LIST_URL_SYNC
    );
    return {
      fromUrl,
      table: mergeTableStateFromUrl(
        {
          q: "",
          selections: {},
          dateRange: null,
          sortBy: "createdAt",
          sortOrder: "desc",
          page: 1,
          limit: TRANSACTION_LIST_PAGE_SIZE,
        },
        fromUrl
      ),
      type: resolveTransactionListGroupTab(fromUrl.params?.type),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate once from the URL on mount / back
  }, []);

  const [activeType, setActiveType] = useState(initialFromUrl.type);

  const table = useTableState<TransactionListSelectionKey>({
    initial: initialFromUrl.table,
  });

  useTableUrlSync(
    {
      state: {
        q: table.searchValue,
        selections: table.selections,
        dateRange: table.dateRange,
        sortBy: table.sortBy,
        sortOrder: table.sortOrder,
        page: table.page,
        params: {
          type:
            activeType === TRANSACTION_GROUP_TAB_ALL ? undefined : activeType,
        },
      },
    },
    TRANSACTION_LIST_URL_SYNC
  );

  const listParams = useMemo(() => {
    const status = toCsvParam(table.selections.status);
    const transactionTypeFilter = toCsvParam(table.selections.transactionType);
    const currency = toCsvParam(table.selections.currency);
    const stage = toCsvParam(table.selections.stage);
    const { startDate, endDate } = toDateRangeParams(table.dateRange);

    return buildTransactionListQueryParams({
      activeGroupTab: activeType,
      transactionTypeFilter,
      q: table.searchValue || undefined,
      status,
      currency,
      stage,
      startDate,
      endDate,
      sortBy: table.sortBy,
      sortOrder: table.sortOrder,
      page: table.page ?? 1,
      limit: table.limit ?? TRANSACTION_LIST_PAGE_SIZE,
    });
  }, [
    activeType,
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

  const { data: statsResponse } = useFetchData(
    [...customerKeys.transactions.stats()],
    () => customerApi.transactions.stats(),
    true
  );

  const tableRows: Transaction[] = useMemo(
    () => (apiResponse?.data ?? []).map(mapListItemToTransaction),
    [apiResponse?.data]
  );

  const totalPages = Math.max(1, apiResponse?.pagination?.totalPages ?? 1);
  const totalTransactions = statsResponse?.data?.total ?? 0;
  const completed = statsResponse?.data?.completed ?? 0;
  const rejected = statsResponse?.data?.rejected ?? 0;
  const pending = statsResponse?.data?.pending ?? 0;

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
            table.applyFilters({
              selections: next.selections ?? {},
              dateRange: next.dateRange ?? null,
            });
          }}
          onExportClick={handleExportClick}
          transactions={tableRows}
          page={table.page ?? 1}
          pageSize={TRANSACTION_LIST_PAGE_SIZE}
          totalPages={totalPages}
          onPageChange={table.setPage}
          onRowClick={handleRowClick}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={<div className="space-y-6" />}>
      <TransactionsPageContent />
    </Suspense>
  );
}
