"use client";

import { useMemo, useState } from "react";
import { Group, Stack, Select, Text } from "@mantine/core";
import { ListFilter } from "lucide-react";
import dynamic from "next/dynamic";
import SectionHeader from "@/app/(customer)/_components/dashboard/SectionHeader";
import { SELECT_WIDTH } from "@/app/agent/utils/constants";
import { useFetchData } from "@/app/_lib/api/hooks";
import { agentApi } from "@/app/agent/_services/agent-api";
import type {
  AgentDashboardRange,
  AgentDashboardTransactionsByTypeResponse,
} from "@/app/_lib/api/types";

const PieChart = dynamic(
  () => import("@mantine/charts").then((m) => m.PieChart),
  { ssr: false },
);

const RANGE_OPTIONS: Array<{ value: AgentDashboardRange; label: string }> = [
  { value: "today", label: "Today" },
  { value: "this_week", label: "This Week" },
  { value: "last_30_days", label: "Last 30 Days" },
  { value: "last_3_months", label: "Last 3 Months" },
  { value: "last_year", label: "Last Year" },
];

const PIE_COLORS = [
  "var(--mantine-color-gray-7)",
  "var(--mantine-color-gray-5)",
  "var(--mantine-color-gray-3)",
  "var(--mantine-color-orange-6)",
  "var(--mantine-color-blue-6)",
];

export function TransactionsByType() {
  const [range, setRange] = useState<AgentDashboardRange>("last_30_days");
  const filterIcon = <ListFilter size={16} />;

  const { data, isLoading } = useFetchData<AgentDashboardTransactionsByTypeResponse>(
    ["agent", "dashboard", "transactions-by-type", range],
    () => agentApi.dashboard.transactionsByType(range),
    true
  );

  const dashboardData = data?.data;
  const segments = dashboardData?.segments ?? [];
  const totalVolume = dashboardData?.totalVolume ?? 0;
  const totalTransactions = dashboardData?.totalTransactionCount ?? 0;

  const chartData = useMemo(
    () =>
      segments.map((segment, index) => ({
        name: segment.transactionType,
        value: segment.totalAmount > 0 ? segment.totalAmount : segment.count,
        color: PIE_COLORS[index % PIE_COLORS.length],
      })),
    [segments]
  );

  return (
    <div className="flex flex-col rounded-2xl bg-[#FAFAFA] p-2 shadow-sm">
      <SectionHeader
        title="Transactions by type"
        action={
          <Group gap="xs" className="w-full sm:w-auto">
            <Select
              size="xs"
              w={SELECT_WIDTH}
              className="w-full sm:w-auto"
              data={RANGE_OPTIONS}
              value={range}
              onChange={(value) => {
                if (value) setRange(value as AgentDashboardRange);
              }}
              rightSection={filterIcon}
              rightSectionPointerEvents="none"
              radius="lg"
            />
          </Group>
        }
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[2fr_1fr]">
        <Group justify="center">
          {chartData.length > 0 ? (
            <PieChart
              data={chartData}
              size={180}
              withLabelsLine={false}
              withTooltip
              tooltipDataSource="segment"
            />
          ) : (
            <Text size="sm" c="dimmed">
              {isLoading ? "Loading chart..." : "No data for selected range"}
            </Text>
          )}
        </Group>
        <Stack gap="sm" mt="md" className="md:mt-2">
          <Text size="sm" fw={600}>
            Total volume: {totalVolume.toLocaleString()}
          </Text>
          <Text size="sm" c="dimmed">
            Transactions: {totalTransactions}
          </Text>
          {segments.map((item, index) => (
            <Group key={item.transactionType} gap="xs" wrap="nowrap">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
              />
              <Text size="sm" className="truncate">
                {item.transactionType}
              </Text>
              <Text size="sm" c="dimmed">
                {item.percentageOfVolume}%
              </Text>
            </Group>
          ))}
        </Stack>
      </div>
    </div>
  );
}
