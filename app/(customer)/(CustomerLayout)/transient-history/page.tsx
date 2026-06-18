"use client";

import TransientHistoryTable from "@/app/(customer)/_components/transient-history/TransientHistoryTable";
import type { TableFilterValues } from "@/app/(customer)/_components/common/table/TableFilterSheet";
import { formatCurrencyAmount } from "@/app/(customer)/_lib/currency";
import { customerApi } from "@/app/(customer)/_services/customer-api";
import { useTableState } from "@/app/_hooks/use-table-state";
import { useFetchData } from "@/app/_lib/api/hooks";
import { customerKeys } from "@/app/_lib/api/query-keys";
import { toDateRangeParams } from "@/app/_lib/utils/query-format";
import { useMemo } from "react";
import { TRANSIENT_HISTORY_FILTER_OPTIONS } from "./constant";
import {
  mapWalletLedgerEntry,
  normalizeCustomerWalletLedgerResponse,
} from "./helper";

const PAGE_SIZE = 10;

export default function TransientHistoryPage() {
  const table = useTableState<"type">({
    initial: {
      q: "",
      selections: {},
      dateRange: null,
      page: 1,
      limit: PAGE_SIZE,
    },
  });

  const listParams = useMemo(() => {
    const { startDate, endDate } = toDateRangeParams(table.dateRange);
    const type = table.selections.type?.[0];

    return {
      type: type || undefined,
      dateFrom: startDate,
      dateTo: endDate,
      page: table.page ?? 1,
      limit: table.limit ?? PAGE_SIZE,
    };
  }, [table.dateRange, table.limit, table.page, table.selections.type]);

  const { data: walletResponse, isLoading: isWalletLoading } = useFetchData(
    [...customerKeys.wallet.balance()],
    () => customerApi.wallet.getBalance(),
    true
  );

  const { data: ledgerResponse, isLoading: isLedgerLoading } = useFetchData(
    [...customerKeys.wallet.ledger(listParams)],
    () => customerApi.wallet.getLedger(listParams),
    true
  );

  const ledger = useMemo(
    () => normalizeCustomerWalletLedgerResponse(ledgerResponse),
    [ledgerResponse]
  );

  const rows = useMemo(
    () => ledger.entries.map(mapWalletLedgerEntry),
    [ledger.entries]
  );

  const walletBalance = walletResponse?.data?.balance ?? ledger.wallet.balance;
  const walletCurrency = walletResponse?.data?.currency ?? ledger.wallet.currency;
  const totalPages = Math.max(1, ledger.meta.totalPages ?? 1);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-4 md:p-6 border border-[#EAECF0]">
        <p className="text-sm text-body-text-200 mb-1">Wallet balance</p>
        <p className="text-2xl font-semibold text-body-text-300">
          {isWalletLoading && !walletResponse
            ? "—"
            : formatCurrencyAmount(walletBalance, walletCurrency)}
        </p>
      </div>

      <div className="bg-white rounded-2xl p-4 md:p-6">
        <TransientHistoryTable
          rows={rows}
          isLoading={isLedgerLoading}
          page={table.page ?? 1}
          pageSize={PAGE_SIZE}
          totalPages={totalPages}
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
          onPageChange={(next) => table.setPage(next)}
        />
      </div>
    </div>
  );
}
