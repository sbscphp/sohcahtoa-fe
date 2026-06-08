"use client";

import { useMemo, useState } from "react";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import RowActionIcon from "@/app/admin/_components/RowActionIcon";
import { Text, Group, TextInput, Select, Button, Alert } from "@mantine/core";
import { Search, Upload, ListFilter } from "lucide-react";
import { useDebouncedValue } from "@mantine/hooks";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";
import { adminRoutes } from "@/lib/adminRoutes";
import { formatCurrency } from "@/app/utils/helper/formatCurrency";
import { useGetExportData } from "@/app/_lib/api/hooks";
import { adminApi } from "@/app/admin/_services/admin-api";
import type { ApiError, ApiResponse } from "@/app/_lib/api/client";
import {
  useTransientWalletLedger,
  type TransientLedgerEntry,
} from "../hooks/useTransientWalletLedger";

const pageSize = 20;

const TYPE_FILTER_OPTIONS = [
  { value: "", label: "All" },
  { value: "DEBIT", label: "Debit" },
  { value: "CREDIT", label: "Credit" },
];

const ledgerHeaders = [
  { label: "Entry ID", key: "entryId" },
  { label: "Date & Time", key: "dateTime" },
  { label: "Session ID", key: "sessionId" },
  { label: "Type", key: "type" },
  { label: "Amount", key: "amount" },
  { label: "Status", key: "status" },
  { label: "Action", key: "action" },
];

interface WalletLedgerTableProps {
  walletId: string;
}

export default function WalletLedgerTable({ walletId }: WalletLedgerTableProps) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"" | "DEBIT" | "CREDIT">("");
  const [debouncedSearch] = useDebouncedValue(search, 350);

  const { entries, isLoading, isFetching, isError, totalPages } =
    useTransientWalletLedger({
      walletId,
      page,
      limit: pageSize,
      search: debouncedSearch.trim() || undefined,
      type: typeFilter,
    });

  const exportParams = useMemo(
    () => ({
      search: debouncedSearch.trim() || undefined,
      type: typeFilter || undefined,
    }),
    [debouncedSearch, typeFilter]
  );

  const exportLedgerMutation = useGetExportData(
    () => adminApi.wallet.ledgerExport(walletId, exportParams),
    {
      onSuccess: (csvBlob) => {
        const objectUrl = URL.createObjectURL(csvBlob);
        const link = document.createElement("a");
        const dateStamp = new Date().toISOString().slice(0, 10);

        link.href = objectUrl;
        link.download = `wallet-ledger-${walletId}-${dateStamp}.csv`;
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
          title: "Export Ledger Failed",
          message:
            apiResponse?.error?.message ??
            error.message ??
            "Unable to export wallet ledger at the moment. Please try again.",
          color: "red",
        });
      },
    }
  );

  const safeTotalPages = Math.max(1, totalPages);

  const renderRow = (item: TransientLedgerEntry) => [
    <div key="entryId">
      <Text size="sm" fw={500} className="max-w-[200px] truncate">
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
      {item.type === "Credit" ? "+" : "-"}
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
            value={typeFilter}
            onChange={(value) => {
              setTypeFilter((value as "" | "DEBIT" | "CREDIT") ?? "");
              setPage(1);
            }}
            data={TYPE_FILTER_OPTIONS}
            radius="xl"
            w={120}
            rightSection={<ListFilter size={16} />}
          />
          <Button
            variant="outline"
            color="#E36C2F"
            radius="xl"
            rightSection={<Upload size={16} />}
            loading={exportLedgerMutation.isPending}
            onClick={() => exportLedgerMutation.mutate()}
          >
            Export
          </Button>
        </Group>
      </Group>

      {isError ? (
        <Alert color="red" title="Unable to load ledger entries" mb="md">
          Please try again or refresh the page.
        </Alert>
      ) : null}

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
