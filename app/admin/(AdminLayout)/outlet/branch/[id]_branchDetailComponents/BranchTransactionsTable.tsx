"use client";

import { useMemo, useState } from "react";
import { Group, Text, TextInput, Select, Button } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { ListFilter, Search, Upload } from "lucide-react";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import RowActionIcon from "@/app/admin/_components/RowActionIcon";
import { useRouter } from "next/navigation";
import { adminRoutes } from "@/lib/adminRoutes";
import { useGetExportData } from "@/app/_lib/api/hooks";
import { notifications } from "@mantine/notifications";
import { adminApi, type BranchTransactionExportParams, type BranchTransactionListParams } from "@/app/admin/_services/admin-api";
import type { BranchTransactionListItem } from "../../hooks/useBranchTransactions";
import { useBranchTransactions } from "../../hooks/useBranchTransactions";
import type { ApiError, ApiResponse } from "@/app/_lib/api/client";

const PAGE_SIZE = 6;

const transactionHeaders = [
  { label: "Transaction ID", key: "transactionId" },
  { label: "Action Date", key: "actionDate" },
  { label: "Branch/Agent", key: "branchAgent" },
  { label: "Type", key: "type" },
  { label: "Action Effect", key: "actionEffect" },
  { label: "Action", key: "action" },
];

const statusOptions = [
  { value: "All", label: "Filter By" },
  { value: "AWAITING_VERIFICATION", label: "Awaiting Verification" },
  { value: "PENDING", label: "Pending" },
  { value: "DRAFT", label: "Draft" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "REQUEST_INFORMATION", label: "Request Information" },
];

export function BranchTransactionsTable({ branchId }: { branchId: string }) {
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [debouncedSearch] = useDebouncedValue(search, 350);

  const queryParams: BranchTransactionListParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      search: debouncedSearch.trim() || undefined,
      status: statusFilter !== "All" ? statusFilter : undefined,
    }),
    [debouncedSearch, page, statusFilter]
  );

  const { transactions, isLoading, isFetching, totalPages } = useBranchTransactions(
    branchId,
    queryParams
  );

  const safeTotalPages = Math.max(1, totalPages);

  const exportParams: BranchTransactionExportParams = useMemo(
    () => ({
      search: debouncedSearch.trim() || undefined,
      status: statusFilter !== "All" ? statusFilter : undefined,
    }),
    [debouncedSearch, statusFilter]
  );

  const exportTransactionsMutation = useGetExportData(
    () =>
      adminApi.outlet.branches.transactions.export(
        branchId,
        exportParams
      ) as Promise<Blob>,
    {
      onSuccess: (csvBlob) => {
        const objectUrl = URL.createObjectURL(csvBlob);
        const link = document.createElement("a");
        const dateStamp = new Date().toISOString().slice(0, 10);

        link.href = objectUrl;
        link.download = `branch-${branchId}-transactions-${dateStamp}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(objectUrl);
      },
      onError: (error) => {
        const apiResponse = (error as unknown as ApiError).data as ApiResponse;
        notifications.show({
          title: "Export Transactions Failed",
          message:
            apiResponse?.error?.message ??
            (error as Error)?.message ??
            "Unable to export branch transactions at the moment. Please try again.",
          color: "red",
        });
      },
    }
  );

  const renderTransactionRow = (item: BranchTransactionListItem) => [
    <Text key="transactionId" size="sm">
      {item.transactionId}
    </Text>,
    <div key="actionDate">
      <Text size="sm">{item.actionDate}</Text>
      <Text size="xs" c="dimmed">
        {item.actionTime}
      </Text>
    </div>,
    <div key="branchAgent">
      <Text fw={500} size="sm">
        {item.branchName}
      </Text>
      <Text size="xs" c="dimmed">
        Agent: {item.agentName}
      </Text>
    </div>,
    <Text key="type" size="sm">
      {item.type}
    </Text>,
    <StatusBadge key="actionEffect" status={item.actionEffect} />,
    <RowActionIcon
      key="action"
      onClick={() => router.push(adminRoutes.adminOutletBranchTransactionDetail(branchId, item.id))}
    />,
  ];

  return (
    <div data-branch-id={branchId}>
      <Group justify="space-between" mb="md" wrap="wrap">
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
        <Group>
          <Select
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value ?? "All");
              setPage(1);
            }}
            data={statusOptions}
            radius="xl"
            w={200}
            rightSection={<ListFilter size={16} />}
          />
          <Button
            variant="filled"
            color="#DD4F05"
            radius="xl"
            rightSection={<Upload size={16} />}
            onClick={() => exportTransactionsMutation.mutate()}
            loading={exportTransactionsMutation.isPending}
            disabled={exportTransactionsMutation.isPending}
          >
            Export
          </Button>
        </Group>
      </Group>

      <DynamicTableSection
        headers={transactionHeaders}
        data={transactions}
        loading={isLoading || isFetching}
        renderItems={renderTransactionRow}
        emptyTitle="No Transactions Found"
        emptyMessage="There are no transactions for this branch."
        pagination={{
          page,
          totalPages: safeTotalPages,
          onNext: () => setPage((p) => Math.min(p + 1, safeTotalPages)),
          onPrevious: () => setPage((p) => Math.max(p - 1, 1)),
          onPageChange: setPage,
        }}
      />
    </div>
  );
}

