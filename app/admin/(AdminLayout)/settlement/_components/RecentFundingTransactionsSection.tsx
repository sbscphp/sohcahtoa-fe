"use client";

import { Card, Text, Badge, ActionIcon } from "@mantine/core";
import { ChevronRight } from "lucide-react";
import DynamicTableSection from "../../../_components/DynamicTableSection";
import { SectionHeader } from "./SettlementDashboardShared";
import { transactionData } from "./settlementDashboardMockData";

export function RecentFundingTransactionsSection() {
  const headers = [
    { label: "Reference ID", key: "id" },
    { label: "Amount Sent", key: "amount" },
    { label: "Fund Date", key: "date" },
    { label: "Status", key: "status" },
    { label: "", key: "action" },
  ];

  const renderItems = (item: (typeof transactionData)[number]) => [
    <Text key="id" size="sm" fw={600} c="gray.7">{item.id}</Text>,
    <Text key="amount" size="sm" fw={600} c="dark">{item.amount}</Text>,
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
    <ActionIcon key="action" variant="subtle" color="orange" radius="xl" size="sm" className="bg-orange-50 text-orange-500">
      <ChevronRight size={16} />
    </ActionIcon>,
  ];

  return (
    <Card padding="lg" radius="md" withBorder className="h-full bg-white">
      <SectionHeader title="Recent Funding Transactions" />
      <DynamicTableSection
        headers={headers}
        data={transactionData}
        renderItems={renderItems}
        pagination={{ page: 1, totalPages: 5, onNext: () => {}, onPrevious: () => {} }}
      />
    </Card>
  );
}
