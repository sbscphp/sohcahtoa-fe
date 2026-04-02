"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Group, Text, TextInput, Select } from "@mantine/core";
import { Search, ListFilter } from "lucide-react";
import { useDebouncedValue } from "@mantine/hooks";
import { adminRoutes } from "@/lib/adminRoutes";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import RowActionIcon from "@/app/admin/_components/RowActionIcon";
import {
  useFranchiseTransactions,
  type FranchiseTransactionListItem,
} from "../../../hooks/useFranchiseTransactions";

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

const transactionHeaders = [
  { label: "Transaction ID", key: "transactionId" },
  { label: "Action Date", key: "actionDate" },
  { label: "Branch/Agent", key: "branchAgent" },
  { label: "Type", key: "type" },
  { label: "Action Effect", key: "actionEffect" },
  { label: "Action", key: "action" },
];

const PAGE_SIZE = 10;

const statusOptions = [
  { value: "All", label: "Filter By" },
  { value: "AWAITING_VERIFICATION", label: "Awaiting Verification" },
  { value: "PENDING", label: "Pending" },
  { value: "DRAFT", label: "Draft" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "REQUEST_INFORMATION", label: "Request Information" },
];

interface FranchiseTransactionsTableProps {
  franchiseId: string;
}

export function FranchiseTransactionsTable({ franchiseId }: FranchiseTransactionsTableProps) {
  const router = useRouter();
  const [transactionSearch, setTransactionSearch] = useState("");
  const [transactionFilter, setTransactionFilter] = useState("All");
  const [transactionPage, setTransactionPage] = useState(1);
  const [debouncedSearch] = useDebouncedValue(transactionSearch, 350);

  const queryParams = useMemo(
    () => ({
      page: transactionPage,
      limit: PAGE_SIZE,
      search: debouncedSearch.trim() || undefined,
      status: transactionFilter !== "All" ? transactionFilter : undefined,
    }),
    [debouncedSearch, transactionFilter, transactionPage]
  );

  const { transactions, totalPages, isLoading, isFetching } = useFranchiseTransactions(
    franchiseId,
    queryParams
  );
  const safeTotalPages = Math.max(1, totalPages);

  const renderTransactionRow = (item: FranchiseTransactionListItem) => [
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
            onChange={(e) => {
              setTransactionSearch(e.currentTarget.value);
              setTransactionPage(1);
            }}
          w={320}
          radius="xl"
        />
        <Select
          value={transactionFilter}
          onChange={(value) => {
            setTransactionFilter(value ?? "All");
            setTransactionPage(1);
          }}
          data={statusOptions}
          radius="xl"
          w={190}
          rightSection={<ListFilter size={16} />}
        />
      </Group>
      <DynamicTableSection
        headers={transactionHeaders}
        data={transactions}
        loading={isLoading || isFetching}
        renderItems={renderTransactionRow}
        emptyTitle="No Transactions Found"
        emptyMessage="There are no transactions for this franchise."
        pagination={{
          page: transactionPage,
          totalPages: safeTotalPages,
          onNext: () =>
            setTransactionPage((p) => Math.min(p + 1, safeTotalPages)),
          onPrevious: () => setTransactionPage((p) => Math.max(p - 1, 1)),
          onPageChange: setTransactionPage,
        }}
      />
    </div>
  );
}
