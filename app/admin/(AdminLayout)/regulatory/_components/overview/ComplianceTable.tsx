"use client";

import { useMemo, useState } from "react";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import RowActionIcon from "@/app/admin/_components/RowActionIcon";
import { Text, Group, TextInput, Select, Button } from "@mantine/core";
import { Search, Upload, ListFilter } from "lucide-react";
import { useDebouncedValue } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useGetExportData } from "@/app/_lib/api/hooks";
import type { ApiError, ApiResponse } from "@/app/_lib/api/client";
import { adminApi } from "@/app/admin/_services/admin-api";
import { ReportSummaryModal } from "./ComplianceSummaryModal";
import {
  mapComplianceFilterToApiStatus,
  useComplianceReports,
  type ComplianceReportRowItem,
} from "../../hooks/useComplianceReports";

const pageSize = 5;

const statusOptions = [
  { value: "", label: "Filter By" },
  { value: "PENDING", label: "Pending" },
  { value: "COMPLETED", label: "Completed" },
  { value: "FAILED", label: "Failed" },
];

export default function ComplianceTable() {
  const [page, setPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 350);

  const mappedStatus = mapComplianceFilterToApiStatus(statusFilter);

  const exportParams = useMemo(
    () => ({
      search: debouncedSearch.trim() || undefined,
      status: mappedStatus || undefined,
    }),
    [debouncedSearch, mappedStatus]
  );

  const exportComplianceMutation = useGetExportData(
    () => adminApi.regulatory.compliance.export(exportParams),
    {
      onSuccess: (csvBlob) => {
        const objectUrl = URL.createObjectURL(csvBlob);
        const link = document.createElement("a");
        const dateStamp = new Date().toISOString().slice(0, 10);
        link.href = objectUrl;
        link.download = `compliance-reports-${dateStamp}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(objectUrl);
      },
      onError: (error) => {
        const apiResponse = (error as unknown as ApiError).data as ApiResponse;
        notifications.show({
          title: "Export compliance reports failed",
          message:
            apiResponse?.error?.message ??
            error.message ??
            "Unable to export compliance reports right now. Please try again.",
          color: "red",
        });
      },
    }
  );

  const { reports, isLoading, isFetching, totalPages } = useComplianceReports({
    page,
    limit: pageSize,
    search: debouncedSearch || undefined,
    status: mappedStatus || undefined,
  });

  const safeTotalPages = Math.max(1, totalPages);

  const complianceHeaders = [
    { label: "Report Name", key: "reportName" },
    { label: "Reporting Date", key: "reportingDate" },
    { label: "File type", key: "fileType" },
    { label: "Status", key: "status" },
    { label: "Channel", key: "channel" },
    { label: "Action", key: "action" },
  ];

  const handleOpenReportSummary = (reportId: string) => {
    setSelectedReportId(reportId);
    setIsOpen(true);
  };

  const handleCloseReportSummary = () => {
    setIsOpen(false);
    setSelectedReportId(null);
  };

  const rendercomplianceRow = (item: ComplianceReportRowItem) => [
    <div key="reportName">
      <Text fw={500} size="sm">
        {item.reportName}
      </Text>
    </div>,

    <div key="reportingDate">
      <Text fw={500} size="sm">
        {item.reportingDate}
      </Text>
      <Text size="xs" c="dimmed">
        {item.reportingTime}
      </Text>
    </div>,

    <Text key="fileType" size="sm">
      {item.fileType}
    </Text>,

    <StatusBadge key="status" status={item.status} />,

    <Text key="channel" size="sm">
      {item.channel}
    </Text>,

    <RowActionIcon key="action" onClick={() => handleOpenReportSummary(item.id)} />,
  ];

  return (
    <div className="my-5 p-5 rounded-lg bg-white">
      <div>
        <Group justify="space-between" mb="md" wrap="nowrap">
          <div className="flex items-center gap-4">
            <h2 className="font-semibold text-lg">Compliance Reports</h2>
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
              w={130}
              rightSection={<ListFilter size={16} />}
            />

            <Button
              variant="outline"
              color="#E36C2F"
              radius="xl"
              rightSection={<Upload size={16} />}
              onClick={() => exportComplianceMutation.mutate()}
              loading={exportComplianceMutation.isPending}
              disabled={exportComplianceMutation.isPending}
            >
              Export
            </Button>
          </Group>
        </Group>
      </div>

      <DynamicTableSection
        headers={complianceHeaders}
        data={reports}
        loading={isLoading || isFetching}
        renderItems={rendercomplianceRow}
        emptyTitle="No Compliance Reports Yet"
        emptyMessage="There are currently no compliance reports to display. New reports will appear here once generated."
        pagination={{
          page,
          totalPages: safeTotalPages,
          onNext: () => setPage((p) => Math.min(p + 1, safeTotalPages)),
          onPrevious: () => setPage((p) => Math.max(p - 1, 1)),
          onPageChange: setPage,
        }}
      />

      <ReportSummaryModal
        opened={isOpen}
        onClose={handleCloseReportSummary}
        reportId={selectedReportId}
      />
    </div>
  );
}
