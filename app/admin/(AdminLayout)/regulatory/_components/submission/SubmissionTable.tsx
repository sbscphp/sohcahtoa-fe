"use client";

import { useMemo, useState } from "react";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { Text, Group, TextInput, Select, Button } from "@mantine/core";
import { Search, Upload, ListFilter } from "lucide-react";
import RowActionIcon from "@/app/admin/_components/RowActionIcon";
import { SubmissionDetailModal } from "./SubmissionDetailModal";
import { useDebouncedValue } from "@mantine/hooks";
import { useGetExportData } from "@/app/_lib/api/hooks";
import { adminApi } from "@/app/admin/_services/admin-api";
import { notifications } from "@mantine/notifications";
import type { ApiError, ApiResponse } from "@/app/_lib/api/client";
import {
  mapTrmsFilterToApiStatus,
  useTrmsSubmissions,
  type TrmsSubmissionRowItem,
} from "../../hooks/useTrmsSubmissions";
import { formatCurrency } from "@/app/utils/helper/formatCurrency";

const pageSize = 5;

const statusOptions = [
  { value: "", label: "Filter By" },
  { value: "BUSY", label: "BUSY" },
  { value: "AWAITING APPROVAL", label: "AWAITING APPROVAL" },
  { value: "APPROVED", label: "APPROVED" },
  { value: "REJECTED", label: "REJECTED" },
];

export default function SubmissionTable() {
  const [page, setPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 350);

  const mappedStatus = mapTrmsFilterToApiStatus(statusFilter);

  const queryParams = useMemo(
    () => ({
      page,
      limit: pageSize,
      search: debouncedSearch.trim() || undefined,
      status: mappedStatus || undefined,
    }),
    [debouncedSearch, mappedStatus, page]
  );

  const exportParams = useMemo(
    () => ({
      search: debouncedSearch.trim() || undefined,
      status: mappedStatus || undefined,
    }),
    [debouncedSearch, mappedStatus]
  );

  const { submissions, isLoading, isFetching, totalPages } = useTrmsSubmissions(queryParams);
  const safeTotalPages = Math.max(1, totalPages);

  const exportTrmsMutation = useGetExportData(
    () => adminApi.regulatory.trms.export(exportParams),
    {
      onSuccess: (csvBlob) => {
        const objectUrl = URL.createObjectURL(csvBlob);
        const link = document.createElement("a");
        const dateStamp = new Date().toISOString().slice(0, 10);
        link.href = objectUrl;
        link.download = `trms-submissions-${dateStamp}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(objectUrl);
      },
      onError: (error) => {
        const apiResponse = (error as unknown as ApiError).data as ApiResponse;
        notifications.show({
          title: "Export TRMS Submissions Failed",
          message:
            apiResponse?.error?.message ??
            error.message ??
            "Unable to export TRMS submissions at the moment. Please try again.",
          color: "red",
        });
      },
    }
  );

  const headers = [
    { label: "Transaction ID", key: "transactionId" },
    { label: "Customer Name", key: "customerName" },
    { label: "Currency Pair", key: "currencyPair" },
    { label: "Transaction Type", key: "transactionType" },
    { label: "Amount", key: "amount" },
    { label: "Status", key: "status" },
    { label: "Action", key: "action" },
  ];

  const handleOpenDetails = (transactionId: string) => {
    setSelectedTransactionId(transactionId);
    setIsOpen(true);
  };

  const handleCloseDetails = () => {
    setIsOpen(false);
    setSelectedTransactionId(null);
  };

  const getCurrency = (currencyPair: string) => {
    return currencyPair.substring(0, 3);
  };

  const renderRow = (item: TrmsSubmissionRowItem) => [
    <Text key="transactionId" fw={500} size="sm">
      {item.transactionId}
    </Text>,

    <Text key="customerName" size="sm">
      {item.customerName}
    </Text>,

    <Text key="currencyPair" size="sm">
      {item.currencyPair}
    </Text>,

    <Text key="transactionType" size="sm">
      {item.transactionType}
    </Text>,

    <Text key="amount" size="sm">
      {formatCurrency(item.amount, getCurrency(item.currencyPair))}
    </Text>,

    <StatusBadge key="status" status={item.status} />,

    <RowActionIcon key="action" onClick={() => handleOpenDetails(item.id)} />,
  ];

  return (
    <div className="my-5 p-5 rounded-lg bg-white">
      <div>
        <Group justify="space-between" mb="md" wrap="nowrap">
          <div className="flex items-center gap-4">
            <h2 className="font-semibold text-lg">TRMS Submissions</h2>
            {/* Search */}
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
              w={190}
              rightSection={<ListFilter size={16} />}
            />

            <Button
              variant="outline"
              color="#E36C2F"
              radius="xl"
              rightSection={<Upload size={16} />}
              onClick={() => exportTrmsMutation.mutate()}
              loading={exportTrmsMutation.isPending}
              disabled={exportTrmsMutation.isPending}
            >
              Export
            </Button>
          </Group>
        </Group>
      </div>

      <DynamicTableSection
        headers={headers}
        data={submissions}
        loading={isLoading || isFetching}
        renderItems={renderRow}
        emptyTitle="No TRMS Submissions Yet"
        emptyMessage="There are currently no TRMS submissions to display. New submissions will appear here once available."
        pagination={{
          page,
          totalPages: safeTotalPages,
          onNext: () => setPage((p) => Math.min(p + 1, safeTotalPages)),
          onPrevious: () => setPage((p) => Math.max(p - 1, 1)),
          onPageChange: setPage,
        }}
      />
      <SubmissionDetailModal
        opened={isOpen}
        onClose={handleCloseDetails}
        transactionId={selectedTransactionId}
      />
    </div>
  );
}
