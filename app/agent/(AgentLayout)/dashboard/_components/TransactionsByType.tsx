"use client";

import { Group, Stack, Select, Text } from "@mantine/core";
import { FilterIcon } from "lucide-react";
import { HiCalendarDateRange } from "react-icons/hi2";
import dynamic from "next/dynamic";
import SectionHeader from "@/app/(customer)/_components/dashboard/SectionHeader";

const DonutChart = dynamic(
  () => import("@mantine/charts").then((m) => m.DonutChart),
  { ssr: false }
);

const data = [
  { name: "Buy FX", value: 60, color: "gray.7" },
  { name: "PTA", value: 30, color: "gray.4" },
  { name: "BTA", value: 10, color: "gray.1" },
];

const colors: Record<string, string> = {
  "Buy FX": "bg-gray-700",
  PTA: "bg-gray-400",
  BTA: "bg-gray-200",
};

export function TransactionsByType() {
  const icon = <HiCalendarDateRange size={16} />;
  const filterIcon = <FilterIcon size={16} />;

  return (
    <div className="flex flex-col rounded-2xl bg-[#FAFAFA] p-2 shadow-sm">
      <SectionHeader
        title="Transactions by type"
        action={
          <Group gap="xs">
            <Select
              size="xs"
              w={100}
              data={["Buy Fx", "Sell Fx", "All"]}
              defaultValue="Buy Fx"
              rightSection={filterIcon}
              rightSectionPointerEvents="none"
              radius="lg"
            />
            <Select
              size="xs"
              w={120}
              data={["Last 7 Days", "Last 30 Days", "Last 90 Days"]}
              defaultValue="Last 30 Days"
              rightSection={icon}
              rightSectionPointerEvents="none"
              radius="lg"
            />
          </Group>
        }
      />
      <div className="grid grid-cols-[2fr_1fr] gap-4">
        <Group justify="center">
          <DonutChart
            data={data}
            size={200}
            thickness={30}
            withLabelsLine={false}
            withTooltip
            tooltipDataSource="segment"
          />
        </Group>
        <Stack gap="sm" mt="md">
          {data.map((item) => (
            <Group key={item.name} gap="xs">
              <div className={`w-3 h-3 rounded-full ${colors[item.name]}`} />
              <Text size="sm">{item.name}</Text>
              <Text size="sm" c="dimmed">
                {item.value}%
              </Text>
            </Group>
          ))}
        </Stack>
      </div>
    </div>
  );
}
