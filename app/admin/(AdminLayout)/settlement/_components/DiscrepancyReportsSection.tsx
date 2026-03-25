"use client";

import { Card, Text } from "@mantine/core";
import DynamicTableSection from "../../../_components/DynamicTableSection";
import { PriorityBadge } from "./SettlementDashboardShared";
import { discrepancyData } from "./settlementDashboardMockData";

export function DiscrepancyReportsSection() {
  const headers = [
    { label: "Title/ID", key: "title" },
    { label: "Outlet", key: "outlet" },
    { label: "Flagged Date", key: "date" },
    { label: "Priority", key: "priority" },
  ];

  const renderItems = (item: (typeof discrepancyData)[number]) => [
    <div key="title">
      <Text size="sm" fw={600} c="dark">{item.title}</Text>
      <Text size="xs" c="dimmed">{item.id}</Text>
    </div>,
    <div key="outlet">
      <Text size="sm" fw={500} c="dark">{item.outlet}</Text>
      <Text size="xs" c="dimmed">{item.type}</Text>
    </div>,
    <div key="date">
      <Text size="sm" fw={500} c="dark">{item.date}</Text>
      <Text size="xs" c="dimmed">{item.time}</Text>
    </div>,
    <PriorityBadge key="priority" level={item.priority} />
  ];

  return (
    <Card padding="lg" radius="md" withBorder className="h-full bg-white">
      <Text fw={700} size="lg" mb="lg">Discrepancy Reports</Text>
      <DynamicTableSection
        headers={headers}
        data={discrepancyData}
        renderItems={renderItems}
        pagination={{ page: 1, totalPages: 5, onNext: () => {}, onPrevious: () => {} }}
      />
    </Card>
  );
}
