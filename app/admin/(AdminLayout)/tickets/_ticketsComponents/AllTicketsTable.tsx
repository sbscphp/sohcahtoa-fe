"use client";

import { useMemo, useState } from "react";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import RowActionIcon from "@/app/admin/_components/RowActionIcon";
import { Group, TextInput, Select, Button, Text } from "@mantine/core";
import { ListFilter, Plus, Search, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { adminRoutes } from "@/lib/adminRoutes";
import { useDebouncedValue } from "@mantine/hooks";
import { useTickets, type TicketListItem } from "../hooks/useTickets";
import { useGetExportData } from "@/app/_lib/api/hooks";
import { adminApi } from "@/app/admin/_services/admin-api";
import { notifications } from "@mantine/notifications";
import type { ApiError, ApiResponse } from "@/app/_lib/api/client";

const ticketHeaders = [
  { label: "Incident ID", key: "id" },
  { label: "Customer", key: "customer" },
  { label: "Date", key: "date" },
  { label: "Assigned to", key: "assigned" },
  { label: "Status", key: "status" },
  { label: "Priority", key: "priority" },
  { label: "Action", key: "action" },
];

const priorityColorMap: Record<string, string> = {
  High: "text-red-600",
  Medium: "text-amber-600",
  Low: "text-blue-600",
};

const priorityDotColorMap: Record<string, string> = {
  High: "bg-red-500",
  Medium: "bg-amber-500",
  Low: "bg-blue-500",
};

const PAGE_SIZE = 10;

function toDisplayStatus(value: string): string {
  if (!value) return "--";

  const normalized = value.trim().toLowerCase();
  if (normalized === "in_progress" || normalized === "in-progress") {
    return "In progress";
  }

  return value
    .split("_")
    .map((word) =>
      word ? `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}` : word
    )
    .join(" ");
}

function toDisplayPriority(value: string): string {
  if (!value) return "--";
  const normalized = value.trim().toLowerCase();
  if (normalized === "high" || normalized === "medium" || normalized === "low") {
    return `${normalized.charAt(0).toUpperCase()}${normalized.slice(1)}`;
  }

  return value;
}

function formatDateTime(createdAt: string): { date: string; time: string } {
  if (!createdAt) {
    return { date: "--", time: "--" };
  }

  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) {
    return { date: "--", time: "--" };
  }

  return {
    date: date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    time: date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
  };
}

