"use client";

import { useMemo, useState } from "react";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import RowActionIcon from "@/app/admin/_components/RowActionIcon";
import { Group, TextInput, Select, Button, Text } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { ListFilter, Search, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { adminRoutes } from "@/lib/adminRoutes";
import {
  useWorkflowManagementList,
  type WorkflowManagementTableRow,
} from "../hooks/useWorkflowManagementList";

const workflowHeaders = [
  { label: "Workflow name", key: "name" },
  { label: "Workflow Type", key: "workflowType" },
  { label: "Workflow Action", key: "workflowAction" },
  { label: "Status", key: "status" },
  { label: "Date Created", key: "dateCreated" },
  { label: "Action", key: "action" },
];

export default function WorkflowManagementTable() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Filter By");
  const pageSize = 6;
  const [debouncedSearch] = useDebouncedValue(search, 350);

  const queryParams = useMemo(
    () => ({
      page,
      limit: pageSize,
      search: debouncedSearch.trim() || undefined,
      status:
        filter === "Filter By" || filter === "All"
          ? ""
          : (filter as "" | "Active" | "Deactivated" | "Draft"),
    }),
    [debouncedSearch, filter, page]
  );

  const { rows, isLoading, isFetching, isError, totalPages } =
    useWorkflowManagementList(queryParams);
  const safeTotalPages = Math.max(1, totalPages);

  const renderRow = (item: WorkflowManagementTableRow) => [
    <div key="name">
      <Text fw={500} size="sm">
        {item.name}
      </Text>
      <Text size="xs" c="dimmed">
        ID:{item.displayId}
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
      onClick={() => router.push(adminRoutes.adminWorkflowDetails(item.id))}
    />,
  ];

  return (
    <div className="my-5 rounded-lg bg-white p-5">
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
            data={["Filter By", "All", "Active", "Deactivated", "Draft"]}
            radius="xl"
            w={120}
            rightSection={<ListFilter size={16} />}
          />
          <Button variant="outline" color="#E36C2F" radius="xl" rightSection={<Upload size={16} />}>
            Export
          </Button>
          {/* <Button
            variant="filled"
            color="#DD4F05"
            radius="xl"
            leftSection={<Plus size={16} />}
            onClick={() => router.push(adminRoutes.adminWorkflowCreate())}
          >
            Add New +
          </Button> */}
        </Group>
      </Group>

      <DynamicTableSection
        headers={workflowHeaders}
        data={rows}
        loading={isLoading || isFetching}
        renderItems={renderRow}
        emptyTitle="No Workflows Found"
        emptyMessage="There are currently no workflows to display."
        pagination={{
          page,
          totalPages: safeTotalPages,
          onNext: () => setPage((p) => Math.min(p + 1, safeTotalPages)),
          onPrevious: () => setPage((p) => Math.max(p - 1, 1)),
          onPageChange: setPage,
        }}
      />
      {isError ? (
        <Text c="red" size="sm" mt="sm">
          Unable to load workflows right now. Please try again.
        </Text>
      ) : null}
    </div>
  );
}
