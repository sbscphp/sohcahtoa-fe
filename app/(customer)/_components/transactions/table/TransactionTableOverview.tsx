"use client";

import { ActionIcon, Text } from "@mantine/core";
import { CircleArrowRight01Icon, Plus } from "@hugeicons/core-free-icons";
import { Button } from "@mantine/core";
import Link from "next/link";
import { TableWrapper, type PaginatedTableColumn, type FilterTabOption } from "../../common";
import { HugeiconsIcon } from "@hugeicons/react";

export interface Transaction {
  id: string;
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
}

const statusColors: Record<Transaction["status"], string> = {
  Pending: "text-yellow-600",
  Completed: "text-green-600",
  Rejected: "text-red-600",
  "Request More Info": "text-blue-600",
  Approved: "text-green-600",
};

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
        <Text
          size="sm"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 500,
            fontSize: "14px",
            lineHeight: "20px",
            color: "#4D4B4B",
          }}
        >
          {transaction.id}
        </Text>
      ),
    },
    {
      key: "date",
      label: "Transaction Date",
      render: (transaction) => {
        const { date, time } = formatDate(transaction.date);
        return (
          <div className="flex flex-col gap-0">
            <Text
              size="sm"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500,
                fontSize: "14px",
                lineHeight: "20px",
                color: "#6C6969",
              }}
            >
              {date}
            </Text>
            <Text
              size="sm"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 400,
                fontSize: "14px",
                lineHeight: "20px",
                color: "#8F8B8B",
              }}
            >
              {time}
            </Text>
          </div>
        );
      },
    },
    {
      key: "type",
      label: "Transaction Type",
      render: (transaction) => (
        <Text
          size="sm"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 500,
            fontSize: "14px",
            lineHeight: "20px",
            color: "#4D4B4B",
          }}
        >
          {transaction.type}
        </Text>
      ),
    },
    {
      key: "stage",
      label: "Transaction Stage",
      render: (transaction) => (
        <Text
          size="sm"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 500,
            fontSize: "14px",
            lineHeight: "20px",
            color: "#4D4B4B",
          }}
        >
          {transaction.stage}
        </Text>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (transaction) => (
        <Text size="sm" className={`font-medium ${statusColors[transaction.status]}`}>
          {transaction.status}
        </Text>
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
          <HugeiconsIcon icon={CircleArrowRight01Icon} className="w-5 h-5 text-primary-300!" />
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
    />

  );
}
