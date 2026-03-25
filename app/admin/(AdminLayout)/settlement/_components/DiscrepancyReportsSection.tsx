"use client";

import React from "react";
import { Card, Text, ActionIcon } from "@mantine/core";
import { ChevronRight } from "lucide-react";
import DynamicTableSection from "../../../_components/DynamicTableSection";
import { SectionHeader, PriorityBadge } from "./SettlementDashboardShared";
import { discrepancyData } from "./settlementDashboardMockData";

export function DiscrepancyReportsSection() {
  const headers = [
    { label: "Title/ID", key: "title" },
    { label: "Outlet", key: "outlet" },
    { label: "Flagged Date", key: "date" },
    { label: "Priority", key: "priority" },
    { label: "", key: "action" },
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
    <PriorityBadge key="priority" level={item.priority} />,
    <ActionIcon key="action" variant="subtle" color="orange" radius="xl" size="sm" className="bg-orange-50 text-orange-500">
      <ChevronRight size={16} />
    </ActionIcon>,
  ];

  return (
    <Card padding="lg" radius="md" withBorder className="h-full bg-white">
      <SectionHeader title="Discrepancy Reports" />
      <DynamicTableSection
        headers={headers}
        data={discrepancyData}
        renderItems={renderItems}
        pagination={{ page: 1, totalPages: 5, onNext: () => {}, onPrevious: () => {} }}
      />
    </Card>
  );
}
