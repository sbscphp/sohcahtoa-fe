"use client";

import { useMemo, useState } from "react";
import { Button, Group, Select, Text, TextInput } from "@mantine/core";
import { Search } from "lucide-react";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import RowActionIcon from "@/app/admin/_components/RowActionIcon";
import { useRouter } from "next/navigation";
import { adminRoutes } from "@/lib/adminRoutes";

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

const MOCK_TRANSACTIONS: AgentTransaction[] = [
  {
    id: "7844gAGA563A",
    actionDate: "September 12, 2025",
    actionTime: "11:00 am",
    type: "BTA Buy",
    transactionValue: 1250000,
    status: "Posted",
  },
  {
    id: "7844gAGA563B",
    actionDate: "September 12, 2025",
    actionTime: "11:00 am",
    type: "PTA Buy",
    transactionValue: 875000,
    status: "Pending",
  },
  {
    id: "7844gAGA563C",
    actionDate: "September 12, 2025",
    actionTime: "11:00 am",
    type: "PTA Buy",
    transactionValue: 930500,
    status: "Rejected",
  },
  {
    id: "7844gAGA563D",
    actionDate: "September 12, 2025",
    actionTime: "11:00 am",
    type: "Export Proceeds",
    transactionValue: 1100000,
    status: "Posted",
  },
  {
    id: "7844gAGA563E",
    actionDate: "September 12, 2025",
    actionTime: "11:00 am",
    type: "BTA Buy",
    transactionValue: 790000,
    status: "Pending",
  },
  {
    id: "7844gAGA563F",
    actionDate: "September 12, 2025",
    actionTime: "11:00 am",
    type: "PTA Sell",
    transactionValue: 980000,
    status: "Posted",
  },
];

const formatNaira = (amount: number): string =>
  `₦ ${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function AgentTransactionsTable({
  agentId,
}: AgentTransactionsTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>("All");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const headers = [
    { label: "Transaction ID", key: "transactionId" },
    { label: "Action Date", key: "actionDate" },
    { label: "Type", key: "type" },
    { label: "Transaction Value", key: "transactionValue" },
    { label: "Action Effect", key: "actionEffect" },
    { label: "Action", key: "action" },
  ];

  const filteredTransactions = useMemo(() => {
    const sourceTransactions = agentId ? MOCK_TRANSACTIONS : [];
    return sourceTransactions.filter((tx) => {
      const matchesSearch =
        tx.id.toLowerCase().includes(search.toLowerCase()) ||
        tx.type.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        !statusFilter || statusFilter === "All" || tx.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [agentId, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / pageSize));

  const paginatedTransactions = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredTransactions.slice(start, end);
  }, [filteredTransactions, page, pageSize]);

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