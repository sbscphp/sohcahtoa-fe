"use client";

import { useMemo, useState } from "react";
import { Button, Group, Select, Text, TextInput } from "@mantine/core";
import { Search } from "lucide-react";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import RowActionIcon from "@/app/admin/_components/RowActionIcon";
import { useRouter } from "next/navigation";
import { adminRoutes } from "@/lib/adminRoutes";
import { useDebouncedValue } from "@mantine/hooks";
import {
  useFetchDataSeperateLoading,
  useGetExportData,
} from "@/app/_lib/api/hooks";
import { adminApi } from "@/app/admin/_services/admin-api";
import { adminKeys } from "@/app/_lib/api/query-keys";
import { notifications } from "@mantine/notifications";
import { formatCurrency } from "@/app/utils/helper/formatCurrency";

type TransactionStatus = "Posted" | "Pending" | "Rejected";

interface AgentTransaction {
  id: string;
  actionDate: string;
  actionTime: string;
  type: string;
  transactionValue: number;
  transactionCurrency?: string;
  referenceNumber?: string;
  status: TransactionStatus;
}

interface AgentTransactionsTableProps {
  agentId: string;
}

interface ApiTransactionItem {
  transactionId?: string;
  referenceNumber?: string;
  type?: string;
  status?: string;
  stage?: string;
  value?: number | string;
  currency?: string;
  pickup?: unknown | null;
  createdAt?: string;
}

interface AgentTransactionsResponse {
  success: boolean;
  data: ApiTransactionItem[];
  metadata?: {
    pagination?: {
      page?: number;
      limit?: number;
      total?: number;
      totalPages?: number;
    };
  } | null;
}

interface AgentTransactionQueryParams {
  page: number;
  limit: number;
  search?: string;
  status?: string;
}

interface AgentTransactionExportParams {
  search?: string;
  status?: string;
}

function parseNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) return numeric;
  }
  return 0;
}

function mapApiStatusToUi(value?: string): TransactionStatus {
  const normalized = (value ?? "").toUpperCase().trim();
  if (normalized === "REJECTED") return "Rejected";
  if (normalized === "AWAITING_VERIFICATION") return "Pending";
  if (normalized === "SETTLED") return "Posted";
  if (normalized === "POSTED") return "Posted";
  // Fallback: treat unknown statuses as pending.
  return "Pending";
}

function formatDate(value?: string): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatTime(value?: string): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function mapTransaction(item: ApiTransactionItem): AgentTransaction {
  return {
    id: item.transactionId ?? "—",
    actionDate: formatDate(item.createdAt),
    actionTime: formatTime(item.createdAt),
    type: item.type ?? "—",
    transactionValue: parseNumber(item.value),
    transactionCurrency: item.currency,
    referenceNumber: item.referenceNumber,
    status: mapApiStatusToUi(item.status),
  };
}

