"use client";

import { useMemo, useState } from "react";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import RowActionIcon from "@/app/admin/_components/RowActionIcon";
import AdminTabButton from "@/app/admin/_components/AdminTabButton";
import { Group, TextInput, Select, Button, Text, Tabs } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { ListFilter, Search, Upload } from "lucide-react";
import {
  mapWorkflowTabToApiStatus,
  useWorkflowActions,
  type WorkflowActionTableRow,
} from "../hooks/useWorkflowActions";
import { adminApi } from "@/app/admin/_services/admin-api";
import { useGetExportData } from "@/app/_lib/api/hooks";
import type { ApiError, ApiResponse } from "@/app/_lib/api/client";
import { notifications } from "@mantine/notifications";

type FilterTab = "all" | "pending" | "completed" | "rejected";

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
  const [debouncedSearch] = useDebouncedValue(search, 350);

  const queryParams = useMemo(
    () => ({
      page,
      limit: pageSize,
      search: debouncedSearch.trim() || undefined,
      status: mapWorkflowTabToApiStatus(activeTab),
      module: filter !== "Filter By" && filter !== "All" ? filter : undefined,
    }),
    [activeTab, debouncedSearch, filter, page],
  );

  const exportParams = useMemo(
    () => ({
      search: debouncedSearch.trim() || undefined,
      status: mapWorkflowTabToApiStatus(activeTab),
      module: filter !== "Filter By" && filter !== "All" ? filter : undefined,
    }),
    [activeTab, debouncedSearch, filter]
  );

  const exportMutation = useGetExportData(
    () => adminApi.workflow.exportActions(exportParams),
    {
      onSuccess: (csvBlob) => {
        const objectUrl = URL.createObjectURL(csvBlob);
        const link = document.createElement("a");
        const dateStamp = new Date().toISOString().slice(0, 10);
        link.href = objectUrl;
        link.download = `workflow-actions-${activeTab}-${dateStamp}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(objectUrl);

        notifications.show({
          title: "Export Successful",
          message: "Workflow actions report has been downloaded.",
          color: "green",
        });
      },
      onError: (error) => {
        const apiResponse = (error as unknown as ApiError).data as ApiResponse;
        notifications.show({
          title: "Export Failed",
          message: apiResponse?.error?.message ?? "Unable to export report.",
          color: "red",
        });
      },
    }
  );
  const { actions, isLoading, isFetching, isError, totalPages } =
    useWorkflowActions(queryParams);
  const safeTotalPages = Math.max(1, totalPages);

  const renderRow = (item: WorkflowActionTableRow) => [
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
    const modules = [
      ...new Set(actions.map((action) => action.module).filter(Boolean)),
    ];
    if (
      filter !== "Filter By" &&
      filter !== "All" &&
      !modules.includes(filter)
    ) {
      modules.unshift(filter);
    }
    return ["Filter By", "All", ...modules];
  }, [actions, filter]);

  return (
    <div className="my-5 rounded-lg bg-white p-5">
      <Group justify="space-between" mb="md" wrap="wrap">
        <div className="flex flex-wrap items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900">
            All Workflow Actions
          </h2>
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
          <Button 
            variant="outline" 
            color="#E36C2F" 
            radius="xl" 
            rightSection={<Upload size={16} />}
            onClick={() => exportMutation.mutate()}
            loading={exportMutation.isPending}
            disabled={exportMutation.isPending}
          >
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
        data={actions}
        loading={isLoading || isFetching}
        renderItems={renderRow}
        emptyTitle="No Workflow Actions Found"
        emptyMessage="There are currently no workflow actions to display."
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
          Unable to load workflow actions right now. Please try again.
        </Text>
      ) : null}
    </div>
  );
}
