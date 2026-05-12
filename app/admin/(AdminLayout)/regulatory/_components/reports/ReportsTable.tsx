"use client";

import { useMemo, useState } from "react";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { Text, Group, TextInput, Select, Button } from "@mantine/core";
import { Search, Upload, ListFilter } from "lucide-react";
import RowActionIcon from "@/app/admin/_components/RowActionIcon";
import { ReportsDetailModal } from "./ReportDetailModal";
import { useDebouncedValue } from "@mantine/hooks";
import {
  mapCbnFnFilterToApiStatus,
  useCbnFnReports,
  type CbnFnReportRowItem,
} from "../../hooks/useCbnFnReports";

const pageSize = 20;

const statusOptions = [
  { value: "", label: "Filter By" },
  { value: "Pending", label: "Pending" },
  { value: "Submitted", label: "Submitted" },
  { value: "Completed", label: "Completed" },
  { value: "Failed", label: "Failed" },
];

/* --------------------------------------------
 Component
--------------------------------------------- */
export default function ReportsTable() {
  const [page, setPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 350);

  const mappedStatus = mapCbnFnFilterToApiStatus(statusFilter);

  const queryParams = useMemo(
    () => ({
      page,
      limit: pageSize,
      search: debouncedSearch.trim() || undefined,
      status: mappedStatus || undefined,
    }),
    [debouncedSearch, mappedStatus, page]
  );

  const { reports, isLoading, isFetching, totalPages, isError } = useCbnFnReports(queryParams);
  const safeTotalPages = Math.max(1, totalPages);

  const headers = [
    { label: "Report Name", key: "reportName" },
    { label: "Report Type", key: "reportType" },
    { label: "Submitted Date", key: "submittedDate" },
    { label: "Status", key: "status" },
    { label: "Channel", key: "channel" },
    { label: "Reference", key: "reference" },
    { label: "Action", key: "action" },
  ];

  const renderRow = (item: CbnFnReportRowItem) => [
    <Text key="name" size="sm">
      {item.reportName}
    </Text>,

    <Text key="pair" size="sm">
      {item.reportType}
    </Text>,

    <div key="date-time" className="flex flex-col gap-1">
      <Text key="submittedDate" size="sm">
        {item.submittedDate}
      </Text>
      <Text key="submittedTime" size="xs">
        {item.submittedTime}
      </Text>
    </div>,

    <StatusBadge key="status" status={item.status} />,

    <Text key="channel" size="sm">
      {item.channel}
    </Text>,

    <Text key="reference" size="sm">
      {item.reference}
    </Text>,

    <RowActionIcon key="action" onClick={() => {
      setSelectedReportId(item.id);
      setIsOpen(true);
    }} />,
  ];

  const handleCloseDetails = () => {
    setIsOpen(false);
    setSelectedReportId(null);
  };

  return (
    <div className="my-5 p-5 rounded-lg bg-white">
      <div>
        <Group justify="space-between" mb="md" wrap="nowrap">
          <div className="flex items-center gap-4">
            <h2 className="font-semibold text-lg">FN/CBN Reports</h2>
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
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value ?? "");
                setPage(1);
              }}
              data={statusOptions}
              radius="xl"
              w={150}
              rightSection={<ListFilter size={16} />}
            />

            <Button
              variant="filled"
              color="#E36C2F"
              radius="xl"
              rightSection={<Upload size={16} />}
            >
              Export
            </Button>
          </Group>
        </Group>
      </div>

      {isError && (
        <Text c="red" size="sm" mb="sm">
          Unable to load CBN FN reports right now. Please refresh and try again.
        </Text>
      )}

      <DynamicTableSection
        headers={headers}
        data={reports}
        loading={isLoading || isFetching}
        renderItems={renderRow}
        emptyTitle="No CBN FN Reports Yet"
        emptyMessage="There are currently no CBN FN reports to display. New reports will appear here once generated."
        pagination={{
          page,
          totalPages: safeTotalPages,
          onNext: () => setPage((p) => Math.min(p + 1, safeTotalPages)),
          onPrevious: () => setPage((p) => Math.max(p - 1, 1)),
          onPageChange: setPage,
        }}
      />
      <ReportsDetailModal opened={isOpen} onClose={handleCloseDetails} reportId={selectedReportId} />
    </div>
  );
}
