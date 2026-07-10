"use client";

import { useState } from "react";
import { Card, Text, Group, Select } from "@mantine/core";
import { TransactionStatusBadge } from "../../../_components/TransactionStatusBadge";
import { ArrowUpRight, ListFilter } from "lucide-react";
import DynamicTableSection from "../../../_components/DynamicTableSection";
import { adminRoutes } from "@/lib/adminRoutes";
import { useRouter } from "next/navigation";
import {
  useSettlementFundingTransactions,
  SETTLEMENT_STATUS_FILTER_OPTIONS,
  type SettlementFundingTransactionListItem,
} from "../hooks/useSettlementFundingTransactions";
import { formatCurrency } from "@/app/utils/helper/formatCurrency";
import Link from "next/link";
import { toSentenceCase } from "@/app/utils/helper/toSentence";

const statusOptions = [
  { value: "All", label: "Filter By" },
  ...SETTLEMENT_STATUS_FILTER_OPTIONS,
];

export function RecentFundingTransactionsSection() {
  const router = useRouter();

  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("All");

  const { transactions, isLoading, isFetching, totalPages } =
    useSettlementFundingTransactions({
      page,
      limit: PAGE_SIZE,
      status: statusFilter !== "All" ? statusFilter : undefined,
    });

  const safeTotalPages = Math.max(totalPages, 1);
  
  const headers = [
    { label: "Customer", key: "customer" },
    { label: "Reference ID", key: "referenceId" },
    { label: "Transaction Type", key: "transactionType" },
    { label: "Amount", key: "amount" },
    { label: "Deposited At", key: "date" },
    { label: "Payment Method", key: "paymentMethod" },
    { label: "Settlement Status", key: "status" },
    { label: "Transaction Status", key: "transactionStatus" },
  ];

  const renderItems = (item: SettlementFundingTransactionListItem) => [
    <div key="customer">
      <Text size="sm" fw={500}>
        {item.customerName}
      </Text>
      <Text size="xs" c="dimmed">
        {item.customerEmail}
      </Text>
    </div>,
    <Text key="referenceId" size="sm" fw={600} c="gray.7">
      {item.referenceId}
    </Text>,
    <Text key="transactionType" size="sm">
      {item.transactionType}
    </Text>,
    <Text key="amount" size="sm" fw={600} c="dark">
      {formatCurrency(item.amount, item.currency)}
    </Text>,
    <div key="date">
      <Text size="sm" fw={500} c="dark">
        {item.date}
      </Text>
      <Text size="xs" c="dimmed">
        {item.time}
      </Text>
    </div>,
    <Text key="paymentMethod" size="sm">
      {toSentenceCase(item.paymentMethod)}
    </Text>,
    <TransactionStatusBadge
      key="status"
      status={item.status}
      size="md"
    />,
    <TransactionStatusBadge
      key="transactionStatus"
      status={item.transactionStatus}
      size="md"
    />,
  ];

  return (
    <Card padding="lg" radius="md" withBorder className="h-full bg-white">
      <Group justify="space-between" mb="lg">
        <Text fw={700} size="lg" c="dark">
          Recent Funding Transactions
        </Text>
        <Group gap="sm">
          <Select
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value ?? "All");
              setPage(1);
            }}
            data={statusOptions}
            radius="xl"
            w={180}
            rightSection={<ListFilter size={16} />}
          />
          <Link
            href={adminRoutes.adminTransactions()}
            className="text-orange-600 cursor-pointer hover:text-orange-700 flex items-center gap-2"
          >
            <Text size="sm" fw={600}>
              View all
            </Text>
            <ArrowUpRight size={16} />
          </Link>
        </Group>
      </Group>
      <DynamicTableSection
        headers={headers}
        data={transactions}
        loading={isLoading || isFetching}
        renderItems={renderItems}
        onRowClick={(item) =>
          router.push(adminRoutes.adminTransactionDetails(item.transactionId))
        }
        pagination={{
          page,
          totalPages: safeTotalPages,
          onNext: () =>
            setPage((p) => Math.min(p + 1, safeTotalPages)),
          onPrevious: () =>
            setPage((p) => Math.max(p - 1, 1)),
          onPageChange: setPage,
        }}
      />
    </Card>
  );
}
