"use client";

import { ActionButton } from "@/app/admin/_components/ActionButton";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import type { AgentCustomerSummary } from "@/app/_lib/api/types";
import SearchInput from "@/app/admin/_components/SearchInput";
import { formatLocalDate, formatShortTime } from "@/app/utils/helper/formatLocalDate";
import { Badge, Button, Group, Select, Text } from "@mantine/core";
import { ArrowUpRight, ListFilter, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

interface Customer {
  customerName: string;
  id: string;
  customerType: "Resident" | "Tourist" | "Expatriate";
  lastTransactionType: string;
  dateRegistered: string;
  kycStatus: "Pending" | "Approved" | "Rejected";
}

interface CustomerTableProps {
  customers?: AgentCustomerSummary[];
  loading?: boolean;
}

const getKYCStatusColor = (status: string) => {
  switch (status) {
    case "Pending":
      return "orange";
    case "Approved":
      return "green";
    case "Rejected":
      return "red";
    default:
      return "gray";
  }
};

const mapApiCustomerToTable = (item: AgentCustomerSummary): Customer => {
  let type: Customer["customerType"] = "Tourist";
  if (item.customerType === "NIGERIAN_CITIZEN") {
    type = "Resident";
  } else if (item.customerType === "EXPATRIATE") {
    type = "Expatriate";
  }

  let kyc: Customer["kycStatus"] = "Pending";
  if (item.kycStatus === "VERIFIED" || item.kycStatus === "APPROVED") {
    kyc = "Approved";
  } else if (item.kycStatus === "REJECTED") {
    kyc = "Rejected";
  }


  return {
    customerName: item.fullName,
    id: item.userId,
    customerType: type,
    lastTransactionType: item.lastTransactionType || "—",
    dateRegistered: item.registeredAt,
    kycStatus: kyc,
  };
};

export default function CustomerTable({
  customers = [],
  loading = false,
}: Readonly<CustomerTableProps>) {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Filter By");
  const router = useRouter();

  const allCustomers = useMemo(
    () => customers.map(mapApiCustomerToTable),
    [customers]
  );

  const filteredData = useMemo(() => {
    return allCustomers.filter((customer) => {
      const matchesSearch =
        customer.customerName.toLowerCase().includes(search.toLowerCase()) ||
        customer.id.includes(search) ||
        customer.customerType.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        filter === "Filter By" ||
        filter === "All" ||
        customer.kycStatus === filter;

      return matchesSearch && matchesFilter;
    });
  }, [search, filter, allCustomers]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredData.slice(start, end);
  }, [page, filteredData]);

  const customerHeaders = [
    { label: "Customer Name", key: "customerName" },
    { label: "Customer Type", key: "customerType" },
    { label: "Last Transaction Type", key: "lastTransactionType" },
    { label: "Date Registered", key: "dateRegistered" },
    { label: "KYC Status", key: "kycStatus" },
    { label: "Action", key: "action" },
  ];

  const renderCustomerRow = (item: Customer) => [
    <div key="customerName">
      <Text fw={500} size="sm">
        {item.customerName}
      </Text>
      <Text size="xs" c="dimmed">
        ID: {item.id}
      </Text>
    </div>,

    <Text key="customerType" size="sm">
      {item.customerType}
    </Text>,

    <Text key="lastTransactionType" size="sm">
      {item.lastTransactionType}
    </Text>,

    <div key="dateRegistered">
      <p className="text-body-text-300 text-sm leading-5">{formatLocalDate(item?.dateRegistered || "")}</p>
      <p className="text-body-text-200 text-xs leading-5">{formatShortTime(item?.dateRegistered || "")}</p>
    </div>,

    <Badge
      key="kycStatus"
      color={getKYCStatusColor(item.kycStatus)}
      variant="light"
      size="sm"
    >
      {item.kycStatus}
    </Badge>,

    <ActionButton
      key="action"
      onClick={() => router.push(`/agent/customer-management/${item.id}`)}
      aria-label="View customer details"
    />,
  ];

  return (
    <div className="my-5 p-5 rounded-lg bg-white">
      <div>
        <Group justify="space-between" mb="md" wrap="wrap">
          <div className="flex items-center gap-4">
            <Text fw={600} size="lg">
              All Customers
            </Text>
            {/* Search */}
            <SearchInput
              placeholder="Enter keyword"
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
            />
          </div>

          <Group gap="xs">
            {/* Filter */}
            <Select
              value={filter}
              onChange={(value) => setFilter(value ?? "Filter By")}
              data={["Filter By", "All", "Pending", "Approved", "Rejected"]}
              radius="xl"
              w={120}
              rightSection={<ListFilter size={16} />}
            />

            {/* Export */}
            <Button
              variant="light"
              color="orange"
              radius="xl"
              rightSection={<Upload size={16} />}
            >
              Export
            </Button>

            {/* View All */}
            <Button
              variant="filled"
              color="orange"
              radius="xl"
              rightSection={<ArrowUpRight size={16} />}
            >
              View All
            </Button>
          </Group>
        </Group>
      </div>

      <DynamicTableSection
          headers={customerHeaders}
          data={paginatedData}
          loading={loading}
          renderItems={renderCustomerRow}
          emptyTitle="No Customers Found"
          emptyMessage="There are currently no customers to display."
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
