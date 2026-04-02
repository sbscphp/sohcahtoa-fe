"use client";

import { useMemo, useState } from "react";
import { Button, Group, Select, Text, TextInput } from "@mantine/core";
import { ListFilter, Search, Upload } from "lucide-react";
import { useDebouncedValue } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useGetExportData } from "@/app/_lib/api/hooks";
import type { ApiError, ApiResponse } from "@/app/_lib/api/client";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import { adminApi } from "@/app/admin/_services/admin-api";
import {
  usePickupStationRequests,
  type StationPickup,
} from "../../hooks/usePickupStationRequests";

const PICKUPS_PAGE_SIZE = 6;

export default function AllPickupsSection({
  pickUpStationId,
}: {
  pickUpStationId: string;
}) {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 350);
  const [statusFilter, setStatusFilter] = useState("Filter By");
  const [page, setPage] = useState(1);

  const apiStatus = useMemo(() => {
    if (statusFilter === "Filter By" || statusFilter === "All") return undefined;
    return statusFilter;
  }, [statusFilter]);

  const {
    pickups,
    total,
    totalPages,
    isLoading,
    isFetching,
  } = usePickupStationRequests(pickUpStationId, {
    page,
    limit: PICKUPS_PAGE_SIZE,
    search: debouncedSearch || undefined,
    status: apiStatus,
  });

  const exportRequestsMutation = useGetExportData(
    () =>
      adminApi.outlet.pickupStations.requestsExport(pickUpStationId, {
        search: debouncedSearch || undefined,
        status: apiStatus,
      }),
    {
      onSuccess: (csvBlob) => {
        const objectUrl = URL.createObjectURL(csvBlob);
        const link = document.createElement("a");
        const dateStamp = new Date().toISOString().slice(0, 10);
        link.href = objectUrl;
        link.download = `pickup-station-requests-${pickUpStationId}-${dateStamp}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(objectUrl);
      },
      onError: (error) => {
        const apiResponse = (error as unknown as ApiError).data as ApiResponse;
        notifications.show({
          title: "Export Pick-up Requests Failed",
          message:
            apiResponse?.error?.message ??
            (error as Error).message ??
            "Unable to export pick-up requests at the moment. Please try again.",
          color: "red",
        });
      },
    }
  );

  const headers = [
    { label: "Customer", key: "customer" },
    { label: "Contact", key: "contact" },
    { label: "Date & Time", key: "dateAndTime" },
    { label: "Type", key: "type" },
    { label: "Status", key: "status" },
  ];

  const renderPickupRow = (pickup: StationPickup) => [
    <div key="customer">
      <Text fw={500} size="sm">
        {pickup.customerName}
      </Text>
      <Text size="xs" c="dimmed">
        ID:{pickup.customerCode}
      </Text>
    </div>,
    <div key="contact">
      <Text fw={500} size="sm">
        {pickup.phoneNumber}
      </Text>
      <Text size="xs" c="dimmed">
        {pickup.email}
      </Text>
    </div>,
    <div key="dateAndTime">
      <Text fw={500} size="sm">
        {pickup.date}
      </Text>
      <Text size="xs" c="dimmed">
        {pickup.time}
      </Text>
    </div>,
    <Text key="type" size="sm">
      {pickup.type}
    </Text>,
    <StatusBadge
      key="status"
      status={pickup.status}
      color={pickup.status === "Picked Up" ? "#2563EB" : "#B54708"}
    />,
  ];

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <Group justify="space-between" mb="md" wrap="wrap">
        <Group>
          <Text fw={600} size="lg">
            All Pick-ups ({total})
          </Text>
          <TextInput
            placeholder="Enter keyword"
            leftSection={<Search size={16} color="#DD4F05" />}
            value={search}
            onChange={(event) => {
              setSearch(event.currentTarget.value);
              setPage(1);
            }}
            w={320}
            radius="xl"
          />
        </Group>

        <Group>
          <Select
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value ?? "Filter By");
              setPage(1);
            }}
            data={["Filter By", "All", "Picked Up", "Pending"]}
            radius="xl"
            w={120}
            rightSection={<ListFilter size={16} />}
          />
          <Button
            variant="outline"
            color="#DD4F05"
            radius="xl"
            rightSection={<Upload size={16} />}
            onClick={() => exportRequestsMutation.mutate()}
            loading={exportRequestsMutation.isPending}
            disabled={exportRequestsMutation.isPending}
          >
            Export
          </Button>
        </Group>
      </Group>

      <DynamicTableSection
        headers={headers}
        data={pickups}
        loading={isLoading || isFetching}
        renderItems={renderPickupRow}
        emptyTitle="No Pick-ups Found"
        emptyMessage="No pick-up records match your search or filter."
        pagination={{
          page,
          totalPages,
          onNext: () => setPage((current) => Math.min(current + 1, totalPages)),
          onPrevious: () => setPage((current) => Math.max(current - 1, 1)),
          onPageChange: setPage,
        }}
      />
    </div>
  );
}
