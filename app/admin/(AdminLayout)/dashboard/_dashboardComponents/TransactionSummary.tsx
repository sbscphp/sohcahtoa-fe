"use client";

import { Card, Text, Select } from "@mantine/core";
import { FilterIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { HiCalendarDateRange } from "react-icons/hi2";

// ✅ Disable SSR for BarChart
const BarChart = dynamic(
  () => import("@mantine/charts").then((m) => m.BarChart),
  { ssr: false }
);

const data = [
  { month: "Jan", completed: 600, pending: 800, rejected: 300 },
  { month: "Feb", completed: 700, pending: 1000, rejected: 350 },
  { month: "Mar", completed: 450, pending: 650, rejected: 250 },
  { month: "Apr", completed: 600, pending: 850, rejected: 300 },
  { month: "May", completed: 480, pending: 750, rejected: 280 },
  { month: "Jun", completed: 650, pending: 950, rejected: 360 },
  { month: "Jul", completed: 560, pending: 800, rejected: 310 },
  { month: "Aug", completed: 590, pending: 840, rejected: 320 },
  { month: "Sep", completed: 580, pending: 820, rejected: 300 },
  { month: "Oct", completed: 620, pending: 880, rejected: 340 },
  { month: "Nov", completed: 690, pending: 980, rejected: 370 },
  { month: "Dec", completed: 540, pending: 760, rejected: 290 },
];

export function TransactionSummary() {
    const icon = <HiCalendarDateRange size={16} />;
    const icon2 = <FilterIcon size={16} />;
  return (
    <Card radius="md" padding="md" withBorder>
      <div className="flex items-center justify-between mb-4">
        <Text fw={500}>Transaction Summary</Text>

        <div className="flex gap-3">
          <Select
            size="xs"
            w={90}
            rightSection={icon}
            rightSectionPointerEvents="none"
            radius="lg"
            data={["2025", "2024"]}
            defaultValue="2025"
            
          />
          <Select
            size="xs"
            w={90}
            rightSection={icon2}
            rightSectionPointerEvents="none"
            data={["Filter"]}
            defaultValue="Filter"
            radius="lg"
          />
        </div>
      </div>

      <BarChart
        h={280}
        data={data}
        dataKey="month"
        type="stacked"
        series={[
          { name: "completed", label: "Completed", color: "#933503" },
          { name: "pending", label: "Pending", color: "#E88A58" },
          { name: "rejected", label: "Rejected", color: "gray.3" },
        ]}
        withLegend
        legendProps={{ verticalAlign: "bottom" }}
        yAxisLabel="Amount (USD)"
      />
    </Card>
  );
}
