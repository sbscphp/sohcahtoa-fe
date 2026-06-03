"use client";

import { useState } from "react";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import RowActionIcon from "@/app/admin/_components/RowActionIcon";
import { Text, Group, TextInput, Select, Button } from "@mantine/core";
import { Search, Upload, ListFilter } from "lucide-react";
import { useDebouncedValue } from "@mantine/hooks";
import { useRouter } from "next/navigation";
import { adminRoutes } from "@/lib/adminRoutes";
import { formatCurrency } from "@/app/utils/helper/formatCurrency";
import { useTransientWalletLedger } from "../hooks/useTransientWalletLedger";
import type { TransientLedgerEntry, LedgerEntryStatus } from "../hooks/mockData";
import { MOCK_LEDGER_ENTRIES } from "../hooks/mockData";

const pageSize = 10;

const ledgerHeaders = [
  { label: "Entry ID", key: "entryId" },
  { label: "Date & Time", key: "dateTime" },
  { label: "Session ID", key: "sessionId" },
  { label: "Type", key: "type" },
  { label: "Amount", key: "amount" },
  { label: "Status", key: "status" },
  { label: "Action", key: "action" },
];

function exportLedgerCsv(entries: TransientLedgerEntry[]) {
  const headers = [
    "Entry ID",
    "Date",
    "Time",
    "Session ID",
    "Type",
    "Amount",
    "Status",
  ];
  const rows = entries.map((e) =>
    [e.entryId, e.date, e.time, e.sessionId, e.type, e.amount, e.status].join(
      ","
    )
  );
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `wallet-ledger-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

interface WalletLedgerTableProps {
  walletId: string;
}

export default function WalletLedgerTable({ walletId }: WalletLedgerTableProps) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LedgerEntryStatus | "All">(
    "All"
  );
  const [debouncedSearch] = useDebouncedValue(search, 350);

  const { entries, isLoading, isFetching, totalPages } =
    useTransientWalletLedger({
      walletId,
      page,
      limit: pageSize,
      search: debouncedSearch.trim() || undefined,
      status: statusFilter,
    });

  const safeTotalPages = Math.max(1, totalPages);

  const renderRow = (item: TransientLedgerEntry) => [
    <div key="entryId">
      <Text size="sm" fw={500}>
        ID:{item.entryId}
      </Text>
    </div>,
    <div key="dateTime">
      <Text size="sm">{item.date}</Text>
      <Text size="xs" c="dimmed">
        {item.time}
      </Text>
    </div>,
    <Text key="sessionId" size="sm" className="max-w-[180px] truncate">
      {item.sessionId}
    </Text>,
    <Text
      key="type"
      size="sm"
      fw={500}
      className={item.type === "Credit" ? "text-blue-600" : "text-red-600"}
    >
      {item.type}
    </Text>,
    <Text key="amount" size="sm">
      {formatCurrency(item.amount)}
    </Text>,
    <StatusBadge key="status" status={item.status} />,
    <RowActionIcon
      key="action"
      onClick={() =>
        router.push(
          adminRoutes.adminTransientWalletEntryDetails(walletId, item.id)
        )
      }
    />,
  ];

  const handleExport = () => {
    const walletEntries = MOCK_LEDGER_ENTRIES.filter(
      (e) => e.walletId === walletId
    );
    exportLedgerCsv(walletEntries);
  };

  return (
    <div className="rounded-lg bg-white p-5 shadow-sm">
      <Group justify="space-between" mb="md" wrap="wrap">
        <div className="flex flex-wrap items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900">Wallet Ledger</h2>
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
              setStatusFilter((value as LedgerEntryStatus | "All") ?? "All");
              setPage(1);
            }}
            data={["All", "Matched", "Unmatched"]}
            radius="xl"
            w={120}
            rightSection={<ListFilter size={16} />}
          />
          <Button
            variant="outline"
            color="#E36C2F"
            radius="xl"
            rightSection={<Upload size={16} />}
            onClick={handleExport}
          >
            Export
          </Button>
        </Group>
      </Group>

      <DynamicTableSection
        headers={ledgerHeaders}
        data={entries}
        loading={isLoading || isFetching}
        renderItems={renderRow}
        emptyTitle="No Ledger Entries Found"
        emptyMessage="There are currently no ledger entries for this wallet."
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