export default function AgentTransactionsTable({
  agentId,
}: AgentTransactionsTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const [statusFilter, setStatusFilter] = useState<string | null>("All");
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const queryParams: AgentTransactionQueryParams = useMemo(() => {
    const uiStatus =
      !statusFilter || statusFilter === "All"
        ? undefined
        : (statusFilter as TransactionStatus);

    const status =
      uiStatus === "Pending"
        ? "AWAITING_VERIFICATION"
        : uiStatus === "Posted"
          ? "SETTLED"
          : uiStatus === "Rejected"
            ? "REJECTED"
            : undefined;

    return {
      page,
      limit: pageSize,
      search: debouncedSearch.trim() || undefined,
      status,
    };
  }, [debouncedSearch, page, pageSize, statusFilter]);

  const query = useFetchDataSeperateLoading<AgentTransactionsResponse>(
    agentId
      ? [...adminKeys.agent.transactions(agentId, queryParams)]
      : [],
    () =>
      adminApi.agent.transactions(
        agentId,
        queryParams
      ) as unknown as Promise<AgentTransactionsResponse>,
    !!agentId
  );

  const headers = [
    { label: "Transaction ID", key: "transactionId" },
    { label: "Action Date", key: "actionDate" },
    { label: "Type", key: "type" },
    { label: "Transaction Value", key: "transactionValue" },
    { label: "Action Effect", key: "actionEffect" },
    { label: "Action", key: "action" },
  ];

  const entries = (Array.isArray(query.data?.data) ? query.data.data : []).map(
    mapTransaction
  );

  const exportParams: AgentTransactionExportParams = useMemo(
    () => ({
      search: queryParams.search,
      status: queryParams.status,
    }),
    [queryParams.search, queryParams.status]
  );

  const exportTransactionsMutation = useGetExportData(
    () =>
      adminApi.agent.transactionsExport(
        agentId,
        exportParams
      ) as Promise<Blob>,
    {
      onSuccess: (csvBlob) => {
        const objectUrl = URL.createObjectURL(csvBlob);
        const link = document.createElement("a");
        const dateStamp = new Date().toISOString().slice(0, 10);

        link.href = objectUrl;
        link.download = `agent-${agentId}-transactions-${dateStamp}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(objectUrl);
      },
      onError: (error) => {
        notifications.show({
          title: "Export Transactions Failed",
          message:
            error instanceof Error
              ? error.message
              : "Unable to export agent transactions at the moment. Please try again.",
          color: "red",
        });
      },
    }
  );

  const totalPages = Math.max(1, query.data?.metadata?.pagination?.totalPages ?? 1);

  const renderTransactionRow = (tx: AgentTransaction) => [
    <Text key="transactionId" size="sm" fw={500}>
      {tx.id}
    </Text>,
    <div key="actionDate" className="flex flex-col">
      <Text size="sm">{tx.actionDate}</Text>
      <Text size="xs" c="dimmed">
        {tx.actionTime}
      </Text>
    </div>,
    <Text key="type" size="sm">
      {tx.type}
    </Text>,
    <Text key="transactionValue" size="sm" fw={500}>
      {formatCurrency(tx.transactionValue, tx.transactionCurrency)}
    </Text>,
    <StatusBadge key="actionEffect" status={tx.status} />,
    <RowActionIcon
      key="action"
      onClick={() => {
        router.push(
          adminRoutes.adminAgentTransactionDetails(agentId, tx.id)
        );
      }}
    />,
  ];

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <Group justify="space-between" mb="md" wrap="wrap">
        <Text fw={600} size="md">
          Agent Transactions
        </Text>

        <Group gap="sm" wrap="wrap">
          <TextInput
            placeholder="Enter keyword"
            leftSection={<Search size={16} color="#DD4F05" />}
            value={search}
            onChange={(e) => {
              setSearch(e.currentTarget.value);
              setPage(1);
            }}
            radius="xl"
            w={260}
          />

          <Select
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}
            data={["All", "Posted", "Pending", "Rejected"]}
            radius="xl"
            w={140}
            placeholder="Filter By"
          />

          <Button
            variant="outline"
            color="#E36C2F"
            radius="xl"
            onClick={() => exportTransactionsMutation.mutate()}
            loading={exportTransactionsMutation.isPending}
            disabled={exportTransactionsMutation.isPending}
          >
            Export
          </Button>
        </Group>
      </Group>

      <DynamicTableSection
        headers={headers}
        data={entries}
        loading={query.isLoading || query.isFetching}
        renderItems={renderTransactionRow}
        emptyTitle="No Transactions Found"
        emptyMessage="There are currently no transactions for this agent."
        pagination={{
          page,
          totalPages,
          onNext: () => setPage((prev) => Math.min(prev + 1, totalPages)),
          onPrevious: () => setPage((prev) => Math.max(prev - 1, 1)),
          onPageChange: setPage,
        }}
      />
    </div>
  );
}