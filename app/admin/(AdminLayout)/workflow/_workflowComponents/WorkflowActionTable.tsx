"use client";

import { useMemo, useState } from "react";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import RowActionIcon from "@/app/admin/_components/RowActionIcon";
import AdminTabButton from "@/app/admin/_components/AdminTabButton";
import { Group, TextInput, Select, Button, Text, Tabs } from "@mantine/core";
import { ListFilter, Search, Upload } from "lucide-react";

type WorkflowActionStatus = "Pending" | "Completed" | "Rejected";
type FilterTab = "all" | "pending" | "completed" | "rejected";

export interface WorkflowActionRow {
  id: string;
  dateInitiated: string;
  timeInitiated: string;
  escalationPeriod: string;
  escalationMinutes: number;
  module: string;
  workflowAction: string;
  actionNeeded: string;
  status: WorkflowActionStatus;
}

export const WORKFLOW_ACTION_DATA: WorkflowActionRow[] = [
  {
    id: "WA001",
    dateInitiated: "Nov 26",
    timeInitiated: "11:00 am",
    escalationPeriod: "2 mins",
    escalationMinutes: 2,
    module: "User Management",
    workflowAction: "Edit User",
    actionNeeded: "Review",
    status: "Pending",
  },
  {
    id: "WA002",
    dateInitiated: "Nov 26",
    timeInitiated: "11:00 am",
    escalationPeriod: "5 mins",
    escalationMinutes: 5,
    module: "Outlet Management",
    workflowAction: "Create Franchise",
    actionNeeded: "Approve",
    status: "Pending",
  },
  {
    id: "WA003",
    dateInitiated: "Nov 26",
    timeInitiated: "11:00 am",
    escalationPeriod: "10 mins",
    escalationMinutes: 10,
    module: "Settlement",
    workflowAction: "Settle Transaction",
    actionNeeded: "Approve",
    status: "Pending",
  },
  {
    id: "WA004",
    dateInitiated: "Nov 26",
    timeInitiated: "11:00 am",
    escalationPeriod: "40 mins",
    escalationMinutes: 40,
    module: "Transaction",
    workflowAction: "Documentation",
    actionNeeded: "Approve",
    status: "Pending",
  },
  {
    id: "WA005",
    dateInitiated: "Nov 26",
    timeInitiated: "11:00 am",
    escalationPeriod: "18 mins",
    escalationMinutes: 18,
    module: "Outlet Management",
    workflowAction: "Delete Outlet",
    actionNeeded: "Approve",
    status: "Pending",
  },
  {
    id: "WA006",
    dateInitiated: "Nov 26",
    timeInitiated: "11:00 am",
    escalationPeriod: "12 mins",
    escalationMinutes: 12,
    module: "Transaction",
    workflowAction: "Settlement",
    actionNeeded: "Review",
    status: "Pending",
  },
  {
    id: "WA007",
    dateInitiated: "Nov 25",
    timeInitiated: "10:30 am",
    escalationPeriod: "30 mins",
    escalationMinutes: 30,
    module: "User Management",
    workflowAction: "Create User",
    actionNeeded: "Approve",
    status: "Completed",
  },
  {
    id: "WA008",
    dateInitiated: "Nov 25",
    timeInitiated: "09:00 am",
    escalationPeriod: "15 mins",
    escalationMinutes: 15,
    module: "Settlement",
    workflowAction: "Batch Settlement",
    actionNeeded: "Review",
    status: "Completed",
  },
  {
    id: "WA009",
    dateInitiated: "Nov 24",
    timeInitiated: "02:00 pm",
    escalationPeriod: "25 mins",
    escalationMinutes: 25,
    module: "Transaction",
    workflowAction: "Refund Request",
    actionNeeded: "Approve",
    status: "Rejected",
  },
];

const workflowActionHeaders = [
  { label: "Date Initiated", key: "dateInitiated" },
  { label: "Escalation Period", key: "escalationPeriod" },
  { label: "Module", key: "module" },
  { label: "Workflow Action", key: "workflowAction" },
  { label: "Action Needed", key: "actionNeeded" },
  { label: "Status", key: "status" },
  { label: "Action", key: "action" },
];

export default function WorkflowActionTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Filter By");
  const [activeTab, setActiveTab] = useState<FilterTab>("pending");
  const pageSize = 6;

  const filteredData = useMemo(() => {
    return WORKFLOW_ACTION_DATA.filter((w) => {
      const matchesSearch =
        w.id.toLowerCase().includes(search.toLowerCase()) ||
        w.module.toLowerCase().includes(search.toLowerCase()) ||
        w.workflowAction.toLowerCase().includes(search.toLowerCase()) ||
        w.actionNeeded.toLowerCase().includes(search.toLowerCase());

      const matchesTab = activeTab === "all" || w.status.toLowerCase() === activeTab;
      const matchesFilter = filter === "Filter By" || filter === "All" || w.module === filter;

      return matchesSearch && matchesTab && matchesFilter;
    });
  }, [search, activeTab, filter]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [page, filteredData]);

  const renderRow = (item: WorkflowActionRow) => [
    <div key="date">
      <Text size="sm">{item.dateInitiated}</Text>
      <Text size="xs" c="dimmed">
        {item.timeInitiated}
      </Text>
    </div>,
    <Text
      key="escalation"
      size="sm"
      fw={500}
      className={item.escalationMinutes <= 5 ? "text-orange-500" : ""}
    >
      {item.escalationPeriod}
    </Text>,
    <Text key="module" size="sm">
      {item.module}
    </Text>,
    <Text key="workflowAction" size="sm">
      {item.workflowAction}
    </Text>,
    <Text key="actionNeeded" size="sm">
      {item.actionNeeded}
    </Text>,
    <StatusBadge key="status" status={item.status} />,
    <RowActionIcon
      key="action"
      onClick={() => {
        // TODO: wire up workflow action details navigation.
        console.log("View workflow action:", item.id);
      }}
    />,
  ];

  const moduleOptions = useMemo(() => {
    const modules = [...new Set(WORKFLOW_ACTION_DATA.map((w) => w.module))];
    return ["Filter By", "All", ...modules];
  }, []);

  return (
    <div className="my-5 rounded-lg bg-white p-5">
      <Group justify="space-between" mb="md" wrap="wrap">
        <div className="flex flex-wrap items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900">All Workflow Actions</h2>
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
            value={filter}
            onChange={(value) => {
              setFilter(value!);
              setPage(1);
            }}
            data={moduleOptions}
            radius="xl"
            w={120}
            rightSection={<ListFilter size={16} />}
          />
          <Button variant="outline" color="#E36C2F" radius="xl" rightSection={<Upload size={16} />}>
            Export
          </Button>
        </Group>
      </Group>

      <Tabs
        className="mt-4!"
        color="orange"
        value={activeTab}
        onChange={(value) => {
          setActiveTab((value || "all") as FilterTab);
          setPage(1);
        }}
      >
        <Tabs.List className="mb-4 border-0! before:content-none!">
          <AdminTabButton value="all">All</AdminTabButton>
          <AdminTabButton value="pending">Pending</AdminTabButton>
          <AdminTabButton value="completed">Completed</AdminTabButton>
          <AdminTabButton value="rejected">Rejected</AdminTabButton>
        </Tabs.List>
      </Tabs>

      <DynamicTableSection
        headers={workflowActionHeaders}
        data={paginatedData}
        loading={false}
        renderItems={renderRow}
        emptyTitle="No Workflow Actions Found"
        emptyMessage="There are currently no workflow actions to display."
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
