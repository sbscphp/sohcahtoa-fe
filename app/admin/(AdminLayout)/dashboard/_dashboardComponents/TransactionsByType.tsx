"use client";

import { Card, Group, Text, Stack, Skeleton } from "@mantine/core";
import { DonutChart } from "@mantine/charts";
import type { AdminDashboardTransactionsByType } from "@/app/admin/_types/dashboard";
import type { DonutSegment } from "../mapDashboardData";
import { formatCurrency } from "@/app/utils/helper/formatCurrency";

const LEGEND_DOT: Record<string, string> = {
  "orange.7": "bg-orange-600",
  "orange.5": "bg-orange-500",
  "orange.3": "bg-orange-300",
  "orange.9": "bg-orange-800",
  "orange.2": "bg-orange-200",
  "gray.4": "bg-gray-400",
  "gray.5": "bg-gray-500",
};

function legendClass(segment: DonutSegment): string {
  return LEGEND_DOT[segment.color] ?? "bg-orange-400";
}

export function TransactionsByType({
  transactionsByType,
  donutData,
  loading = false,
}: {
  transactionsByType: AdminDashboardTransactionsByType | null;
  donutData: DonutSegment[];
  loading?: boolean;
}) {
  const total = transactionsByType?.totalAmount ?? 0;
  const windowDays = transactionsByType?.windowDays ?? 7;

  return (
    <Card withBorder radius="md" padding="md">
      <Group justify="space-between" mb="md">
        <Text fw={500}>Transactions by Type</Text>

        {loading ? (
          <Skeleton height={28} width={120} radius="lg" />
        ) : (
          <Text size="xs" c="dimmed">
            Last {windowDays} days
          </Text>
        )}
      </Group>

      {loading ? (
        <Skeleton height={280} radius="sm" />
      ) : (
        <div className="grid grid-cols-[2fr_1fr]">
          <Group justify="center">
            <DonutChart
              data={donutData}
              size={260}
              thickness={28}
              withLabelsLine={false}
              chartLabel={formatCurrency(total) || "$0"}
            />
            <div className="relative -top-34">
              <p className="text-xs">Total Amount</p>
            </div>
          </Group>

          <Stack gap={3} mt="md">
            {donutData.map((item) => (
              <Group key={item.name} gap="xs">
                <div
                  className={`h-2 w-2 shrink-0 rounded-full ${legendClass(item)}`}
                />
                <Text size="sm">{item.name}</Text>
              </Group>
            ))}
          </Stack>
        </div>
      )}
    </Card>
  );
}
