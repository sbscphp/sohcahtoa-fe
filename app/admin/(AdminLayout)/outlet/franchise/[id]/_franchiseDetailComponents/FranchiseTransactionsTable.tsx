"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Group, Text, TextInput, Select, Button } from "@mantine/core";
import { Search, ListFilter, Upload } from "lucide-react";
import { adminRoutes } from "@/lib/adminRoutes";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import RowActionIcon from "@/app/admin/_components/RowActionIcon";

export interface TransactionRow {
  id: string;
  transactionId: string;
  actionDate: string;
  actionTime: string;
  branchName: string;
  agentName: string;
  type: string;
  actionEffect: "Posted" | "Pending" | "Rejected";
}

const TRANSACTIONS_MOCK: TransactionRow[] = [
  { id: "tx1", transactionId: "7844gAGAA563A", actionDate: "September 12, 2025", actionTime: "11:00 am", branchName: "Ikoyi Axis", agentName: "Eddy Ubong", type: "BTA", actionEffect: "Posted" },
  { id: "tx2", transactionId: "7844gAGAA563A", actionDate: "September 12, 2025", actionTime: "11:00 am", branchName: "Victoria Island", agentName: "Sarah Olufemi", type: "PTA", actionEffect: "Pending" },
  { id: "tx3", transactionId: "7844gAGAA563A", actionDate: "September 12, 2025", actionTime: "11:00 am", branchName: "Lekki Phase 1", agentName: "Chinedu Okafor", type: "School Fees", actionEffect: "Rejected" },
  { id: "tx4", transactionId: "7844gAGAA563A", actionDate: "September 12, 2025", actionTime: "11:00 am", branchName: "Surulere", agentName: "Tolu Adebayo", type: "Expatriate", actionEffect: "Pending" },
  { id: "tx5", transactionId: "7844gAGAA563A", actionDate: "September 12, 2025", actionTime: "11:00 am", branchName: "Ikorodu", agentName: "Amanda Nwosu", type: "BTA", actionEffect: "Posted" },
];

const transactionHeaders = [
  { label: "Transaction ID", key: "transactionId" },
  { label: "Action Date", key: "actionDate" },
  { label: "Branch/Agent", key: "branchAgent" },
  { label: "Type", key: "type" },
  { label: "Action Effect", key: "actionEffect" },
  { label: "Action", key: "action" },
];

const PAGE_SIZE = 6;

interface FranchiseTransactionsTableProps {
  franchiseId: string;
}

export function FranchiseTransactionsTable({ franchiseId }: FranchiseTransactionsTableProps) {
  const router = useRouter();
  const [transactionSearch, setTransactionSearch] = useState("");
  const [transactionFilter, setTransactionFilter] = useState("Filter By");
  const [transactionPage, setTransactionPage] = useState(1);

  const filteredTransactions = useMemo(() => {
    return TRANSACTIONS_MOCK.filter((t) => {
      const matchesSearch =
        t.transactionId.toLowerCase().includes(transactionSearch.toLowerCase()) ||
        t.branchName.toLowerCase().includes(transactionSearch.toLowerCase()) ||
        t.agentName.toLowerCase().includes(transactionSearch.toLowerCase()) ||
        t.type.toLowerCase().includes(transactionSearch.toLowerCase());
      const matchesFilter =
        transactionFilter === "Filter By" ||
        transactionFilter === "All" ||
        t.actionEffect === transactionFilter;
      return matchesSearch && matchesFilter;
    });
  }, [transactionSearch, transactionFilter]);

  const transactionTotalPages = Math.ceil(filteredTransactions.length / PAGE_SIZE) || 1;
  const paginatedTransactions = useMemo(() => {
    const start = (transactionPage - 1) * PAGE_SIZE;
    return filteredTransactions.slice(start, start + PAGE_SIZE);
  }, [transactionPage, filteredTransactions]);

  const renderTransactionRow = (item: TransactionRow) => [
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
      onClick={() =>
        router.push(adminRoutes.adminOutletFranchiseTransactionDetail(franchiseId, item.id))
      }
    />,
  ];

  return (
    <div data-franchise-id={franchiseId}>
      <Group justify="space-between" mb="md" wrap="wrap">
        <TextInput
          placeholder="Enter keyword"
          leftSection={<Search size={16} color="#DD4F05" />}
          value={transactionSearch}
          onChange={(e) => setTransactionSearch(e.currentTarget.value)}
          w={320}
          radius="xl"
        />
        <Group>
          <Select
            value={transactionFilter}
            onChange={(value) => setTransactionFilter(value!)}
            data={["Filter By", "All", "Posted", "Pending", "Rejected"]}
            radius="xl"
            w={120}
            rightSection={<ListFilter size={16} />}
          />
          <Button
            variant="filled"
            color="#DD4F05"
            radius="xl"
            rightSection={<Upload size={16} />}
          >
            Export
          </Button>
        </Group>
      </Group>
      <DynamicTableSection
        headers={transactionHeaders}
        data={paginatedTransactions}
        loading={false}
        renderItems={renderTransactionRow}
        emptyTitle="No Transactions Found"
        emptyMessage="There are no transactions for this franchise."
        pagination={{
          page: transactionPage,
          totalPages: transactionTotalPages,
          onNext: () =>
            setTransactionPage((p) => Math.min(p + 1, transactionTotalPages)),
          onPrevious: () => setTransactionPage((p) => Math.max(p - 1, 1)),
          onPageChange: setTransactionPage,
        }}
      />
    </div>
  );
}
