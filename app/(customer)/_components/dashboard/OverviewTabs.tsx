"use client";

import { Tabs } from "@mantine/core";

type TabItem = { value: string; label: string };

type FxOverviewTabsProps = {
  items: readonly TabItem[];
  value: string;
};

const tabBase =
  "shrink-0 cursor-pointer rounded-full! border px-2.5 py-1.5 text-sm font-normal leading-[120%] transition-colors";
const tabActive = "border! border-primary-100! bg-[#FFF6F1]! text-primary-400!";
const tabInactive = "border! border-[#E4E4E7]! bg-white! text-gray-900! hover:border-gray-300!";

export default function OverviewTabs({ items, value }: FxOverviewTabsProps) {
  return (
    <Tabs.List className="flex flex-1 flex-wrap items-start gap-x-2.5 gap-y-6 border-0 bg-transparent">
      {items.map((tab) => (
        <Tabs.Tab
          key={tab.value}
          value={tab.value}
          className={`${tabBase} ${value === tab.value ? tabActive : tabInactive}`}
        >
          {tab.label}
        </Tabs.Tab>
      ))}
    </Tabs.List>
  );
}
