"use client";

import { useMemo, useState } from "react";
import { Group, Text, TextInput, Button, Select, Badge } from "@mantine/core";
import { Search, ListFilter, Upload } from "lucide-react";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import RowActionIcon from "@/app/admin/_components/RowActionIcon";
import { ViewUserActionModal } from "./ViewUserActionModal";

/* --------------------------------------------
 Types
--------------------------------------------- */
interface UserActivity {
  actionId: string;
  actionDate: string;
  actionTime: string;
  module: string;
  moduleId: string;
  actionTaken: string;
  effect: "Posted" | "Pending" | "Rejected";
}

/* --------------------------------------------
 Mock Data
--------------------------------------------- */
const activities: UserActivity[] = [
  {
    actionId: "7844gAGAA563A",
    actionDate: "September 12, 2025",
    actionTime: "11:00 am",
    module: "Transaction Management",
    moduleId: "8933",
    actionTaken: "Resolve BTA",
    effect: "Posted",
  },
  {
    actionId: "7844gAGAA563A",
    actionDate: "September 12, 2025",
    actionTime: "11:00 am",
    module: "Agent Management",
    moduleId: "8935",
    actionTaken: "Create Agent",
    effect: "Pending",
  },
  {
    actionId: "7844gAGAA563A",
    actionDate: "September 12, 2025",
    actionTime: "11:00 am",
    module: "Escrow Management",
    moduleId: "8936",
    actionTaken: "Settle BTA",
    effect: "Rejected",
  },
];

/* --------------------------------------------
 Helpers
--------------------------------------------- */
const effectColor = (effect: UserActivity["effect"]) => {
  switch (effect) {
    case "Posted":
      return "green";
    case "Pending":
      return "orange";
    case "Rejected":
      return "red";
  }
};

/* --------------------------------------------
 Component
--------------------------------------------- */
export default function UserActivitiesTable() {
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string | null>(null);
  const [viewActionOpen, setViewActionOpen] = useState(false);

  const filteredData = useMemo(() => {
    return activities.filter(
      (item) =>
        item.actionId.toLowerCase().includes(search.toLowerCase()) ||
        item.module.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [page, filteredData]);

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
  const renderRow = (item: UserActivity) => [
    <Text key="id" size="sm" fw={500}>
      {item.actionId}
    </Text>,

    <div key="date">
      <Text size="sm">{item.actionDate}</Text>
      <Text size="xs" c="dimmed">
        {item.actionTime}
      </Text>
    </div>,

    <div key="module">
      <Text size="sm">{item.module}</Text>
      <Text size="xs" c="dimmed">
        ID:{item.moduleId}
      </Text>
    </div>,

    <Text key="taken" size="sm" c="blue">
      {item.actionTaken}
    </Text>,

    <Badge
      key="effect"
      color={effectColor(item.effect)}
      radius="xl"
      variant="light"
    >
      {item.effect}
    </Badge>,

    <RowActionIcon key="action" onClick={() => setViewActionOpen(true)} />,
  ];

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
            onChange={(e) => setSearch(e.currentTarget.value)}
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
        data={paginatedData}
        loading={false}
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
