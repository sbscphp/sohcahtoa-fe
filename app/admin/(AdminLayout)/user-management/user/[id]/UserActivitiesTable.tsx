"use client";

import { useMemo, useState } from "react";
import { Group, Text, TextInput, Button, Select, ActionIcon } from "@mantine/core";
import { Search, ListFilter, Upload, ChevronRight } from "lucide-react";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { ViewUserActionModal } from "./ViewUserActionModal";
import { useDebouncedValue } from "@mantine/hooks";
import {
  useAdminUserActivities,
  type AdminUserActivity,
} from "../../hooks/useAdminUserActivities";

/* --------------------------------------------
 Types
--------------------------------------------- */
const PAGE_SIZE = 20;
const formatEnumLabel = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

/* --------------------------------------------
 Component
--------------------------------------------- */
export default function UserActivitiesTable({ userId }: { userId?: string }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 350);
  const [statusFilter, setStatusFilter] = useState("All");
  const [viewActionOpen, setViewActionOpen] = useState(false);

  const { activities, totalPages, isLoading } = useAdminUserActivities(userId, {
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    status: statusFilter !== "All" ? statusFilter : undefined,
  });
  const safeTotalPages = Math.max(1, totalPages);
  const statusOptions = useMemo(
    () => [
      { value: "All", label: "All" },
      { value: "SUCCESS", label: "Success" },
      { value: "PENDING", label: "Pending" },
      { value: "FAILED", label: "Failed" },
    ],
    []
  );

  /* --------------------------------------------
   Table Headers
  --------------------------------------------- */
  const headers = [
    { label: "Time stamp", key: "timestamp" },
    { label: "Action By", key: "actionBy" },
    { label: "Affected Module", key: "module" },
    { label: "Action Taken", key: "actionTaken" },
    { label: "Affected system", key: "affectedSystem" },
    { label: "Status", key: "status" },
    { label: "Action", key: "action" },
  ];

  /* --------------------------------------------
   Row Renderer
  --------------------------------------------- */
  const renderRow = (item: AdminUserActivity) => {
    return [
      <div key="timestamp">
        <Text size="sm">{item.timestamp}</Text>
        <Text size="xs" c="dimmed">
          {item.time}
        </Text>
      </div>,

      <div key="actionBy">
        <Text size="sm" fw={500}>
          {item.actionBy}
        </Text>
        <Text size="xs" c="dimmed">
          {item.role}
        </Text>
      </div>,

      <Text key="module" size="sm">
        {formatEnumLabel(item.module)}
      </Text>,

      <Text key="actionTaken" size="sm">
        {item.actionTaken}
      </Text>,

      <Text key="affectedSystem" size="sm">
        {item.affectedSystem}
      </Text>,

      <StatusBadge key="status" status={formatEnumLabel(item.status)} variant="light" />,

      <ActionIcon
        key="action"
        radius="xl"
        variant="light"
        color="orange"
        onClick={() => setViewActionOpen(true)}
      >
        <ChevronRight size={14} />
      </ActionIcon>,
    ];
  };

  return (
    <div className="bg-white rounded-lg p-5">
      {/* Header */}
      <Group gap="md" mb="md" justify="space-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">User Activities</h2>
          <TextInput
            placeholder="Enter keyword"
            leftSection={<Search size={16} />}
            radius="xl"
            value={search}
            onChange={(e) => {
              setSearch(e.currentTarget.value);
              setPage(1);
            }}
            w={320}
          />
        </div>

        <Group wrap="wrap">
          <Select
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value ?? "All");
              setPage(1);
            }}
            data={statusOptions}
            radius="xl"
            w={160}
            rightSection={<ListFilter size={16} />}
            placeholder="Status"
          />
          <Button
            variant="outline"
            radius="xl"
            rightSection={<Upload size={16} />}
          >
            Export
          </Button>
        </Group>
      </Group>

      {/* Table */}
      <DynamicTableSection
        headers={headers}
        data={activities}
        loading={isLoading}
        renderItems={renderRow}
        emptyTitle="No Activities Found"
        emptyMessage="This user has no recorded activities."
        pagination={{
          page,
          totalPages: safeTotalPages,
          onNext: () => setPage((p) => Math.min(p + 1, safeTotalPages)),
          onPrevious: () => setPage((p) => Math.max(p - 1, 1)),
          onPageChange: setPage,
        }}
      />

      <ViewUserActionModal
        opened={viewActionOpen}
        onClose={() => setViewActionOpen(false)}
      />
    </div>
  );
}
