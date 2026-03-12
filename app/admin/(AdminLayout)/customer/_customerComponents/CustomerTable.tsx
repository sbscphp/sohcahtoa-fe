"use client";

import { useState } from "react";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import {
  Text,
  Group,
  TextInput,
  Select,
  Button,
} from "@mantine/core";
import { Search, Upload, ListFilter } from "lucide-react";
import { useRouter } from "next/navigation";
import RowActionIcon from "@/app/admin/_components/RowActionIcon";
import { adminRoutes } from "@/lib/adminRoutes";
import { useDebouncedValue } from "@mantine/hooks";
import { useCustomers, type CustomerRowItem } from "../hooks/useCustomers";
import { useGetExportData } from "@/app/_lib/api/hooks";
import { adminApi } from "@/app/admin/_services/admin-api";
import { notifications } from "@mantine/notifications";
import type { ApiError, ApiResponse } from "@/app/_lib/api/client";

/* --------------------------------------------
 Types
--------------------------------------------- */
type Customer = CustomerRowItem;

/* --------------------------------------------
 Format Currency Helper
--------------------------------------------- */
const formatNaira = (amount: number): string => {
  return `₦ ${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/* --------------------------------------------
 Component
--------------------------------------------- */
export default function CustomerTable() {
  /* Pagination state */
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 350);
  const [filter, setFilter] = useState("Filter By");
  const router = useRouter();
  const isActive =
    filter === "Active" ? true : filter === "Deactivated" ? false : undefined;
  const { customers, isLoading, totalPages } = useCustomers({
    page,
    limit: pageSize,
    search: debouncedSearch || undefined,
    isActive,
  });
  const exportCustomersMutation = useGetExportData(
    () =>
      adminApi.customers.export({
        search: debouncedSearch || undefined,
        isActive,
      }),
    {
      onSuccess: (csvBlob) => {
        const objectUrl = URL.createObjectURL(csvBlob);
        const link = document.createElement("a");
        const dateStamp = new Date().toISOString().slice(0, 10);

        link.href = objectUrl;
        link.download = `customers-${dateStamp}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(objectUrl);
      },
      onError: (error) => {
        const apiResponse = (error as unknown as ApiError).data as ApiResponse;
        notifications.show({
          title: "Export Customers Failed",
          message:
            apiResponse?.error?.message ??
            error.message ??
            "Unable to export customers at the moment. Please try again.",
          color: "red",
        });
      },
    }
  );

  /* Table headers */
  const customerHeaders = [
    { label: "Customer", key: "customer" },
    { label: "Contact", key: "contact" },
    { label: "Total Transactions", key: "totalTransactions" },
    { label: "Transaction Volume", key: "transactionVolume" },
    { label: "Status", key: "status" },
    { label: "Action", key: "action" },
  ];

  /* Row renderer */
  const renderCustomerRow = (item: Customer) => [
    // Customer
    <div key="customer">
      <Text fw={500} size="sm">
        {item.customerName}
      </Text>
      <Text size="xs" c="dimmed">
        ID:{item.id}
      </Text>
    </div>,

    // Contact
    <div key="contact">
      <Text fw={500} size="sm">
        {item.phone}
      </Text>
      <Text size="xs" c="dimmed">
        {item.email}
      </Text>
    </div>,

    // Total Transactions
    <Text key="totalTransactions" size="sm">
      {item.totalTransactions}
    </Text>,

    // Transaction Volume
    <Text key="transactionVolume" size="sm" fw={500}>
      {formatNaira(item.transactionVolume)}
    </Text>,

    // Status
    <StatusBadge key="status" status={item.status} />,

    // Action
    <RowActionIcon
      key="action"
      onClick={() => {
        if (!item.id) return;
        router.push(adminRoutes.adminCustomerDetails(item.id));
      }}
    />
  ];

  return (
    <div className="my-5 p-5 rounded-lg bg-white">
      <div>
        <Group justify="space-between" mb="md" wrap="nowrap">
          <div className="flex items-center gap-4">
            <h2 className="font-semibold text-lg">All Customers</h2>
            {/* Search */}
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
            {/* Filter */}
            <Select
              value={filter}
              onChange={(value) => {
                setFilter(value ?? "Filter By");
                setPage(1);
              }}
              data={["Filter By", "All", "Active", "Deactivated"]}
              radius="xl"
              w={120}
              rightSection={<ListFilter size={16} />}
            />

            {/* Export */}
            <Button
              variant="filled"
              color="#E36C2F"
              radius="xl"
              rightSection={<Upload size={16} />}
              onClick={() => exportCustomersMutation.mutate()}
              loading={exportCustomersMutation.isPending}
              disabled={exportCustomersMutation.isPending}
            >
              Export
            </Button>
          </Group>
        </Group>
      </div>

      <DynamicTableSection
        headers={customerHeaders}
        data={customers}
        loading={isLoading}
        renderItems={renderCustomerRow}
        emptyTitle="No Customers Found"
        emptyMessage="There are currently no customers to display. Customers will appear here once they create accounts."
        pagination={{
          page,
          totalPages,
          onNext: () => setPage((p) => Math.min(p + 1, totalPages)),
          onPrevious: () => setPage((p) => Math.max(p - 1, 1)),
          onPageChange: setPage,
        }}
      />
    </div>
  );
}
