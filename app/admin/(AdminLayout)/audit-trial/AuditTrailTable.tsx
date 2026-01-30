"use client";

import { useState, useMemo } from "react";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import {
  Text,
  ActionIcon,
  Group,
  TextInput,
  Select,
  Button,
} from "@mantine/core";
import { ChevronRight, Search, Upload, ListFilter } from "lucide-react";
import ViewUserActionModal from "./ViewUserActionModal";

/* --------------------------------------------
 Types
--------------------------------------------- */
interface AuditTrailItem {
  timestamp: string;
  time: string;
  actionBy: string;
  role: string;
  module: string;
  actionTaken: string;
  affectedSystem: string;
  status: "Success" | "Pending";
}

/* --------------------------------------------
 Mock Data
--------------------------------------------- */
const auditTrailData: AuditTrailItem[] = [
  {
    timestamp: "2025-09-22",
    time: "09:30",
    actionBy: "Adekunle Jayeola",
    role: "Internal Control",
    module: "Rate management",
    actionTaken: "Created rates",
    affectedSystem: "USD–NGN Rates",
    status: "Success",
  },
  {
    timestamp: "2025-09-21",
    time: "12:00",
    actionBy: "Marcus Reynolds",
    role: "Lead, Strategy",
    module: "Customer management",
    actionTaken: "Approved KYC",
    affectedSystem: "Customer #1245",
    status: "Success",
  },
  {
    timestamp: "2025-09-20",
    time: "18:00",
    actionBy: "Elena Rodriguez",
    role: "Head, Agent Control",
    module: "Outlet Management",
    actionTaken: "Outlet Suspended",
    affectedSystem: "Ikeja Branch #002",
    status: "Success",
  },
  {
    timestamp: "2025-09-19",
    time: "17:00",
    actionBy: "Sofia Chen",
    role: "Head of Settlement",
    module: "Compliance",
    actionTaken: "Variance Flagged",
    affectedSystem: "USD–NGN",
    status: "Pending",
  },
  {
    timestamp: "2025-09-20",
    time: "18:00",
    actionBy: "Elena Rodriguez",
    role: "Head, Agent Control",
    module: "Outlet Management",
    actionTaken: "Outlet Suspended",
    affectedSystem: "Ikeja Branch #002",
    status: "Success",
  },
  {
    timestamp: "2025-09-19",
    time: "17:00",
    actionBy: "Sofia Chen",
    role: "Head of Settlement",
    module: "Compliance",
    actionTaken: "Variance Flagged",
    affectedSystem: "USD–NGN",
    status: "Pending",
  },
  {
    timestamp: "2025-09-20",
    time: "18:00",
    actionBy: "Elena Rodriguez",
    role: "Head, Agent Control",
    module: "Outlet Management",
    actionTaken: "Outlet Suspended",
    affectedSystem: "Ikeja Branch #002",
    status: "Success",
  },
  {
    timestamp: "2025-09-19",
    time: "17:00",
    actionBy: "Sofia Chen",
    role: "Head of Settlement",
    module: "Compliance",
    actionTaken: "Variance Flagged",
    affectedSystem: "USD–NGN",
    status: "Pending",
  },
];

/* --------------------------------------------
 Component
--------------------------------------------- */
export default function AuditTrailTable() {
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [viewActionOpened, setViewActionOpened] = useState(false);

  /* Filtering */
  const filteredData = useMemo(() => {
    return auditTrailData.filter((item) => {
      const matchesSearch =
        item.actionBy.toLowerCase().includes(search.toLowerCase()) ||
        item.module.toLowerCase().includes(search.toLowerCase());

      const matchesFilter = filter === "All" ? true : item.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [search, filter]);

  /* Pagination */
  const totalPages = Math.ceil(filteredData.length / pageSize);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [page, filteredData]);

  /* Table Headers */
  const headers = [
    { label: "Time stamp", key: "timestamp" },
    { label: "Action By", key: "actionBy" },
    { label: "Module Affected", key: "module" },
    { label: "Action Taken", key: "actionTaken" },
    { label: "Affected system", key: "affectedSystem" },
    { label: "Status", key: "status" },
    { label: "Action", key: "action" },
  ];

  /* Row Renderer */
  const renderRow = (item: AuditTrailItem) => [
    // Timestamp
    <div key="timestamp">
      <Text size="sm">{item.timestamp}</Text>
      <Text size="xs" c="dimmed">
        {item.time}
      </Text>
    </div>,

    // Action By
    <div key="actionBy">
      <Text size="sm" fw={500}>
        {item.actionBy}
      </Text>
      <Text size="xs" c="dimmed">
        {item.role}
      </Text>
    </div>,

    // Module
    <Text key="module" size="sm">
      {item.module}
    </Text>,

    // Action Taken
    <Text key="actionTaken" size="sm">
      {item.actionTaken}
    </Text>,

    // Affected System
    <Text key="affectedSystem" size="sm">
      {item.affectedSystem}
    </Text>,

    // Status
    <StatusBadge key="status" status={item.status} variant="light" />,

    // Action
    <ActionIcon
      key="action"
      radius="xl"
      variant="light"
      color="orange"
      onClick={() => setViewActionOpened(true)}
    >
      <ChevronRight size={14} />
    </ActionIcon>,
  ];

  return (
    <div className="p-5 bg-white rounded-lg">
      {/* Header */}
      <Group justify="space-between" mb="md">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">Audit Trail</h2>

          <TextInput
            placeholder="Enter keyword"
            leftSection={<Search size={16} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            radius="xl"
            w={320}
          />
        </div>

        <Group>
          <Select
            value={filter}
            onChange={(v) => setFilter(v!)}
            data={["All", "Success", "Pending"]}
            radius="xl"
            w={120}
            rightSection={<ListFilter size={16} />}
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
        emptyTitle="No Data Available Yet"
        emptyMessage="You currently do not have any data available yet. Check back Later"
        pagination={{
          page,
          totalPages,
          onNext: () => setPage((p) => Math.min(p + 1, totalPages)),
          onPrevious: () => setPage((p) => Math.max(p - 1, 1)),
          onPageChange: setPage,
        }}
      />
      <ViewUserActionModal
        opened={viewActionOpened}
        onClose={() => setViewActionOpened(false)}
      />
    </div>
  );
}
