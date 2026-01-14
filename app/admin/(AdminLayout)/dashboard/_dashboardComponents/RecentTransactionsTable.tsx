"use client";

import { Card, Group, Text, ActionIcon } from "@mantine/core";
import { Transaction } from "../../../_types/dashboard";
import { StatusBadge } from "../../../_components/StatusBadge";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import DynamicTableSection from "../../../_components/DynamicTableSection";

export function RecentTransactionsTable({
  data,
  loading = false,
}: {
  data: Transaction[];
  loading?: boolean;
}) {
  return (
    <Card withBorder radius="md" padding="md">
      <Group justify="space-between" mb="md">
        <Text fw={500} size="lg">
          Recent Transactions
        </Text>
        <div className="flex items-center gap-1 cursor-pointer">
          <Text size="sm" c="orange">
            View all
          </Text>
          <ArrowUpRight size={14} color="orange" />
        </div>
      </Group>

      <DynamicTableSection
        headers={[
          { label: "Transaction ID", key: "id" },
          { label: "Transaction Date", key: "date" },
          { label: "Status", key: "status" },
          { label: "", key: "action" },
        ]}
        data={data}
        loading={loading}
        renderItems={(transaction: Transaction) => {
          return [
            <Text key="id" size="sm" fw={500}>
              {transaction.id}
            </Text>,
            <div key="date">
              <Text size="sm" fw={500}>
                {transaction.date}
              </Text>
              <Text size="xs" c="dimmed">
                {transaction.time}
              </Text>
            </div>,
            <StatusBadge key="status" status={transaction.status} />,
            <ActionIcon
              key="action"
              variant="light"
              color="orange"
              radius="xl"
              size="md"
            >
              <ChevronRight size={16} />
            </ActionIcon>,
          ];
        }}
        emptyMessage="No transactions found"
        emptyTitle="No Transactions"
      />
    </Card>
  );
}
