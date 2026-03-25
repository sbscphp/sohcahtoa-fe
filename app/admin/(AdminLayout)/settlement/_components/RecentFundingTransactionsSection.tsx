"use client";

import { useState } from "react";
import { Card, Text, Badge, ActionIcon, Group } from "@mantine/core";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import DynamicTableSection from "../../../_components/DynamicTableSection";
import { adminRoutes } from "@/lib/adminRoutes";
import { useRouter } from "next/navigation";
import { useSettlementFundingTransactions, type SettlementFundingTransactionListItem } from "../hooks/useSettlementFundingTransactions";
import { formatCurrency } from "@/app/utils/helper/formatCurrency";

export function RecentFundingTransactionsSection() {
  const router = useRouter();

  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);

  const { transactions, isLoading, isFetching, totalPages } =
    useSettlementFundingTransactions({ page, limit: PAGE_SIZE });

  const safeTotalPages = Math.max(totalPages, 1);
  
  const headers = [
    { label: "Reference ID", key: "id" },
    { label: "Amount Sent", key: "amount" },
    { label: "Fund Date", key: "date" },
    { label: "Status", key: "status" },
    { label: "", key: "action" },
  ];

  const renderItems = (item: SettlementFundingTransactionListItem) => [
    <Text key="id" size="sm" fw={600} c="gray.7">{item.id}</Text>,
    <Text key="amount" size="sm" fw={600} c="dark">{formatCurrency(item.amount)}</Text>,
    <div key="date">
      <Text size="sm" fw={500} c="dark">{item.date}</Text>
      <Text size="xs" c="dimmed">{item.time}</Text>
    </div>,
    <Badge
      key="status"
      variant="light"
      radius="sm"
      color={item.status === "Confirmed" ? "green" : "orange"}
      className={item.status === "Confirmed" ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"}
    >
      {item.status}
    </Badge>,
    <ActionIcon onClick={() => router.push(adminRoutes.adminTransactionDetails(item.id))} key="action" variant="subtle" color="orange" radius="xl" size="sm" className="bg-orange-50 text-orange-500">
      <ChevronRight size={16} />
    </ActionIcon>,
  ];

  return (
    <Card padding="lg" radius="md" withBorder className="h-full bg-white">
      <Group justify="space-between" mb="lg">
      <Text fw={700} size="lg" c="dark">Recent Funding Transactions</Text>
      <Group gap={4} className="text-orange-600 cursor-pointer hover:text-orange-700" onClick={() => router.push(adminRoutes.adminTransactions())}>
        <Text size="sm" fw={600}>View all</Text>
        <ArrowUpRight size={16} />
      </Group>
    </Group>
      <DynamicTableSection
        headers={headers}
        data={transactions}
        loading={isLoading || isFetching}
        renderItems={renderItems}
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
