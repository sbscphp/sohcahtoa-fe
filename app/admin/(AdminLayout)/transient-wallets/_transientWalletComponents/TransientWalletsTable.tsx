"use client";

import { useState } from "react";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import RowActionIcon from "@/app/admin/_components/RowActionIcon";
import { Text, Group, TextInput, Select, Button } from "@mantine/core";
import { Search, Upload, ListFilter } from "lucide-react";
import { useDebouncedValue } from "@mantine/hooks";
import { useRouter } from "next/navigation";
import { adminRoutes } from "@/lib/adminRoutes";
import { formatCurrency } from "@/app/utils/helper/formatCurrency";
import {
  useTransientWallets,
  type WalletFilterStatus,
} from "../hooks/useTransientWallets";
import type { TransientWalletListItem } from "../hooks/mockData";
import { MOCK_WALLETS } from "../hooks/mockData";

const pageSize = 10;

const walletHeaders = [
  { label: "Wallet ID", key: "walletId" },
  { label: "Customer ID", key: "customerId" },
  { label: "Customer Name", key: "customerName" },
  { label: "Total Debit", key: "totalDebit" },
  { label: "Total Credit", key: "totalCredit" },
  { label: "Date Created", key: "dateCreated" },
  { label: "Action", key: "action" },
];

function exportWalletsCsv(wallets: TransientWalletListItem[]) {
  const headers = [
    "Wallet ID",
    "Customer ID",
    "Customer Name",
    "Total Debit",
    "Total Credit",
    "Date Created",
  ];
  const rows = wallets.map((w) =>
    [
      w.walletId,
      w.customerId,
      w.customerName,
      w.totalDebit,
      w.totalCredit,
      `${w.dateCreated} ${w.timeCreated}`,
    ].join(",")
  );
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `transient-wallets-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function TransientWalletsTable() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<WalletFilterStatus>("All");
  const [debouncedSearch] = useDebouncedValue(search, 350);

  const { wallets, isLoading, isFetching, totalPages } = useTransientWallets({
    page,
    limit: pageSize,
    search: debouncedSearch.trim() || undefined,
    status: statusFilter,
  });

  const safeTotalPages = Math.max(1, totalPages);

  const renderRow = (item: TransientWalletListItem) => [
    <Text key="walletId" size="sm" fw={500}>
      {item.walletId}
    </Text>,
    <Text key="customerId" size="sm">
      {item.customerId}
    </Text>,
    <Text key="customerName" size="sm">
      {item.customerName}
    </Text>,
    <Text key="totalDebit" size="sm" className="text-red-600">
      -{formatCurrency(item.totalDebit)}
    </Text>,
    <Text key="totalCredit" size="sm" className="text-blue-600">
      +{formatCurrency(item.totalCredit)}
    </Text>,
    <div key="dateCreated">
      <Text size="sm">{item.dateCreated}</Text>
      <Text size="xs" c="dimmed">
        {item.timeCreated}
      </Text>
    </div>,
    <RowActionIcon
      key="action"
      onClick={() =>
        router.push(adminRoutes.adminTransientWalletDetails(item.id))
      }
    />,
  ];

  const handleExport = () => {
    exportWalletsCsv(MOCK_WALLETS);
  };

  return (
    <div className="my-5 rounded-lg bg-white p-5">
      <Group justify="space-between" mb="md" wrap="wrap">
        <div className="flex flex-wrap items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900">
            All Transient Wallets
          </h2>
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
              setStatusFilter((value as WalletFilterStatus) ?? "All");
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
        headers={walletHeaders}
        data={wallets}
        loading={isLoading || isFetching}
        renderItems={renderRow}
        emptyTitle="No Wallets Found"
        emptyMessage="There are currently no transient wallets to display."
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
