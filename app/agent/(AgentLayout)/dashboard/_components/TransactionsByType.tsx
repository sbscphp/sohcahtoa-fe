"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Box, Group, Select, Text } from "@mantine/core";
import { ListFilter } from "lucide-react";
import dynamic from "next/dynamic";
import type { PieChartCell } from "@mantine/charts";
import { getTransactionTypeLabel } from "@/app/(customer)/_lib/mock-transactions";
import { useFetchData } from "@/app/_lib/api/hooks";
import { agentApi } from "@/app/agent/_services/agent-api";
import type {
  AgentDashboardRange,
  AgentDashboardTransactionsByTypeResponse,
} from "@/app/_lib/api/types";
import {
  filterAndPrepareSegments,
  type TransactionsByTypeGroup,
} from "@/app/agent/(AgentLayout)/dashboard/_utils/transactions-by-type-groups";

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

const FLOW_OPTIONS: Array<{ value: TransactionsByTypeGroup; label: string }> = [
  { value: "buy", label: "Buy FX" },
  { value: "sell", label: "Sell FX" },
  { value: "receive", label: "Receive FX" },
];

const PIE_COLORS = [
  "#232323",
  "#B2AFAF",
  "#8F8B8B",
  "#F97316",
  "#3B82F6",
  "#6B7280",
];

/** Hide slice label below this share to avoid stacked/overlapping text */
const MIN_LABEL_PERCENT = 0.02;

const pillSelectStyles = {
  input: {
    borderColor: "#CCCACA",
    borderRadius: 9999,
    minHeight: "2.5rem",
    paddingLeft: "1rem",
    paddingRight: "2rem",
    fontFamily: "var(--mantine-font-family)",
    fontWeight: 500,
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    color: "#4D4B4B",
  },
} as const;

function formatNgn(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

type PieDatum = {
  name: string;
  value: number;
  color: string;
  segmentCount: number;
  volumeNgn: number;
  friendlyLabel: string;
};

function hexToRgb(hex: string): [number, number, number] | null {
  const h = hex.replace("#", "").slice(0, 6);
  if (h.length !== 6 || Number.isNaN(Number.parseInt(h, 16))) return null;
  const n = Number.parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function labelFillForSlice(fillHex?: string): string {
  if (!fillHex?.startsWith("#")) return "#FFFFFF";
  const rgb = hexToRgb(fillHex);
  if (!rgb) return "#FFFFFF";
  const [r, g, b] = rgb;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? "#1a1a1a" : "#FFFFFF";
}

/** Bold % inside slice; skip tiny slices; contrast based on fill color */
function VolumePieLabel(props: {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
  payload?: PieDatum;
}) {
  const {
    cx = 0,
    cy = 0,
    midAngle = 0,
    innerRadius = 0,
    outerRadius = 0,
    percent = 0,
    payload,
  } = props;

  if (!payload || percent < MIN_LABEL_PERCENT) return null;

  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.52;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const fill = labelFillForSlice(payload.color);
  const pct = Math.round(percent * 100);

  return (
    <text
      x={x}
      y={y}
      fill={fill}
      textAnchor="middle"
      dominantBaseline="central"
      style={{
        fontSize: "11px",
        fontWeight: 700,
        fontFamily: "var(--mantine-font-family)",
      }}
    >
      {`${pct}%`}
    </text>
  );
}

function TransactionsPieTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: PieDatum }>;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;

  const line = `${row.segmentCount.toLocaleString()} ${row.friendlyLabel} | ${formatNgn(row.volumeNgn)}`;

  return (
    <Box
      px="sm"
      py="xs"
      style={{
        background: "#FFFFFF",
        borderRadius: 8,
        boxShadow:
          "0px 12px 16px -4px rgba(16, 24, 40, 0.08), 0px 4px 6px -2px rgba(16, 24, 40, 0.03)",
        maxWidth: "max(100%, 12rem)",
      }}
    >
      <Text size="sm" c="#344054" lh={1.43}>
        {line}
      </Text>
    </Box>
  );
}

