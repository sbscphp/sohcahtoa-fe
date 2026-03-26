"use client";

import { useMemo, useState } from "react";
import { Text, Group, TextInput, Select, Button } from "@mantine/core";
import { Search, Upload, ListFilter } from "lucide-react";
import { useDebouncedValue } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useGetExportData } from "@/app/_lib/api/hooks";
import type { ApiError, ApiResponse } from "@/app/_lib/api/client";
import { adminApi } from "@/app/admin/_services/admin-api";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import RowActionIcon from "@/app/admin/_components/RowActionIcon";
import { AuditDetailModal } from "./AuditDetailModal";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { useAuditLogs, type AuditLogRowItem } from "../../hooks/useAuditLogs";

const pageSize = 5;
type SeverityFilter = "" | "INFO" | "WARNING" | "ERROR" | "CRITICAL";

const severityOptions = [
  { value: "", label: "Filter By" },
  { value: "INFO", label: "INFO" },
  { value: "WARNING", label: "WARNING" },
  { value: "ERROR", label: "ERROR" },
  { value: "CRITICAL", label: "CRITICAL" },
];

export default function AuditLogTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAuditLogId, setSelectedAuditLogId] = useState<string | null>(null);
  const [debouncedSearch] = useDebouncedValue(search, 350);

  const queryParams = useMemo(
    () => ({
      page,
      limit: pageSize,
      search: debouncedSearch.trim() || undefined,
      severity: severityFilter || undefined,
    }),
    [debouncedSearch, page, severityFilter]
  );

  const { logs, isLoading, isFetching, totalPages } = useAuditLogs(queryParams);
  const safeTotalPages = Math.max(1, totalPages);

  const exportAuditLogsMutation = useGetExportData(
    () => adminApi.regulatory.logs.audit.export(queryParams),
    {
      onSuccess: (csvBlob) => {
        const objectUrl = URL.createObjectURL(csvBlob);
        const link = document.createElement("a");
        const dateStamp = new Date().toISOString().slice(0, 10);
        link.href = objectUrl;
        link.download = `audit-logs-${dateStamp}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(objectUrl);
      },
      onError: (error) => {
        const apiResponse = (error as unknown as ApiError).data as ApiResponse;
        notifications.show({
          title: "Export audit logs failed",
          message:
            apiResponse?.error?.message ??
            error.message ??
            "Unable to export audit logs right now. Please try again.",
          color: "red",
        });
      },
    }
  );

  const headers = [
    { label: "Timestamp", key: "timestamp" },
    { label: "User / System", key: "userOrSystem" },
    { label: "Action Performed", key: "actionPerformed" },
    { label: "Channel", key: "channel" },
    { label: "Audit ID", key: "auditId" },
    { label: "Severity", key: "actionResult" },
    { label: "Action", key: "action" },
  ];

  const openDetails = (id: string) => {
    setSelectedAuditLogId(id);
    setIsOpen(true);
  };

  const closeDetails = () => {
    setIsOpen(false);
    setSelectedAuditLogId(null);
  };

  const renderRow = (item: AuditLogRowItem) => [
    <Text size="sm" key="timestamp">
      {item.timestamp}
    </Text>,
    <Text size="sm" key="userOrSystem">
      {item.userOrSystem}
    </Text>,
    <Text size="sm" key="actionPerformed">
      {item.actionPerformed}
    </Text>,
    <Text size="sm" key="channel" c="dimmed">
      {item.channel}
    </Text>,
    <Text size="sm" key="auditId">
      {item.auditId}
    </Text>,
    <StatusBadge key="actionResult" status={item.actionResult} />,
    <RowActionIcon key="action" onClick={() => openDetails(item.id)} />,
  ];

  return (
    <div className="my-5 p-5 rounded-lg bg-white">
      <Group justify="space-between" mb="md">
        <TextInput
          placeholder="Enter keyword"
          leftSection={<Search size={16} color="#DD4F05" />}
          value={search}
          onChange={(e) => {
            setSearch(e.currentTarget.value);
            setPage(1);
          }}
          radius="xl"
          w={280}
        />

        <Group>
          <Select
            value={severityFilter}
            onChange={(value) => {
              setSeverityFilter((value as SeverityFilter) ?? "");
              setPage(1);
            }}
            data={severityOptions}
            radius="xl"
            w={150}
            rightSection={<ListFilter size={16} />}
          />

          <Button
            variant="outline"
            color="#E36C2F"
            radius="xl"
            rightSection={<Upload size={16} />}
            onClick={() => exportAuditLogsMutation.mutate()}
            loading={exportAuditLogsMutation.isPending}
            disabled={exportAuditLogsMutation.isPending}
          >
            Export
          </Button>
        </Group>
      </Group>

      <DynamicTableSection
        headers={headers}
        data={logs}
        loading={isLoading || isFetching}
        renderItems={renderRow}
        emptyTitle="No Audit Logs Found"
        emptyMessage="System and user activities will appear here."
        pagination={{
          page,
          totalPages: safeTotalPages,
          onNext: () => setPage((p) => Math.min(p + 1, safeTotalPages)),
          onPrevious: () => setPage((p) => Math.max(p - 1, 1)),
          onPageChange: setPage,
        }}
      />
      <AuditDetailModal opened={isOpen} onClose={closeDetails} auditLogId={selectedAuditLogId} />
    </div>
  );
}
