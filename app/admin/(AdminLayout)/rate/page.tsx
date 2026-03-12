"use client";

import { useState, useMemo } from "react";
import { Group, Text, TextInput, Button } from "@mantine/core";
import { Tabs } from "@mantine/core";
import { Search, Filter, Upload, Plus, Coins } from "lucide-react";
import StatCard from "@/app/admin/_components/StatCard";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import AdminTabButton from "@/app/admin/_components/AdminTabButton";
import { CustomButton } from "@/app/admin/_components/CustomButton";
import RowActionIcon from "../../_components/RowActionIcon";
import { useRouter } from "next/navigation";

/* --------------------------------------------
Types
--------------------------------------------- */
interface RateItem {
  id: string;
  dateTime: string;
  currencyPair: string;
  buyAt: string;
  sellAt: string;
  lastUpdated: string;
}

/* --------------------------------------------
Mock Data
--------------------------------------------- */
const activeRatesData: RateItem[] = [
  {
    id: "1",
    dateTime: "2025-09-15\n9.00 AM",
    currencyPair: "USD- NGN",
    buyAt: "₦1450",
    sellAt: "₦1750",
    lastUpdated: "2025-09-25\n9.00 AM",
  },
  {
    id: "2",
    dateTime: "2025-09-15\n9.00 AM",
    currencyPair: "GPB-NGN",
    buyAt: "₦1750",
    sellAt: "₦1600",
    lastUpdated: "2025-09-19\n4.00 PM",
  },
  {
    id: "3",
    dateTime: "2025-09-15\n9.00 AM",
    currencyPair: "JPY-NGN",
    buyAt: "₦1900",
    sellAt: "₦2050",
    lastUpdated: "2025-09-15\n9.00 AM",
  },
  {
    id: "4",
    dateTime: "2025-09-15\n9.00 AM",
    currencyPair: "CAD-NGN",
    buyAt: "₦1200",
    sellAt: "₦1400",
    lastUpdated: "2025-09-20\n10.00 AM",
  },
  {
    id: "5",
    dateTime: "2025-09-15\n9.00 AM",
    currencyPair: "CNY-NGN",
    buyAt: "₦200",
    sellAt: "₦250",
    lastUpdated: "2025-09-18\n2.00 PM",
  },
  {
    id: "6",
    dateTime: "2025-09-15\n9.00 AM",
    currencyPair: "ZAR-NGN",
    buyAt: "₦80",
    sellAt: "₦100",
    lastUpdated: "2025-09-22\n11.00 AM",
  },
];

const scheduleRatesData: RateItem[] = [
  {
    id: "7",
    dateTime: "2025-09-20\n10.00 AM",
    currencyPair: "EUR-NGN",
    buyAt: "₦1600",
    sellAt: "₦1800",
    lastUpdated: "2025-09-20\n10.00 AM",
  },
  {
    id: "8",
    dateTime: "2025-09-25\n2.00 PM",
    currencyPair: "AUD-NGN",
    buyAt: "₦950",
    sellAt: "₦1100",
    lastUpdated: "2025-09-25\n2.00 PM",
  },
];