export default function AllTicketsTable() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("All");
  const [debouncedSearch] = useDebouncedValue(search, 350);
  const [debouncedCategory] = useDebouncedValue(category, 350);

  const queryParams = useMemo(() => {
    const trimmedSearch = debouncedSearch.trim();
    const trimmedCategory = debouncedCategory.trim();

    return {
      page,
      limit: PAGE_SIZE,
      search: trimmedSearch || undefined,
      status: status === "All" ? undefined : status,
      category: trimmedCategory || undefined,
      priority: priority === "All" ? undefined : priority,
    };
  }, [debouncedCategory, debouncedSearch, page, priority, status]);

  const { tickets, isLoading, totalPages } = useTickets(queryParams);
  const exportParams = useMemo(
    () => ({
      search: debouncedSearch.trim() || undefined,
      status: status === "All" ? undefined : status,
      category: debouncedCategory.trim() || undefined,
      priority: priority === "All" ? undefined : priority,
    }),
    [debouncedCategory, debouncedSearch, priority, status]
  );
  const exportTicketsMutation = useGetExportData(
    () => adminApi.tickets.export(exportParams),
    {
      onSuccess: (csvBlob) => {
        const objectUrl = URL.createObjectURL(csvBlob);
        const link = document.createElement("a");
        const dateStamp = new Date().toISOString().slice(0, 10);

        link.href = objectUrl;
        link.download = `tickets-${dateStamp}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(objectUrl);
      },
      onError: (error) => {
        const apiResponse = (error as unknown as ApiError).data as ApiResponse;
        notifications.show({
          title: "Export Tickets Failed",
          message:
            apiResponse?.error?.message ??
            error.message ??
            "Unable to export tickets at the moment. Please try again.",
          color: "red",
        });
      },
    }
  );

  const renderRow = (item: TicketListItem) => {
    const { date, time } = formatDateTime(item.createdAt);
    const displayStatus = toDisplayStatus(item.status);
    const displayPriority = toDisplayPriority(item.priority);

    return [
    <Text key="id" size="sm" fw={500}>
      ID: {item.id}
    </Text>,
    <div key="customer">
      <Text fw={500} size="sm">
        {item.customerName}
      </Text>
      <Text size="xs" c="dimmed">
        {item.customerEmail}
      </Text>
    </div>,
    <div key="date">
      <Text size="sm">{date}</Text>
      <Text size="xs" c="dimmed">
        {time}
      </Text>
    </div>,
    <div key="assigned">
      <Text fw={500} size="sm">
        {item.assignedTo}
      </Text>
      {item.assignedRole && (
        <Text size="xs" c="dimmed">
          {item.assignedRole}
        </Text>
      )}
    </div>,
    <StatusBadge key="status" status={displayStatus} />,
    <div key="priority" className="flex items-center gap-1.5">
      <span
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${priorityDotColorMap[displayPriority] ?? "bg-gray-500"}`}
        aria-hidden
      />
      <Text size="sm" className={priorityColorMap[displayPriority] ?? "text-gray-600"}>
        {displayPriority}
      </Text>
    </div>,
    <RowActionIcon
      key="action"
      onClick={() => router.push(adminRoutes.adminTicketDetails(item.id))}
    />,
  ];
  };

  return (
    <div className="rounded-lg bg-white p-5 shadow-sm">
      <Group justify="space-between" mb="md" wrap="wrap">
        <div className="flex flex-wrap items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900">All Tickets</h2>
          <TextInput
            placeholder="Enter keyword"
            leftSection={<Search size={16} color="#DD4F05" />}
            value={search}
            onChange={(e) => {
              setSearch(e.currentTarget.value);
              setPage(1);
            }}
            w={320}
            radius="xl"
          />
        </div>
        <Group>
          <Select
            value={status}
            onChange={(value) => {
              setStatus(value ?? "All");
              setPage(1);
            }}
            data={["All", "Resolved", "Open", "In progress", "Closed"]}
            placeholder="Status"
            radius="xl"
            w={140}
            rightSection={<ListFilter size={16} />}
          />
          <TextInput
            placeholder="Category"
            value={category}
            onChange={(e) => {
              setCategory(e.currentTarget.value);
              setPage(1);
            }}
            w={140}
            radius="xl"
          />
          <Select
            value={priority}
            onChange={(value) => {
              setPriority(value ?? "All");
              setPage(1);
            }}
            data={["All", "High", "Medium", "Low"]}
            placeholder="Priority"
            radius="xl"
            w={130}
            rightSection={<ListFilter size={16} />}
          />
          <Button
            variant="outline"
            color="#E36C2F"
            radius="xl"
            rightSection={<Upload size={16} />}
            onClick={() => exportTicketsMutation.mutate()}
            loading={exportTicketsMutation.isPending}
            disabled={exportTicketsMutation.isPending}
          >
            Export
          </Button>
          <Button
            variant="filled"
            color="#DD4F05"
            radius="xl"
            leftSection={<Plus size={16} />}
            onClick={() => router.push(adminRoutes.adminTicketCreate())}
          >
            Add New +
          </Button>
        </Group>
      </Group>
      <DynamicTableSection
        headers={ticketHeaders}
        data={tickets}
        loading={isLoading}
        renderItems={renderRow}
        emptyTitle="No Tickets Found"
        emptyMessage="There are currently no tickets to display."
        pagination={{
          page,
          totalPages,
          onNext: () => setPage((p) => Math.min(p + 1, totalPages)),
          onPrevious: () => setPage((p) => Math.max(p - 1, 1)),
          onPageChange: setPage,
        }}
      />
    </div>
  );
}
