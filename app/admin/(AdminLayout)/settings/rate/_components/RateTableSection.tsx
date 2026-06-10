"use client";

import { useMemo, useState } from "react";
import { Group, Text, TextInput, Button, Tabs } from "@mantine/core";
import { Search, Upload, Plus } from "lucide-react";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import AdminTabButton from "@/app/admin/_components/AdminTabButton";
import { CustomButton } from "@/app/admin/_components/CustomButton";
import RowActionIcon from "@/app/admin/_components/RowActionIcon";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { useRouter } from "next/navigation";
import { adminRoutes } from "@/lib/adminRoutes";
import { useDebouncedValue } from "@mantine/hooks";
import { useRates, type RateListItem } from "../hooks/useRates";
import { useGetExportData } from "@/app/_lib/api/hooks";
import { adminApi } from "@/app/admin/_services/admin-api";
import { notifications } from "@mantine/notifications";
import type { ApiError, ApiResponse } from "@/app/_lib/api/client";
import { toSentenceCase } from "@/app/utils/helper/toSentence";

const headers = [
  { label: "Date and time", key: "dateTime" },
  { label: "Currency pair", key: "currencyPair" },
  { label: "We buy at", key: "buyAt" },
  { label: "We sell at", key: "sellAt" },
  { label: "Status", key: "status" },
  { label: "Last updated", key: "lastUpdated" },
  { label: "Action", key: "action" },
];

const PAGE_SIZE = 5;

type RateTab = "all" | "active" | "pending_approval" | "scheduled" | "expired";

const TABS: { value: RateTab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "pending_approval", label: "Pending Approval" },
  { value: "scheduled", label: "Scheduled" },
  { value: "expired", label: "Expired" },
];

function getEmptyState(tab: RateTab) {
  if (tab === "all") return { title: "No Rates Available", message: "No rates have been created yet." };
  const label = TABS.find((t) => t.value === tab)?.label ?? tab;
  return {
    title: `No ${label} Rates Available`,
    message: `You currently don't have any ${label.toLowerCase()} rates available yet.`,
  };
}

function renderDateTimeCell(value: string) {
  const [date = "--", time = "--"] = value?.split("\n") ?? [];
  return (
    <div>
      <Text size="sm">{date}</Text>
      <Text size="xs" c="dimmed">
        {time}
      </Text>
    </div>
  );
}

export default function RateTableSection() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<RateTab>("all");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 350);

  const { title: emptyTitle, message: emptyMessage } = getEmptyState(activeTab);

  const apiStatus = activeTab === "all" ? undefined : activeTab;

  const queryParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      search: debouncedSearch.trim() || undefined,
      status: apiStatus,
    }),
    [debouncedSearch, page, apiStatus],
  );

  const { rates, isLoading, totalPages } = useRates(queryParams);

  const exportRatesMutation = useGetExportData(
    () =>
      adminApi.rate.export({
        search: debouncedSearch.trim() || undefined,
        status: apiStatus,
      }),
    {
      onSuccess: (csvBlob) => {
        const objectUrl = URL.createObjectURL(csvBlob);
        const link = document.createElement("a");
        const dateStamp = new Date().toISOString().slice(0, 10);
        link.href = objectUrl;
        link.download = `exchange-rates-${dateStamp}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(objectUrl);
      },
      onError: (error) => {
        const apiResponse = (error as unknown as ApiError).data as ApiResponse;
        notifications.show({
          title: "Export Rates Failed",
          message:
            apiResponse?.error?.message ??
            error.message ??
            "Unable to export rates at the moment. Please try again.",
          color: "red",
        });
      },
    },
  );

  const pagination = {
    page,
    totalPages,
    onNext: () => setPage((p) => Math.min(p + 1, totalPages)),
    onPrevious: () => setPage((p) => Math.max(p - 1, 1)),
    onPageChange: setPage,
  };

  const renderRow = (item: RateListItem) => [
    <div key="dateTime">{renderDateTimeCell(item.dateTime)}</div>,
    <Text key="currencyPair" size="sm" fw={500}>
      {item.currencyPair}
    </Text>,
    <Text key="buyAt" size="sm">
      {item.buyAt}
    </Text>,
    <Text key="sellAt" size="sm">
      {item.sellAt}
    </Text>,
    <div key="status">
      <StatusBadge status={toSentenceCase(item.status)} size="md" />
    </div>,
    <div key="lastUpdated">{renderDateTimeCell(item.lastUpdated)}</div>,
    <RowActionIcon
      key="action"
      onClick={() => {
        if (!item.id) return;
        router.push(adminRoutes.adminSettingsRateDetails(item.id));
      }}
    />,
  ];

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <Group justify="space-between" mb="md">
        <div className="flex flex-wrap items-center gap-4">
          <h2 className="text-lg font-semibold">All Rates</h2>
          <TextInput
            placeholder="Enter keyword"
            leftSection={<Search size={16} />}
            value={search}
            onChange={(e) => {
              setSearch(e.currentTarget.value);
              setPage(1);
            }}
            radius="xl"
            w={320}
            className="min-w-50 flex-1"
          />
        </div>

        <Group gap="sm" className="flex-wrap">
          <Button
            variant="outline"
            radius="xl"
            leftSection={<Upload size={16} />}
            color="orange"
            onClick={() => exportRatesMutation.mutate()}
            loading={exportRatesMutation.isPending}
            disabled={exportRatesMutation.isPending}
          >
            Export
          </Button>

          <CustomButton
            buttonType="primary"
            onClick={() => router.push(adminRoutes.adminSettingsRateCreate())}
            rightSection={<Plus size={16} />}
          >
            Add New Rate
          </CustomButton>
        </Group>
      </Group>

      <Tabs
        className="mt-4!"
        color="orange"
        value={activeTab}
        onChange={(value) => {
          setActiveTab((value as RateTab) ?? "all");
          setPage(1);
        }}
      >
        <Tabs.List className="mb-4 border-0! before:content-none!">
          {TABS.map((tab) => (
            <AdminTabButton key={tab.value} value={tab.value}>
              {tab.label}
            </AdminTabButton>
          ))}
        </Tabs.List>

        {TABS.map((tab) => (
          <Tabs.Panel key={tab.value} value={tab.value}>
            <DynamicTableSection
              headers={headers}
              data={rates}
              loading={isLoading}
              renderItems={renderRow}
              emptyTitle={emptyTitle}
              emptyMessage={emptyMessage}
              pagination={pagination}
            />
          </Tabs.Panel>
        ))}
      </Tabs>
    </div>
  );
}
