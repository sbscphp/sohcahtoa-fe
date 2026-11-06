"use client";

import { useMemo, useState } from "react";
import { Group, Text, TextInput } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { Search } from "lucide-react";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import RowActionIcon from "@/app/admin/_components/RowActionIcon";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import {
  AGENT_FX_TRANSACTIONS,
  type AgentFxTransactionRow,
} from "../../_data/agentFxInventoryMock";
import {
  ExportButton,
  FilterSelect,
  TimestampCell,
  TransactionOverview,
  TypeCell,
  downloadCsv,
  paginate,
} from "./detailShared";

const TRANSACTION_HEADERS = [
  { label: "Transaction ID", key: "id" },
  { label: "Action Date", key: "date" },
  { label: "Type", key: "type" },
  { label: "Transaction Value", key: "value" },
  { label: "Action Effect", key: "effect" },
  { label: "Action", key: "action" },
];

export default function TransactionsTab() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string | null>(null);
  const [debouncedSearch] = useDebouncedValue(search, 350);

  const filtered = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    return AGENT_FX_TRANSACTIONS.filter((row) => {
      const matchesQuery =
        !query ||
        row.transactionId.toLowerCase().includes(query) ||
        row.type.toLowerCase().includes(query);
      const matchesFilter = !filter || row.effect === filter;
      return matchesQuery && matchesFilter;
    });
  }, [debouncedSearch, filter]);

  const pageResult = paginate(filtered, page);

  const renderRow = (item: AgentFxTransactionRow) => [
    <Text key="id" size="sm" fw={500}>
      {item.transactionId}
    </Text>,
    <TimestampCell key="date" date={item.date} time={item.time} />,
    <TypeCell key="type" type={item.type} />,
    <Text key="value" size="sm">
      {item.value}
    </Text>,
    <StatusBadge key="effect" status={item.effect} />,
    <RowActionIcon key="action" onClick={() => undefined} />,
  ];

  const handleExport = () => {
    const dateStamp = new Date().toISOString().slice(0, 10);
    downloadCsv(
      `agent-fx-transactions-${dateStamp}.csv`,
      ["Transaction ID", "Date", "Time", "Type", "Transaction Value", "Action Effect"],
      filtered.map((row) => [
        row.transactionId,
        row.date,
        row.time,
        row.type,
        row.value,
        row.effect,
      ])
    );
  };

  return (
    <div className="space-y-4">
      <TransactionOverview />
      <section className="rounded-lg bg-white p-5">
        <Group justify="space-between" wrap="wrap" mb="md">
          <div className="flex items-center gap-4">
            <h2 className="text-base font-semibold">All Transactions</h2>
            <TextInput
              placeholder="Enter keyword"
              leftSection={<Search size={16} color="#DD4F05" />}
              value={search}
              onChange={(event) => {
                setSearch(event.currentTarget.value);
                setPage(1);
              }}
              w={320}
              radius="xl"
            />
          </div>
          <Group>
            <FilterSelect
              value={filter}
              data={["Posted", "Pending", "Rejected"]}
              onChange={(value) => {
                setFilter(value);
                setPage(1);
              }}
            />
            <ExportButton onClick={handleExport} />
          </Group>
        </Group>
        <DynamicTableSection
          headers={TRANSACTION_HEADERS}
          data={pageResult.rows}
          renderItems={renderRow}
          emptyTitle="No Transactions Found"
          emptyMessage="There are currently no transactions to display."
          pagination={{
            page: pageResult.currentPage,
            totalPages: pageResult.totalPages,
            onNext: () => setPage((value) => Math.min(value + 1, pageResult.totalPages)),
            onPrevious: () => setPage((value) => Math.max(value - 1, 1)),
            onPageChange: setPage,
          }}
        />
      </section>
    </div>
  );
}