export function TransactionsByType() {
  const [range, setRange] = useState<AgentDashboardRange>("last_30_days");
  const [flow, setFlow] = useState<TransactionsByTypeGroup>("buy");
  const filterIcon = <ListFilter size={14} strokeWidth={2} className="text-[#4D4B4B]" />;

  const chartWrapRef = useRef<HTMLDivElement>(null);
  const [chartSize, setChartSize] = useState(220);

  useEffect(() => {
    const el = chartWrapRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;

    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      const next = Math.min(Math.max(Math.floor(w), 180), 280);
      setChartSize(next > 0 ? next : 220);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { data, isLoading } = useFetchData<AgentDashboardTransactionsByTypeResponse>(
    ["agent", "dashboard", "transactions-by-type", range, flow],
    () => agentApi.dashboard.transactionsByType(range, flow),
    true
  );

  const dashboardData = data?.data;

  const prepared = useMemo(() => {
    const segments = dashboardData?.segments ?? [];
    return filterAndPrepareSegments(segments, flow);
  }, [dashboardData?.segments, flow]);

  const chartData: PieDatum[] = useMemo(
    () =>
      prepared.map((s, index) => ({
        name: s.transactionType,
        value: s.totalAmount,
        color: PIE_COLORS[index % PIE_COLORS.length],
        segmentCount: s.count,
        volumeNgn: s.totalAmount,
        friendlyLabel: getTransactionTypeLabel(s.transactionType),
      })),
    [prepared]
  );

  const chartSection = (() => {
    if (isLoading) {
      return (
        <Text size="sm" c="dimmed" ta="center" py="xl">
          Loading chart...
        </Text>
      );
    }
    if (chartData.length === 0) {
      return (
        <Text size="sm" c="dimmed" ta="center" py="xl">
          No volume for this selection (USD amounts only)
        </Text>
      );
    }
    return (
      <>
        <div
          ref={chartWrapRef}
          className="mx-auto flex w-full max-w-[min(100%,22rem)] justify-center px-1"
        >
          <PieChart
            data={chartData as PieChartCell[]}
            size={chartSize}
            withLabels={false}
            pieProps={{
              label: VolumePieLabel,
            }}
            withTooltip
            tooltipDataSource="segment"
            tooltipProps={{
              content: TransactionsPieTooltip,
              animationDuration: 150,
            }}
            withLabelsLine={false}
            paddingAngle={0}
            strokeWidth={0}
          />
        </div>
        {/* <Group gap="xl" justify="center" wrap="wrap" className="w-full">
          <Text size="sm" fw={600} c="#48464E">
            Total volume:{" "}
            {prepared.reduce((a, s) => a + s.totalAmount, 0).toLocaleString()}
          </Text>
          <Text size="sm" c="dimmed">
            Transactions:{" "}
            {prepared.reduce((a, s) => a + s.count, 0).toLocaleString()}
          </Text>
        </Group> */}
      </>
    );
  })();

  return (
    <div className="flex w-full flex-col gap-8 rounded-2xl bg-[#FAFAFA] p-4 shadow-sm">
      <Group justify="space-between" gap="md" align="start" wrap="wrap">
        <p className="text-body-heading-300 font-medium leading-snug">
          <span className="block">Transactions</span>
          <span className="block">By Type</span>
        </p>
        <Box className="flex min-w-0 w-full max-w-full flex-1 flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          <Select
            size="sm"
            data={FLOW_OPTIONS}
            value={flow}
            onChange={(v) => {
              if (v) setFlow(v as TransactionsByTypeGroup);
            }}
            rightSection={filterIcon}
            rightSectionPointerEvents="none"
            styles={pillSelectStyles}
            className="w-full min-w-0 sm:w-auto sm:min-w-[5.8rem]"
          />
          <Select
            size="sm"
            data={RANGE_OPTIONS}
            value={range}
            onChange={(value) => {
              if (value) setRange(value as AgentDashboardRange);
            }}
            rightSection={filterIcon}
            rightSectionPointerEvents="none"
            styles={pillSelectStyles}
            className="w-full min-w-0 sm:w-auto sm:min-w-30"
          />
        </Box>
      </Group>

      <div className="flex w-full flex-col items-center justify-center gap-10">
        {chartSection}
      </div>
    </div>
  );
}
