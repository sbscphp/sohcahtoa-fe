"use client";

import { useState } from "react";
import { Card, Text } from "@mantine/core";
import DynamicTableSection from "../../../_components/DynamicTableSection";
import { PriorityBadge } from "./SettlementDashboardShared";
import {
  useSettlementDiscrepancies,
  type SettlementDiscrepancyListItem,
} from "../hooks/useSettlementDiscrepancies";

const PAGE_SIZE = 10;

const headers = [
  { label: "Title/ID", key: "title" },
  { label: "Outlet", key: "outlet" },
  { label: "Flagged Date", key: "date" },
  { label: "Priority", key: "priority" },
];

export function DiscrepancyReportsSection() {
  const [page, setPage] = useState(1);

  const {
    discrepancies,
    totalPages,
    isLoading,
  } = useSettlementDiscrepancies({ page, limit: PAGE_SIZE });

  const renderItems = (item: SettlementDiscrepancyListItem) => [
    <div key="title">
      <Text size="sm" fw={600} c="dark">{item.title}</Text>
      <Text size="xs" c="dimmed">{item.displayId}</Text>
    </div>,
    <div key="outlet">
      <Text size="sm" fw={500} c="dark">{item.outlet}</Text>
      {item.outletKind ? (
        <Text size="xs" c="dimmed">{item.outletKind}</Text>
      ) : null}
    </div>,
    <div key="date">
      <Text size="sm" fw={500} c="dark">{item.flaggedDate}</Text>
      <Text size="xs" c="dimmed">{item.flaggedTime}</Text>
    </div>,
    <PriorityBadge key="priority" level={item.priority} />,
  ];

  return (
    <Card padding="lg" radius="md" withBorder className="h-full bg-white">
      <Text fw={700} size="lg" mb="lg">Discrepancy Reports</Text>
      <DynamicTableSection
        headers={headers}
        data={discrepancies}
        loading={isLoading}
        renderItems={renderItems}
        emptyTitle="No discrepancy reports"
        emptyMessage="There are no discrepancy reports to display yet. New reports will appear here when available."
        pagination={{
          page,
          totalPages: Math.max(totalPages, 1),
          onNext: () => setPage((p) => Math.min(p + 1, Math.max(totalPages, 1))),
          onPrevious: () => setPage((p) => Math.max(p - 1, 1)),
          onPageChange: setPage,
        }}
      />
    </Card>
  );
}
