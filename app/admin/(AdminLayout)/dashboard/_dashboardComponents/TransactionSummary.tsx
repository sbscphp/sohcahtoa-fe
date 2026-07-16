"use client";

import { Card, Text, Group, Skeleton } from "@mantine/core";
import dynamic from "next/dynamic";
import { HiCalendarDateRange } from "react-icons/hi2";
import { buildTransactionSummaryPeriodLabel } from "../mapDashboardData";

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
  startDate,
  endDate,
  rangePreset,
  chartData,
  loading = false,
}: {
  startDate: string | null;
  endDate: string | null;
  rangePreset: string | null;
  chartData: TransactionSummaryChartRow[];
  loading?: boolean;
}) {
  const periodLabel = buildTransactionSummaryPeriodLabel({
    startDate,
    endDate,
    rangePreset,
  });

  return (
    <Card radius="md" padding="md" withBorder>
      <div className="flex items-center justify-between mb-4">
        <Text fw={500}>Transaction Summary</Text>

        {loading ? (
          <Skeleton height={28} width={120} radius="lg" />
        ) : periodLabel ? (
          <Group gap={6} wrap="nowrap" align="center">
            <HiCalendarDateRange size={16} style={{ opacity: 0.55 }} />
            <Text size="xs" fw={500}>
              {periodLabel}
            </Text>
          </Group>
        ) : null}
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
            { name: "rejected", label: "Rejected", color: "var(--color-primary-800)" },
            { name: "pending", label: "Pending", color: "var(--color-primary-100)" },
            { name: "completed", label: "Completed", color: "var(--color-primary-400)" },
          ]}
          withLegend
          legendProps={{ verticalAlign: "bottom" }}
          yAxisLabel="Transactions"
        />
      )}
    </Card>
  );
}
