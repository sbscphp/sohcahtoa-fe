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
import { useFetchDataSeperateLoading } from "@/app/_lib/api/hooks";
import { adminApi } from "@/app/admin/_services/admin-api";
import { adminKeys } from "@/app/_lib/api/query-keys";

type TransactionStatus = "Posted" | "Pending" | "Rejected";

interface AgentTransaction {
  id: string;
  actionDate: string;
  actionTime: string;
  type: string;
  transactionValue: number;
  status: TransactionStatus;
}

interface AgentTransactionsTableProps {
  agentId: string;
}

interface ApiTransactionItem {
  id?: string;
  actionDate?: string;
  actionTime?: string;
  type?: string;
  transactionValue?: number | string;
  status?: string;
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

const formatNaira = (amount: number): string =>
  `₦ ${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

function parseNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) return numeric;
  }
  return 0;
}

function toStatus(value?: string): TransactionStatus {
  const normalized = (value ?? "").toLowerCase();
  if (normalized === "pending") return "Pending";
  if (normalized === "rejected") return "Rejected";
  return "Posted";
}

function mapTransaction(item: ApiTransactionItem): AgentTransaction {
  return {
    id: item.id ?? "—",
    actionDate: item.actionDate ?? "—",
    actionTime: item.actionTime ?? "—",
    type: item.type ?? "—",
    transactionValue: parseNumber(item.transactionValue),
    status: toStatus(item.status),
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
  const statusParam =
    !statusFilter || statusFilter === "All" ? undefined : statusFilter;

  const query = useFetchDataSeperateLoading<AgentTransactionsResponse>(
    agentId
      ? [
          ...adminKeys.agent.transactions(agentId, {
            page,
            limit: pageSize,
            status: statusParam,
          }),
        ]
      : [],
    () =>
      adminApi.agent.transactions(agentId, {
        page,
        limit: pageSize,
        status: statusParam,
      }) as unknown as Promise<AgentTransactionsResponse>,
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

  const filteredTransactions = useMemo(() => {
    return entries.filter((tx) => {
      const matchesSearch =
        tx.id.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        tx.type.toLowerCase().includes(debouncedSearch.toLowerCase());

      const matchesStatus = !statusParam || tx.status === statusParam;

      return matchesSearch && matchesStatus;
    });
  }, [entries, debouncedSearch, statusParam]);

  const totalPages = Math.max(1, query.data?.metadata?.pagination?.totalPages ?? 1);

  const paginatedTransactions = useMemo(() => {
    return filteredTransactions;
  }, [filteredTransactions]);

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
      {formatNaira(tx.transactionValue)}
    </Text>,
    <StatusBadge key="actionEffect" status={tx.status} />,
    <RowActionIcon
      key="action"
      onClick={() => {
        router.push(adminRoutes.adminAgentTransactions(tx.id));
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

          <Button variant="outline" color="#E36C2F" radius="xl">
            Export
          </Button>
        </Group>
      </Group>

      <DynamicTableSection
        headers={headers}
        data={paginatedTransactions}
        loading={query.isLoading}
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