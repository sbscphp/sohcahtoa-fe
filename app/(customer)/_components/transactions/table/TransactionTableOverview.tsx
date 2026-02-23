"use client";

import { ActionIcon } from "@mantine/core";
import { Plus } from "@hugeicons/core-free-icons";
import { Button } from "@mantine/core";
import Link from "next/link";
import { TableWrapper, type PaginatedTableColumn, type FilterTabOption } from "../../common";
import { HugeiconsIcon } from "@hugeicons/react";
import { IconArrowRight } from "@/components/icons/IconArrowRight";
import { getStatusBadge } from "@/app/(customer)/_utils/status-badge";

export interface Transaction {
  id: string;
  referenceNumber?: string;
  date: string;
  type: string;
  stage: string;
  status: "Pending" | "Completed" | "Rejected" | "Request More Info" | "Approved";
  transaction_type: "Buy FX" | "Sell FX" | "Receive FX";
}

interface TransactionTableOverviewProps {
  activeType: string;
  onTypeChange: (type: string) => void;
  onFilterClick?: () => void;
  onExportClick?: () => void;
  transactions: Transaction[];
  pageSize?: number;
  onRowClick?: (transaction: Transaction) => void;
  isLoading?: boolean;
  skeletonRowCount?: number;
}

const FILTER_OPTIONS: FilterTabOption[] = [
  { value: "Buy FX", label: "Buy FX" },
  { value: "Sell FX", label: "Sell FX" },
  { value: "Receive FX", label: "Receive FX" },
];

export default function TransactionTableOverview({
  activeType,
  onTypeChange,
  onFilterClick,
  onExportClick,
  transactions,
  pageSize = 10,
  onRowClick,
  isLoading = false,
  skeletonRowCount = 4,
}: TransactionTableOverviewProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      time: date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
    };
  };

  const columns: PaginatedTableColumn<Transaction>[] = [
    {
      key: "id",
      label: "Transaction ID",
      render: (transaction) => (
        <p className="text-body-text-300 font-medium text-sm leading-5 max-w-[150px] truncate">
          {transaction.referenceNumber ?? transaction.id}
        </p>
      ),
    },
    {
      key: "date",
      label: "Transaction Date",
      render: (transaction) => {
        const { date, time } = formatDate(transaction.date);
        return (
          <div className="flex flex-col gap-0">
            <p className="text-body-text-300 text-sm leading-5">{date}</p>
            <p className="text-body-text-200 text-xs leading-5">{time}</p>
          </div>
        );
      },
    },
    {
      key: "type",
      label: "Transaction Type",
      render: (transaction) => (
        <p className="text-body-text-400 text-sm leading-5">{transaction.type}</p>
      ),
    },
    {
      key: "stage",
      label: "Transaction Stage",
      render: (transaction) => (
        <p className="text-body-text-400 text-sm leading-5">{transaction.stage}</p>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (transaction) => (
        <div style={getStatusBadge(transaction.status)}>{transaction.status}</div>
      ),
    },
    {
      key: "action",
      label: "",
      headerClassName: "w-12",
      className: "w-12",
      render: (transaction) => (
        <ActionIcon
          radius="md"
          variant="light"
          w={40}
          h={40}
          className="bg-[#FFF6F1]! border border-[#FFF6F1]!"
          style={{
            boxShadow: "0px 1px 2px rgba(16, 24, 40, 0.05)",
            padding: "10px",
          }}
          onClick={(e) => {
            e.stopPropagation();
            onRowClick?.(transaction);
          }}
          aria-label="View transaction details"
        >
          <IconArrowRight className="w-8 h-8" />
        </ActionIcon>
      ),
    },
  ];

  return (
    
      <TableWrapper
      title="All Transactions"
      filterOptions={FILTER_OPTIONS}
      activeFilter={activeType}
      onFilterChange={onTypeChange}
      onFilterClick={onFilterClick}
      onExportClick={onExportClick}
      actionButton={
        <Link href="/transactions/options">
          <Button
            variant="filled"
            size="sm"
            radius="xl"
            rightSection={<HugeiconsIcon icon={Plus} className="w-3.5 h-3.5 hover:text-primary-300!" />}
            className="bg-primary-400 hover:bg-primary-500"
          >
            New Transaction
          </Button>
        </Link>
      }
      data={transactions}
      columns={columns}
      pageSize={pageSize}
      onRowClick={onRowClick}
      keyExtractor={(transaction) => transaction.id}
      emptyMessage="No transactions found"
      isLoading={isLoading}
      skeletonRowCount={skeletonRowCount}
    />

  );
}
