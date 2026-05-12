"use client";

import { useMemo, useState } from "react";
import { Group, Text, TextInput, Button, Tabs } from "@mantine/core";
import { Search, Upload, Plus } from "lucide-react";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import AdminTabButton from "@/app/admin/_components/AdminTabButton";
import { CustomButton } from "@/app/admin/_components/CustomButton";
import RowActionIcon from "@/app/admin/_components/RowActionIcon";
import { useRouter } from "next/navigation";
import { adminRoutes } from "@/lib/adminRoutes";
import { useDebouncedValue } from "@mantine/hooks";
import { useRates, type RateListItem } from "../hooks/useRates";
import { useGetExportData } from "@/app/_lib/api/hooks";
import { adminApi } from "@/app/admin/_services/admin-api";
import { notifications } from "@mantine/notifications";
import type { ApiError, ApiResponse } from "@/app/_lib/api/client";

const headers = [
  { label: "Date and time", key: "dateTime" },
  { label: "Currency pair", key: "currencyPair" },
  { label: "We buy at", key: "buyAt" },
  { label: "We sell at", key: "sellAt" },
  { label: "Last updated", key: "lastUpdated" },
  { label: "Action", key: "action" },
];

const PAGE_SIZE = 5;
type RateStatusValue = "active" | "scheduled";
type RateTab = RateStatusValue;

function getStatusLabel(status: RateStatusValue) {
  return status.charAt(0).toUpperCase() + status.slice(1);
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
  const [activeTab, setActiveTab] = useState<RateTab>("active");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 350);
  const status = activeTab;
  const statusLabel = getStatusLabel(status);
  const emptyTitle = `No ${statusLabel} Rates Available`;
  const emptyMessage = `You currently don't have any ${status.toLowerCase()} rates available yet. Check back later.`;

  const queryParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      search: debouncedSearch.trim() || undefined,
      status,
    }),
    [debouncedSearch, page, status],
  );

  const { rates, isLoading, totalPages } = useRates(queryParams);
  const exportRatesMutation = useGetExportData(
    () =>
      adminApi.rate.export({
        search: debouncedSearch.trim() || undefined,
        status,
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
    <div key="lastUpdated">{renderDateTimeCell(item.lastUpdated)}</div>,
    <RowActionIcon
      key="action"
      onClick={() => {
        if (!item.id) return;
        router.push(adminRoutes.adminRateDetails(item.id));
      }}
    />,
  ];

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <Group justify="space-between" mb="md">
        <div className="flex flex-wrap items-center gap-4">
          <h2 className="text-lg font-semibold">All Rate</h2>
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
            onClick={() => router.push(adminRoutes.adminRateCreate())}
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
          setActiveTab((value as RateTab) || "active");
          setPage(1);
        }}
      >
        <Tabs.List className="mb-4 border-0! before:content-none!">
          <AdminTabButton value="active">Active</AdminTabButton>
          {/* <AdminTabButton value="deactivated">Deactivated</AdminTabButton>
          <AdminTabButton value="expired">Expired</AdminTabButton> */}
          <AdminTabButton value="scheduled">Scheduled</AdminTabButton>
        </Tabs.List>

        <Tabs.Panel value="active">
          <DynamicTableSection
            headers={headers}
            data={rates}
            loading={isLoading}
            renderItems={renderRow}
            emptyTitle={emptyTitle}
            emptyMessage={emptyMessage}
            pagination={{
              page,
              totalPages,
              onNext: () => setPage((p) => Math.min(p + 1, totalPages)),
              onPrevious: () => setPage((p) => Math.max(p - 1, 1)),
              onPageChange: setPage,
            }}
          />
        </Tabs.Panel>

        <Tabs.Panel value="deactivated">
          <DynamicTableSection
            headers={headers}
            data={rates}
            loading={isLoading}
            renderItems={renderRow}
            emptyTitle={emptyTitle}
            emptyMessage={emptyMessage}
            pagination={{
              page,
              totalPages,
              onNext: () => setPage((p) => Math.min(p + 1, totalPages)),
              onPrevious: () => setPage((p) => Math.max(p - 1, 1)),
              onPageChange: setPage,
            }}
          />
        </Tabs.Panel>

        <Tabs.Panel value="expired">
          <DynamicTableSection
            headers={headers}
            data={rates}
            loading={isLoading}
            renderItems={renderRow}
            emptyTitle={emptyTitle}
            emptyMessage={emptyMessage}
            pagination={{
              page,
              totalPages,
              onNext: () => setPage((p) => Math.min(p + 1, totalPages)),
              onPrevious: () => setPage((p) => Math.max(p - 1, 1)),
              onPageChange: setPage,
            }}
          />
        </Tabs.Panel>

        <Tabs.Panel value="scheduled">
          <DynamicTableSection
            headers={headers}
            data={rates}
            loading={isLoading}
            renderItems={renderRow}
            emptyTitle={emptyTitle}
            emptyMessage={emptyMessage}
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
  );
}
