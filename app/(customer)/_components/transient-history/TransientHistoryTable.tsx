"use client";

import {
  TableWrapper,
  type PaginatedTableColumn,
} from "@/app/(customer)/_components/common";
import type {
  TableFilterGroup,
  TableFilterValues,
} from "@/app/(customer)/_components/common/table/TableFilterSheet";
import { formatCurrency } from "@/app/(customer)/_lib/formatCurrency";
import type { TransientHistoryRow } from "@/app/(customer)/(CustomerLayout)/transient-history/helper";
import { useMemo } from "react";

const NGN = "NGN";

function formatNgnAmount(amount: number): string {
  const { formatted } = formatCurrency(amount, NGN);
  return formatted.replace(/^₦/, "₦ ");
}

function formatDateTime(dateString: string) {
  const date = new Date(dateString);
  return {
    date: date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    time: date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
  };
}

function DateTimeCell({ date, time }: Readonly<{ date: string; time: string }>) {
  return (
    <div className="flex flex-col gap-0">
      <p className="text-body-text-300 text-sm leading-5">{date}</p>
      <p className="text-body-text-200 text-xs leading-5">{time}</p>
    </div>
  );
}

interface TransientHistoryTableProps {
  rows: TransientHistoryRow[];
  isLoading?: boolean;
  page: number;
  pageSize: number;
  totalPages: number;
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters: TableFilterGroup[];
  filterValues?: TableFilterValues;
  onFiltersApply: (values: TableFilterValues) => void;
  onExportClick: () => void;
  onPageChange: (page: number) => void;
}

export default function TransientHistoryTable({
  rows,
  isLoading = false,
  page,
  pageSize,
  totalPages,
  searchValue,
  onSearchChange,
  filters,
  filterValues,
  onFiltersApply,
  onExportClick,
  onPageChange,
}: Readonly<TransientHistoryTableProps>) {
  const columns: PaginatedTableColumn<TransientHistoryRow>[] = useMemo(
    () => [
      {
        key: "transactionId",
        label: "Transaction ID",
        render: (row) => (
          <p className="text-body-text-300 font-medium text-sm leading-5">
            ID:{row.transactionId}
          </p>
        ),
      },
      {
        key: "date",
        label: "Date & Time",
        render: (row) => {
          const { date, time } = formatDateTime(row.date);
          return <DateTimeCell date={date} time={time} />;
        },
      },
      {
        key: "totalDebit",
        label: "Total Debits",
        render: (row) => (
          <p className="text-body-text-300 font-medium text-sm leading-5">
            {formatNgnAmount(row.totalDebit)}
          </p>
        ),
      },
      {
        key: "totalCredit",
        label: "Total Credit",
        render: (row) => (
          <p className="text-body-text-300 font-medium text-sm leading-5">
            {formatNgnAmount(row.totalCredit)}
          </p>
        ),
      },
      {
        key: "balance",
        label: "Balance",
        render: (row) => (
          <p className="text-body-text-300 font-medium text-sm leading-5">
            {formatNgnAmount(row.balance)}
          </p>
        ),
      },
    ],
    []
  );

  return (
    <TableWrapper<TransientHistoryRow>
      title="Transient History"
      filters={filters}
      filterValues={filterValues}
      onFiltersApply={onFiltersApply}
      onExportClick={onExportClick}
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      data={rows}
      columns={columns}
      pageSize={pageSize}
      page={page}
      onPageChange={onPageChange}
      totalPages={totalPages}
      keyExtractor={(row) => row.id}
      emptyTitle="No history yet"
      emptyMessage="Your wallet activity will appear here once transactions are recorded."
      isLoading={isLoading}
    />
  );
}
