"use client";

import { useState } from "react";
import { Group, Text, TextInput, Button, Select, Badge } from "@mantine/core";
import { Search, ListFilter, Upload } from "lucide-react";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import RowActionIcon from "@/app/admin/_components/RowActionIcon";
import { ViewUserActionModal } from "./ViewUserActionModal";
import { useDebouncedValue } from "@mantine/hooks";
import {
  useAdminUserActivities,
  type AdminUserActivity,
} from "../../hooks/useAdminUserActivities";

/* --------------------------------------------
 Types
--------------------------------------------- */
const PAGE_SIZE = 10;

/* --------------------------------------------
 Helpers
--------------------------------------------- */
const effectColor = (effect?: string) => {
  switch (effect) {
    case "Posted":
      return "green";
    case "Pending":
      return "orange";
    case "Rejected":
      return "red";
    default:
      return "gray";
  }
};

/* --------------------------------------------
 Component
--------------------------------------------- */
export default function UserActivitiesTable({ userId }: { userId?: string }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 400);
  const [filter, setFilter] = useState<string | null>(null);
  const [viewActionOpen, setViewActionOpen] = useState(false);

  const { activities, totalPages, isLoading } = useAdminUserActivities(userId, {
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
  });

  const formatDate = (iso?: string) => {
    if (!iso) return { date: "—", time: "" };
    const d = new Date(iso);
    return {
      date: d.toLocaleDateString("en-NG", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: d.toLocaleTimeString("en-NG", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  /* --------------------------------------------
   Table Headers
  --------------------------------------------- */
  const headers = [
    { label: "Action ID", key: "actionId" },
    { label: "Action Date", key: "actionDate" },
    { label: "Affected Module", key: "module" },
    { label: "Action Taken", key: "actionTaken" },
    { label: "Action Effect", key: "effect" },
    { label: "Action", key: "action" },
  ];

  /* --------------------------------------------
   Row Renderer
  --------------------------------------------- */
  const renderRow = (item: AdminUserActivity) => {
    const { date, time } = formatDate(
      typeof item.createdAt === "string" ? item.createdAt : undefined
    );
    const actionId = (item.actionId as string) ?? item.id ?? "—";
    const moduleName = (item.module as string) ?? "—";
    const moduleId = (item.moduleId as string) ?? "";
    const actionTaken = (item.actionTaken as string) ?? "—";
    const effect = (item.effect as string) ?? "—";

    return [
      <Text key="id" size="sm" fw={500}>
        {actionId}
      </Text>,

      <div key="date">
        <Text size="sm">{date}</Text>
        <Text size="xs" c="dimmed">
          {time}
        </Text>
      </div>,

      <div key="module">
        <Text size="sm">{moduleName}</Text>
        <Text size="xs" c="dimmed">
          {moduleId ? `ID:${moduleId}` : ""}
        </Text>
      </div>,

      <Text key="taken" size="sm" c="blue">
        {actionTaken}
      </Text>,

      <Badge key="effect" color={effectColor(effect)} radius="xl" variant="light">
        {effect}
      </Badge>,

      <RowActionIcon key="action" onClick={() => setViewActionOpen(true)} />,
    ];
  };

  return (
    <div className="bg-white rounded-xl p-5">
      {/* Header */}
      <Group justify="space-between" mb="md">
        <Group>
          <Text fw={600} size="lg">
            User Activities
          </Text>
          <TextInput
            placeholder="Enter keyword"
            leftSection={<Search size={16} />}
            radius="xl"
            value={search}
            onChange={(e) => {
              setSearch(e.currentTarget.value);
              setPage(1);
            }}
            w={260}
          />
        </Group>

        <Group>
          <Select
            placeholder="Filter By"
            data={["Posted", "Pending", "Rejected"]}
            radius="xl"
            value={filter}
            onChange={setFilter}
            rightSection={<ListFilter size={16} />}
            w={130}
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
          totalPages,
          onNext: () => setPage((p) => Math.min(p + 1, totalPages)),
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
