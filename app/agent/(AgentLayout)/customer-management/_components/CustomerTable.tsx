"use client";

import { useState, useMemo } from "react";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import {
  Text,
  Group,
  TextInput,
  Select,
  Button,
  Badge,
} from "@mantine/core";
import { Search, Upload, ListFilter, ArrowUpRight, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import EmptyState from "@/app/admin/_components/EmptyState";

interface Customer {
  customerName: string;
  id: string;
  customerType: "Resident" | "Tourist" | "Expatriate";
  lastTransactionType: string;
  dateRegistered: string;
  kycStatus: "Pending" | "Approved" | "Rejected";
}

const generateCustomers = (): Customer[] => [
  {
    customerName: "Bukayo Eze",
    id: "9029",
    customerType: "Resident",
    lastTransactionType: "PTA",
    dateRegistered: "Nov 16 2025 11:00 am",
    kycStatus: "Pending",
  },
  {
    customerName: "Fiyinfoluwa Familua",
    id: "9030",
    customerType: "Tourist",
    lastTransactionType: "BTA",
    dateRegistered: "Nov 15 2025 10:30 am",
    kycStatus: "Approved",
  },
  {
    customerName: "Adeola Johnson",
    id: "9031",
    customerType: "Expatriate",
    lastTransactionType: "Medical",
    dateRegistered: "Nov 14 2025 09:15 am",
    kycStatus: "Rejected",
  },
  {
    customerName: "Chukwudi Okoro",
    id: "9032",
    customerType: "Resident",
    lastTransactionType: "Professional Body Fee",
    dateRegistered: "Nov 13 2025 02:45 pm",
    kycStatus: "Approved",
  },
  {
    customerName: "Ngozi Eze",
    id: "9033",
    customerType: "Tourist",
    lastTransactionType: "School Fees",
    dateRegistered: "Nov 12 2025 01:20 pm",
    kycStatus: "Pending",
  },
  {
    customerName: "Emeka Okafor",
    id: "9034",
    customerType: "Resident",
    lastTransactionType: "IMTO",
    dateRegistered: "Nov 11 2025 11:30 am",
    kycStatus: "Approved",
  },
];

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

export default function CustomerTable() {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Filter By");
  const router = useRouter();

  const allCustomers = useMemo(() => generateCustomers(), []);

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

    <Text key="dateRegistered" size="sm">
      {item.dateRegistered}
    </Text>,

    <Badge
      key="kycStatus"
      color={getKYCStatusColor(item.kycStatus)}
      variant="light"
      size="sm"
    >
      {item.kycStatus}
    </Badge>,

    <button
      key="action"
      onClick={() => router.push(`/agent/customer-management/${item.id}`)}
      className="text-primary-400 hover:text-primary-500 transition-colors"
    >
      <ChevronRight size={18} />
    </button>,
  ];

  return (
    <div className="my-5 p-5 rounded-lg bg-white">
      <div>
        <Group justify="space-between" mb="md" wrap="wrap">
          <Text fw={600} size="lg">
            All Customers
          </Text>

          <Group gap="xs">
            {/* Search */}
            <TextInput
              placeholder="Enter keyword"
              leftSection={<Search size={16} color="#DD4F05" />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              w={280}
              radius="xl"
            />

            {/* Filter */}
            <Select
              value={filter}
              onChange={(value) => setFilter(value!)}
              data={["Filter By", "All", "Pending", "Approved", "Rejected"]}
              radius="xl"
              w={120}
              rightSection={<ListFilter size={16} />}
            />

            {/* Export */}
            <Button
              variant="filled"
              color="orange"
              radius="xl"
              leftSection={<Upload size={16} />}
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

      {paginatedData.length === 0 ? (
        <EmptyState
          title="No data available yet"
          description="You currently have not have any data available yet. Check back Later."
        />
      ) : (
        <>
          <DynamicTableSection
            headers={customerHeaders}
            data={paginatedData}
            loading={false}
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
        </>
      )}
    </div>
  );
}
