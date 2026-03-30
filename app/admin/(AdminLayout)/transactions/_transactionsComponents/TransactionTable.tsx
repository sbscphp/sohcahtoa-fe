"use client";

import { useMemo, useState } from "react";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import RowActionIcon from "@/app/admin/_components/RowActionIcon";
import { Text, Group, TextInput, Select, Button } from "@mantine/core";
import { Search, Upload, ListFilter } from "lucide-react";
import { Tabs } from "@mantine/core";
import { useRouter } from "next/navigation";
import AdminTabButton from "@/app/admin/_components/AdminTabButton";
import { useDebouncedValue } from "@mantine/hooks";
import {
  useTransactions,
  type TransactionListItem,
} from "../hooks/useTransactions";
import { useGetExportData } from "@/app/_lib/api/hooks";
import { notifications } from "@mantine/notifications";
import { adminApi } from "@/app/admin/_services/admin-api";
import type { ApiError, ApiResponse } from "@/app/_lib/api/client";
import { adminRoutes } from "@/lib/adminRoutes";
import { formatCurrency } from "@/app/utils/helper/formatCurrency";

const pageSize = 5;

const typeByTab = {
  "buy-fx": "buyfx",
  "sell-fx": "sellfx",
  "receive-fx": "receivefx",
} as const;

const statusOptions = [
  { value: "All", label: "Filter By" },
  { value: "AWAITING_VERIFICATION", label: "Awaiting Verification" },
  { value: "PENDING", label: "Pending" },
  { value: "DRAFT", label: "Draft" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "REQUEST_INFORMATION", label: "Request Information" },
];

export default function TransactionsTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [activeTab, setActiveTab] = useState<keyof typeof typeByTab>("buy-fx");
  const [debouncedSearch] = useDebouncedValue(search, 350);
  const router = useRouter();

  const exportParams = useMemo(
    () => ({
      page,
      limit: pageSize,
      search: debouncedSearch || undefined,
      status: statusFilter !== "All" ? statusFilter : undefined,
      type: typeByTab[activeTab],
    }),
    [activeTab, debouncedSearch, page, statusFilter]
  );

  const { transactions, isLoading, isFetching, totalPages } = useTransactions({
    page,
    limit: pageSize,
    search: debouncedSearch || undefined,
    status: statusFilter !== "All" ? statusFilter : undefined,
    type: typeByTab[activeTab],
  });

  const safeTotalPages = Math.max(1, totalPages);

  const exportTransactionsMutation = useGetExportData(
    () => adminApi.transactions.export(exportParams),
    {
      onSuccess: (csvBlob) => {
        const objectUrl = URL.createObjectURL(csvBlob);
        const link = document.createElement("a");
        const dateStamp = new Date().toISOString().slice(0, 10);

        link.href = objectUrl;
        link.download = `admin-transactions-${dateStamp}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(objectUrl);
      },
      onError: (error) => {
        const apiResponse = (error as unknown as ApiError).data as
          | ApiResponse
          | undefined;

        notifications.show({
          title: "Export Transactions Failed",
          message:
            apiResponse?.error?.message ??
            error.message ??
            "Unable to export transactions at the moment. Please try again.",
          color: "red",
        });
      },
    }
  );

  const transactionHeaders = [
    { label: "Customer Name", key: "customer" },
    { label: "Date and ID", key: "date" },
    { label: "Transaction Type", key: "type" },
    { label: "Transaction Stage", key: "stage" },
    { label: "Workflow Stage", key: "workflow" },
    { label: "Transaction Value", key: "amount" },
    { label: "Status", key: "status" },
    { label: "Action", key: "action" },
  ];

  const renderTransactionRow = (item: TransactionListItem) => [
    <div key="customer">
      <Text fw={500} size="sm">
        {item.customerName}
      </Text>
      <Text size="xs" c="dimmed">
        ID:{item.id || "--"}
      </Text>
    </div>,

    <div key="date">
      <Text size="sm">{item.date}</Text>
      <Text size="xs" c="dimmed">
        Ref:{item.reference || "--"}
      </Text>
    </div>,

    <Text key="type" size="sm">
      {item.type}
    </Text>,

    <Text key="stage" size="sm">
      {item.stage}
    </Text>,

    <Text key="workflow" size="sm">
      {item.workflow}
    </Text>,

    <Text key="amount" size="sm">
      {formatCurrency(item.amount)}
    </Text>,

    <StatusBadge key="status" status={item.status} />,

    <RowActionIcon
      key="action"
      onClick={() => router.push(adminRoutes.adminTransactionDetails(item.id))}
    />,
  ];

  return (
    <div className="my-5 p-5 rounded-lg bg-white">
      <div>
        <Group justify="space-between" mb="md" wrap="wrap">
          <div className="flex items-center gap-4">
            <h2 className="font-semibold text-lg">All Transactions</h2>
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
                setStatusFilter(value ?? "All");
                setPage(1);
              }}
              data={statusOptions}
              radius="xl"
              w={150}
              rightSection={<ListFilter size={16} />}
            />

            <Button
              variant="outline"
              color="#E36C2F"
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
      </div>

      <Tabs
        className="mt-8!"
        color="orange"
        value={activeTab}
        onChange={(value) => {
          const nextTab = (value ?? "buy-fx") as keyof typeof typeByTab;
          setActiveTab(nextTab);
          setPage(1);
        }}
      >
        <Tabs.List className="mb-4 border-0! before:content-none!">
          <AdminTabButton value="buy-fx">Buy FX</AdminTabButton>
          <AdminTabButton value="sell-fx">Sell FX</AdminTabButton>
          <AdminTabButton value="receive-fx">Receive FX</AdminTabButton>
        </Tabs.List>

        <Tabs.Panel value={activeTab}>
          <DynamicTableSection
            headers={transactionHeaders}
            data={transactions}
            loading={isLoading || isFetching}
            renderItems={renderTransactionRow}
            emptyTitle="No Data Available Yet"
            emptyMessage="You currently don't have any data available yet. Check back later."
            pagination={{
              page,
              totalPages: safeTotalPages,
              onNext: () => setPage((p) => Math.min(p + 1, safeTotalPages)),
              onPrevious: () => setPage((p) => Math.max(p - 1, 1)),
              onPageChange: setPage,
            }}
          />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}
