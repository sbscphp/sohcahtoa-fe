"use client";

import { useState, useMemo } from "react";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { DateRangePicker } from "@/app/admin/_components/DateRangePicker";
import { useDebouncedValue } from "@mantine/hooks";
import { useGetExportData } from "@/app/_lib/api/hooks";
import { useAuditTrail, type AuditTrailRowItem } from "./hooks/useAuditTrail";
import {
  Text,
  ActionIcon,
  Group,
  TextInput,
  Select,
  Button,
  Stack,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { ChevronRight, Search, Upload, ListFilter } from "lucide-react";
import ViewUserActionModal from "./ViewUserActionModal";
import { adminApi } from "@/app/admin/_services/admin-api";
import type { ApiError, ApiResponse } from "@/app/_lib/api/client";

const formatEnumLabel = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

/* --------------------------------------------
 Component
--------------------------------------------- */
export default function AuditTrailTable() {
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 350);
  const [moduleFilter, setModuleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [viewActionOpened, setViewActionOpened] = useState(false);

  const { entries, isLoading, totalPages } = useAuditTrail({
    page,
    limit: pageSize,
    search: debouncedSearch || undefined,
    module: moduleFilter !== "All" ? moduleFilter : undefined,
    status: statusFilter !== "All" ? statusFilter : undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });
  const exportAuditTrailMutation = useGetExportData(
    () =>
      adminApi.auditTrail.export({
        search: debouncedSearch || undefined,
        module: moduleFilter !== "All" ? moduleFilter : undefined,
        status: statusFilter !== "All" ? statusFilter : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      }),
    {
      onSuccess: (csvBlob) => {
        const objectUrl = URL.createObjectURL(csvBlob);
        const link = document.createElement("a");
        const dateStamp = new Date().toISOString().slice(0, 10);

        link.href = objectUrl;
        link.download = `audit-trail-${dateStamp}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(objectUrl);
      },
      onError: (error) => {
        const apiResponse = (error as unknown as ApiError).data as ApiResponse;
        notifications.show({
          title: "Export Audit Trail Failed",
          message:
            apiResponse?.error?.message ??
            error.message ??
            "Unable to export audit trail at the moment. Please try again.",
          color: "red",
        });
      },
    }
  );

  const moduleOptions = useMemo(
    () => [
      { value: "All", label: "All" },
      { value: "DEPARTMENT", label: "Department" },
      { value: "ROLE", label: "Role" },
      { value: "RATE", label: "Rate" },
      { value: "TRANSACTION", label: "Transaction" },
      { value: "TRANS-DOC", label: "Transaction Document" },
      { value: "REPORT", label: "Report" },
    ],
    []
  );

  const statusOptions = useMemo(
    () => [
      { value: "All", label: "All" },
      { value: "SUCCESS", label: "Success" },
      { value: "PENDING", label: "Pending" },
      { value: "FAILED", label: "Failed" },
    ],
    []
  );
  const safeTotalPages = Math.max(1, totalPages);

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
  const renderRow = (item: AuditTrailRowItem) => [
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
      {formatEnumLabel(item.module)}
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
    <StatusBadge key="status" status={formatEnumLabel(item.status)} variant="light" />,

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
      <Stack gap="md" mb="md">
        <Group justify="space-between" wrap="wrap">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">Audit Trail</h2>

            <TextInput
              placeholder="Enter keyword"
              leftSection={<Search size={16} color="#DD4F05" />}
              value={search}
              onChange={(e) => {
                setSearch(e.currentTarget.value);
                setPage(1);
              }}
              radius="xl"
              w={320}
            />
          </div>
          <Group wrap="wrap">
          <Select
            value={moduleFilter}
            onChange={(value) => {
              setModuleFilter(value ?? "All");
              setPage(1);
            }}
            data={moduleOptions}
            radius="xl"
            w={180}
            rightSection={<ListFilter size={16} />}
            placeholder="Module"
          />

          <Button
            variant="outline"
            radius="xl"
            rightSection={<Upload size={16} />}
            onClick={() => exportAuditTrailMutation.mutate()}
            loading={exportAuditTrailMutation.isPending}
            disabled={exportAuditTrailMutation.isPending}
          >
            Export
          </Button>
        </Group>

        </Group>

        

          {/* <Select
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

          <div className="w-[340px]">
            <DateRangePicker
              onDateRangeChange={(startDate, endDate) => {
                setDateFrom(startDate);
                setDateTo(endDate);
                setPage(1);
              }}
              maxDate={new Date()}
              valueFormat="YYYY-MM-DD"
              placeholder="Select date range"
            />
          </div> */}
      </Stack>

      {/* Table */}
      <DynamicTableSection
        headers={headers}
        data={entries}
        loading={isLoading}
        renderItems={renderRow}
        emptyTitle="No Data Available Yet"
        emptyMessage="You currently do not have any data available yet. Check back Later"
        pagination={{
          page,
          totalPages: safeTotalPages,
          onNext: () => setPage((p) => Math.min(p + 1, safeTotalPages)),
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
