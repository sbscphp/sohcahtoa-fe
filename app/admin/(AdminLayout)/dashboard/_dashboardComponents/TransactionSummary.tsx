"use client";

import { Card, Text, Group, Skeleton } from "@mantine/core";
import dynamic from "next/dynamic";
import { HiCalendarDateRange } from "react-icons/hi2";

const BarChart = dynamic(
  () => import("@mantine/charts").then((m) => m.BarChart),
  { ssr: false }
);

export type TransactionSummaryChartRow = {
  month: string;
  completed: number;
  pending: number;
  rejected: number;
};

export function TransactionSummary({
  year,
  chartData,
  loading = false,
}: {
  year: number | null;
  chartData: TransactionSummaryChartRow[];
  loading?: boolean;
}) {
  const yearStr = year != null ? String(year) : "";

  return (
    <Card radius="md" padding="md" withBorder>
      <div className="flex items-center justify-between mb-4">
        <Text fw={500}>Transaction Summary</Text>

        {loading || year == null ? (
          <Skeleton height={28} width={90} radius="lg" />
        ) : (
          <Group gap={6} wrap="nowrap" align="center">
            <HiCalendarDateRange size={16} style={{ opacity: 0.55 }} />
            <Text size="xs" fw={500}>
              {yearStr}
            </Text>
          </Group>
        )}
      </div>

      {loading ? (
        <Skeleton height={280} radius="sm" />
      ) : (
        <BarChart
          h={280}
          data={chartData}
          dataKey="month"
          type="stacked"
          series={[
            { name: "completed", label: "Completed", color: "#933503" },
            { name: "pending", label: "Pending", color: "#E88A58" },
            { name: "rejected", label: "Rejected", color: "gray.3" },
          ]}
          withLegend
          legendProps={{ verticalAlign: "bottom" }}
          yAxisLabel="Transactions"
        />
      )}
    </Card>
  );
}
