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

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const RANGE_LABELS: Record<string, string> = {
  last_7_days:    "Last 7 days",
  last_30_days:   "Last 30 days",
  last_90_days:   "Last 90 days",
  last_6_months:  "Last 6 months",
  last_12_months: "Last 12 months",
};

function buildPeriodLabel(
  year: number | null,
  month: number | null,
  rangePreset: string | null
): string | null {
  if (rangePreset) return RANGE_LABELS[rangePreset] ?? rangePreset.replaceAll("_", " ");
  if (month != null && year != null) return `${MONTH_NAMES[month - 1]} ${year}`;
  if (month != null) return MONTH_NAMES[month - 1] ?? null;
  if (year != null) return String(year);
  return null;
}

export function TransactionSummary({
  year,
  month,
  rangePreset,
  chartData,
  loading = false,
}: {
  year: number | null;
  month: number | null;
  rangePreset: string | null;
  chartData: TransactionSummaryChartRow[];
  loading?: boolean;
}) {
  const periodLabel = buildPeriodLabel(year, month, rangePreset);

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