/* --------------------------------------------
Component
--------------------------------------------- */
export default function RateManagementPage() {
  const [activeTab, setActiveTab] = useState<string>("active");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const pageSize = 5;
  const router = useRouter();
  // Get current data based on active tab
  const currentData = useMemo(() => {
    return activeTab === "active" ? activeRatesData : scheduleRatesData;
  }, [activeTab]);

  // Filter data based on search
  const filteredData = useMemo(() => {
    return currentData.filter((item) => {
      const matchesSearch =
        item.currencyPair.toLowerCase().includes(search.toLowerCase()) ||
        item.buyAt.toLowerCase().includes(search.toLowerCase()) ||
        item.sellAt.toLowerCase().includes(search.toLowerCase());

      return matchesSearch;
    });
  }, [search, currentData]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [page, filteredData]);

  // Table headers
  const headers = [
    { label: "Date and time", key: "dateTime" },
    { label: "Currency pair", key: "currencyPair" },
    { label: "We buy at", key: "buyAt" },
    { label: "We sell at", key: "sellAt" },
    { label: "Last updated", key: "lastUpdated" },
    { label: "Action", key: "action" },
  ];

  // Row renderer
  const renderRow = (item: RateItem) => [
    // Date and time
    <div key="dateTime">
      <Text size="sm">{item.dateTime.split("\n")[0]}</Text>
      <Text size="xs" c="dimmed">
        {item.dateTime.split("\n")[1]}
      </Text>
    </div>,

    // Currency pair
    <Text key="currencyPair" size="sm" fw={500}>
      {item.currencyPair}
    </Text>,

    // We buy at
    <Text key="buyAt" size="sm">
      {item.buyAt}
    </Text>,

    // We sell at
    <Text key="sellAt" size="sm">
      {item.sellAt}
    </Text>,

    // Last updated
    <div key="lastUpdated">
      <Text size="sm">{item.lastUpdated.split("\n")[0]}</Text>
      <Text size="xs" c="dimmed">
        {item.lastUpdated.split("\n")[1]}
      </Text>
    </div>,

    // Action
    <RowActionIcon
      key="action"
      onClick={() => {
        // Handle action click
        router.push(`/admin/rate/${item.id}`);
      }}
    />,
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="w-full rounded-xl bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            title="All Rate"
            value={12}
            icon={<Coins className="h-5 w-5 text-orange-600" />}
            iconBg="bg-orange-100"
          />

          <StatCard
            title="Active Rate"
            value={10}
            icon={<Coins className="h-5 w-5 text-green-600" />}
            iconBg="bg-green-100"
          />

          <StatCard
            title="Schedule Rate"
            value={2}
            icon={<Coins className="h-5 w-5 text-pink-600" />}
            iconBg="bg-pink-100"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="rounded-2xl bg-white shadow-sm p-5">
        {/* Header Controls */}
        <Group justify="space-between" mb="md">
          <div className="flex items-center gap-4 flex-wrap">
            <h2 className="text-lg font-semibold">All Rate</h2>

            <TextInput
              placeholder="Enter keyword"
              leftSection={<Search size={16} />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              radius="xl"
              w={320}
              className="flex-1 min-w-[200px]"
            />
          </div>

          <Group gap="sm" className="flex-wrap">
            <Button
              variant="default"
              radius="xl"
              leftSection={<Filter size={16} />}
            >
              Filter By
            </Button>

            <Button
              variant="outline"
              radius="xl"
              leftSection={<Upload size={16} />}
              color="orange"
            >
              Export
            </Button>

            <CustomButton
              buttonType="primary"
              onClick={() => router.push("/admin/rate/create")}
              rightSection={<Plus size={16} />}
            >
              Add New Rate
            </CustomButton>
          </Group>
        </Group>

        {/* Tabs */}
        <Tabs
          className="mt-4!"
          color="orange"
          value={activeTab}
          onChange={(value) => {
            setActiveTab(value || "active");
            setPage(1); // Reset to first page when switching tabs
          }}
        >
          <Tabs.List className="mb-4 border-0! before:content-none!">
            <AdminTabButton value="active">Active</AdminTabButton>
            <AdminTabButton value="schedule">Schedule</AdminTabButton>
          </Tabs.List>

          <Tabs.Panel value="active">
            <DynamicTableSection
              headers={headers}
              data={paginatedData}
              loading={false}
              renderItems={renderRow}
              emptyTitle="No Active Rates Available"
              emptyMessage="You currently don't have any active rates available yet. Check back later."
              pagination={{
                page,
                totalPages,
                onNext: () => setPage((p) => Math.min(p + 1, totalPages)),
                onPrevious: () => setPage((p) => Math.max(p - 1, 1)),
                onPageChange: setPage,
              }}
            />
          </Tabs.Panel>

          <Tabs.Panel value="schedule">
            <DynamicTableSection
              headers={headers}
              data={paginatedData}
              loading={false}
              renderItems={renderRow}
              emptyTitle="No Scheduled Rates Available"
              emptyMessage="You currently don't have any scheduled rates available yet. Check back later."
              pagination={{
                page,
                totalPages,
                onNext: () => setPage((p) => Math.min(p + 1, totalPages)),
                onPrevious: () => setPage((p) => Math.max(p - 1, 1)),
                onPageChange: setPage,
              }}
            />
          </Tabs.Panel>
        </Tabs>
      </div>
    </div>
  );
}
