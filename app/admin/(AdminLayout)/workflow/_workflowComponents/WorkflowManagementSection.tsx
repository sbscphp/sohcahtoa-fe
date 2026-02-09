"use client";

import { useState, useMemo } from "react";
import StatCard from "@/app/admin/_components/StatCard";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import RowActionIcon from "@/app/admin/_components/RowActionIcon";
import { Group, TextInput, Select, Button, Text } from "@mantine/core";
import { ListFilter, Plus, Search, Upload, Workflow, CheckCircle, XCircle } from "lucide-react";

type WorkflowStatus = "Active" | "Deactivated";
type WorkflowType = "Rigid Linear" | "Flexible Workflow";

export interface WorkflowRow {
  id: string;
  name: string;
  workflowType: WorkflowType;
  workflowAction: string;
  status: WorkflowStatus;
  dateCreated: string;
  timeCreated: string;
}

const WORKFLOW_DATA: WorkflowRow[] = [
  {
    id: "8933",
    name: "Internal Control",
    workflowType: "Rigid Linear",
    workflowAction: "Transaction Management",
    status: "Active",
    dateCreated: "September 12, 2025",
    timeCreated: "11:00 am",
  },
  {
    id: "8935",
    name: "BTA Transaction",
    workflowType: "Flexible Workflow",
    workflowAction: "Transaction Management",
    status: "Deactivated",
    dateCreated: "September 12, 2025",
    timeCreated: "11:00 am",
  },
  {
    id: "8936",
    name: "PTA Transaction",
    workflowType: "Rigid Linear",
    workflowAction: "Transaction Management",
    status: "Active",
    dateCreated: "September 12, 2025",
    timeCreated: "11:00 am",
  },
  {
    id: "8934",
    name: "Escrow Settlement",
    workflowType: "Flexible Workflow",
    workflowAction: "Settlement Management",
    status: "Deactivated",
    dateCreated: "September 12, 2025",
    timeCreated: "11:00 am",
  },
  {
    id: "8937",
    name: "General Transaction",
    workflowType: "Rigid Linear",
    workflowAction: "Transaction Management",
    status: "Active",
    dateCreated: "September 12, 2025",
    timeCreated: "11:00 am",
  },
  {
    id: "8933",
    name: "Reporting system",
    workflowType: "Flexible Workflow",
    workflowAction: "Reporting",
    status: "Deactivated",
    dateCreated: "September 12, 2025",
    timeCreated: "11:00 am",
  },
  {
    id: "8938",
    name: "User Onboarding",
    workflowType: "Rigid Linear",
    workflowAction: "User Management",
    status: "Active",
    dateCreated: "September 10, 2025",
    timeCreated: "09:30 am",
  },
  {
    id: "8939",
    name: "KYC Verification",
    workflowType: "Flexible Workflow",
    workflowAction: "Compliance",
    status: "Active",
    dateCreated: "September 08, 2025",
    timeCreated: "02:00 pm",
  },
  {
    id: "8940",
    name: "Outlet Approval",
    workflowType: "Rigid Linear",
    workflowAction: "Outlet Management",
    status: "Active",
    dateCreated: "September 05, 2025",
    timeCreated: "10:00 am",
  },
  {
    id: "8941",
    name: "Refund Processing",
    workflowType: "Flexible Workflow",
    workflowAction: "Transaction Management",
    status: "Active",
    dateCreated: "September 01, 2025",
    timeCreated: "11:30 am",
  },
];

const workflowHeaders = [
  { label: "Workflow name", key: "name" },
  { label: "Workflow Type", key: "workflowType" },
  { label: "Workflow Action", key: "workflowAction" },
  { label: "Status", key: "status" },
  { label: "Date Created", key: "dateCreated" },
  { label: "Action", key: "action" },
];

export default function WorkflowManagementSection() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Filter By");
  const pageSize = 6;

  const stats = useMemo(() => {
    const total = WORKFLOW_DATA.length;
    const active = WORKFLOW_DATA.filter((w) => w.status === "Active").length;
    const deactivated = WORKFLOW_DATA.filter((w) => w.status === "Deactivated").length;
    return { total, active, deactivated };
  }, []);

  const filteredData = useMemo(() => {
    return WORKFLOW_DATA.filter((w) => {
      const matchesSearch =
        w.id.toLowerCase().includes(search.toLowerCase()) ||
        w.name.toLowerCase().includes(search.toLowerCase()) ||
        w.workflowType.toLowerCase().includes(search.toLowerCase()) ||
        w.workflowAction.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        filter === "Filter By" || filter === "All" || w.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [search, filter]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [page, filteredData]);

  const renderRow = (item: WorkflowRow) => [
    <div key="name">
      <Text fw={500} size="sm">
        {item.name}
      </Text>
      <Text size="xs" c="dimmed">
        ID:{item.id}
      </Text>
    </div>,
    <Text key="workflowType" size="sm">
      {item.workflowType}
    </Text>,
    <Text key="workflowAction" size="sm">
      {item.workflowAction}
    </Text>,
    <StatusBadge key="status" status={item.status} />,
    <div key="dateCreated">
      <Text size="sm">{item.dateCreated}</Text>
      <Text size="xs" c="dimmed">
        {item.timeCreated}
      </Text>
    </div>,
    <RowActionIcon
      key="action"
      onClick={() => {
        // Navigate to workflow details
        console.log("View workflow:", item.id);
      }}
    />,
  ];

  return (
    <>
      {/* Stats Cards */}
      <div className="w-full rounded-xl bg-white p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="No. of Workflows"
            value={stats.total}
            icon={<Workflow className="h-5 w-5 text-orange-600" />}
            iconBg="bg-orange-100"
          />
          <StatCard
            title="Active Workflows"
            value={stats.active}
            icon={<CheckCircle className="h-5 w-5 text-green-600" />}
            iconBg="bg-green-100"
          />
          <StatCard
            title="Deactivated Workflows"
            value={stats.deactivated}
            icon={<XCircle className="h-5 w-5 text-red-600" />}
            iconBg="bg-red-100"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="my-5 rounded-lg bg-white p-5">
        {/* Header with Search and Filters */}
        <Group justify="space-between" mb="md" wrap="wrap">
          <div className="flex flex-wrap items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-900">All Workflows</h2>
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
              data={["Filter By", "All", "Active", "Deactivated"]}
              radius="xl"
              w={120}
              rightSection={<ListFilter size={16} />}
            />
            <Button
              variant="outline"
              color="#E36C2F"
              radius="xl"
              rightSection={<Upload size={16} />}
            >
              Export
            </Button>
            <Button
              variant="filled"
              color="#DD4F05"
              radius="xl"
              leftSection={<Plus size={16} />}
              onClick={() => {
                // Navigate to create workflow page
                console.log("Add new workflow");
              }}
            >
              Add New +
            </Button>
          </Group>
        </Group>

        {/* Table */}
        <DynamicTableSection
          headers={workflowHeaders}
          data={paginatedData}
          loading={false}
          renderItems={renderRow}
          emptyTitle="No Workflows Found"
          emptyMessage="There are currently no workflows to display."
          pagination={{
            page,
            totalPages,
            onNext: () => setPage((p) => Math.min(p + 1, totalPages)),
            onPrevious: () => setPage((p) => Math.max(p - 1, 1)),
            onPageChange: setPage,
          }}
        />
      </div>
    </>
  );
}
