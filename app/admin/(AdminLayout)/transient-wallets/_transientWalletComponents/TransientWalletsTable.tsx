"use client";

import { useMemo, useState } from "react";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import RowActionIcon from "@/app/admin/_components/RowActionIcon";
import { Text, Group, TextInput, Select, Button } from "@mantine/core";
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
  useTransientWallets,
  type TransientWalletListItem,
} from "../hooks/useTransientWallets";

const pageSize = 10;

const sortOptions = [
  { value: "desc", label: "Newest first" },
  { value: "asc", label: "Oldest first" },
];

const walletHeaders = [
  { label: "Wallet ID", key: "walletId" },
  { label: "Customer", key: "customer" },
  { label: "Total Debit", key: "totalDebit" },
  { label: "Total Credit", key: "totalCredit" },
  { label: "Date Created", key: "dateCreated" },
  { label: "Action", key: "action" },
];

export default function TransientWalletsTable() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [debouncedSearch] = useDebouncedValue(search, 350);

  const { wallets, isLoading, isFetching, isError, totalPages } = useTransientWallets({
    page,
    limit: pageSize,
    search: debouncedSearch.trim() || undefined,
    sortOrder,
  });

  const exportParams = useMemo(
    () => ({
      search: debouncedSearch.trim() || undefined,
      sortOrder,
    }),
    [debouncedSearch, sortOrder]
  );

  const exportWalletsMutation = useGetExportData(
    () => adminApi.wallet.export(exportParams),
    {
      onSuccess: (csvBlob) => {
        const objectUrl = URL.createObjectURL(csvBlob);
        const link = document.createElement("a");
        const dateStamp = new Date().toISOString().slice(0, 10);

        link.href = objectUrl;
        link.download = `transient-wallets-${dateStamp}.csv`;
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
          title: "Export Wallets Failed",
          message:
            apiResponse?.error?.message ??
            error.message ??
            "Unable to export transient wallets at the moment. Please try again.",
          color: "red",
        });
      },
    }
  );

  const safeTotalPages = Math.max(1, totalPages);

  const renderRow = (item: TransientWalletListItem) => [
    <Text key="walletId" size="sm" fw={500}>
      {item.walletId}
    </Text>,
    <div key="customer">
      <Text fw={500} size="sm">
        {item.customerName}
      </Text>
      <Text size="xs" c="dimmed">
        ID:{item.customerId || "--"}
      </Text>
    </div>,
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
            value={sortOrder}
            onChange={(value) => {
              setSortOrder((value as "asc" | "desc") ?? "desc");
              setPage(1);
            }}
            data={sortOptions}
            radius="xl"
            w={140}
            rightSection={<ListFilter size={16} />}
          />
          <Button
            variant="outline"
            color="#E36C2F"
            radius="xl"
            rightSection={<Upload size={16} />}
            onClick={() => exportWalletsMutation.mutate()}
            loading={exportWalletsMutation.isPending}
            disabled={exportWalletsMutation.isPending}
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
      {isError ? (
        <Text c="red" size="sm" mt="sm">
          Unable to load transient wallets right now. Please try again.
        </Text>
      ) : null}
    </div>
  );
}
