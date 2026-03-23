"use client";

import { useMemo, useState } from "react";
import { Text, Group, TextInput, Select, Button } from "@mantine/core";
import { Search, Upload, ListFilter } from "lucide-react";
import { useDebouncedValue } from "@mantine/hooks";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import RowActionIcon from "@/app/admin/_components/RowActionIcon";
import { RegulatoryDetailModal } from "./RegulatoryDetailModal";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import {
  mapRegulatoryFilterToApiStatus,
  type RegulatoryLogRowItem,
  type RegulatoryStatusFilter,
  useRegulatoryLogs,
} from "../../hooks/useRegulatoryLogs";

const pageSize = 5;

const statusOptions = [
  { value: "", label: "Filter By" },
  { value: "PENDING", label: "PENDING" },
  { value: "COMPLETED", label: "COMPLETED" },
  { value: "FAILED", label: "FAILED" },
];

export default function RegulatoryLogTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<RegulatoryStatusFilter>("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRegulatoryId, setSelectedRegulatoryId] = useState<string | null>(null);
  const [debouncedSearch] = useDebouncedValue(search, 350);

  const queryParams = useMemo(
    () => ({
      page,
      limit: pageSize,
      search: debouncedSearch.trim() || undefined,
      status: mapRegulatoryFilterToApiStatus(statusFilter),
    }),
    [debouncedSearch, page, statusFilter]
  );

  const { logs, isLoading, isFetching, totalPages } = useRegulatoryLogs(queryParams);
  const safeTotalPages = Math.max(1, totalPages);

  const headers = [
    { label: "Timestamp", key: "timestamp" },
    { label: "User / System", key: "userOrSystem" },
    { label: "Action Performed", key: "actionPerformed" },
    { label: "Status", key: "actionResult" },
    { label: "Channel", key: "channel" },
    { label: "Regulatory ID", key: "regulatoryId" },
    { label: "Action", key: "action" },
  ];

  const openDetails = (id: string) => {
    setSelectedRegulatoryId(id);
    setIsOpen(true);
  };

  const closeDetails = () => {
    setIsOpen(false);
    setSelectedRegulatoryId(null);
  };

  const renderRow = (item: RegulatoryLogRowItem) => [
    <Text size="sm" key="timestamp">
      {item.timestamp}
    </Text>,
    <Text size="sm" key="userOrSystem">
      {item.userOrSystem}
    </Text>,
    <Text size="sm" key="actionPerformed">
      {item.actionPerformed}
    </Text>,
    <StatusBadge key="actionResult" status={item.actionResult} />,
    <Text size="sm" key="channel" c="dimmed">
      {item.channel}
    </Text>,
    <Text size="sm" key="regulatoryId">
      {item.regulatoryId}
    </Text>,
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
          w={300}
        />

        <Group>
          <Select
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter((value as RegulatoryStatusFilter) ?? "");
              setPage(1);
            }}
            data={statusOptions}
            radius="xl"
            w={160}
            rightSection={<ListFilter size={16} />}
          />

          <Button
            variant="outline"
            radius="xl"
            color="#E36C2F"
            rightSection={<Upload size={16} />}
            disabled
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
        emptyTitle="No Regulatory Logs Found"
        emptyMessage="Regulatory interactions with FN and CBN will appear here."
        pagination={{
          page,
          totalPages: safeTotalPages,
          onNext: () => setPage((p) => Math.min(p + 1, safeTotalPages)),
          onPrevious: () => setPage((p) => Math.max(p - 1, 1)),
          onPageChange: setPage,
        }}
      />
      <RegulatoryDetailModal
        opened={isOpen}
        onClose={closeDetails}
        regulatoryLogId={selectedRegulatoryId}
      />
    </div>
  );
}
