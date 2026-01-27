"use client";

import { useState, useMemo } from "react";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import {
  Text,
  ActionIcon,
  Group,
  TextInput,
  Select,
  Button,
} from "@mantine/core";
import { ChevronRight, Search, Upload, ListFilter } from "lucide-react";
import { useRouter } from "next/navigation";

/* --------------------------------------------
 Types
--------------------------------------------- */
interface Customer {
  customerName: string;
  id: string;
  phone: string;
  email: string;
  totalTransactions: number;
  transactionVolume: number;
  status: "Active" | "Deactivated";
}

/* --------------------------------------------
Mock Data
--------------------------------------------- */
const generateCustomers = (): Customer[] => [
  {
    customerName: "Tunde Bashorun",
    id: "9023",
    phone: "+234 90 2323 4545",
    email: "tunde@eternalglobal.com",
    totalTransactions: 200,
    transactionVolume: 1250000,
    status: "Active",
  },
  {
    customerName: "Samuel Johnson",
    id: "9024",
    phone: "+234 80 1234 5678",
    email: "samuel@example.com",
    totalTransactions: 150,
    transactionVolume: 950000,
    status: "Active",
  },
  {
    customerName: "Michael Bennett",
    id: "9025",
    phone: "+234 70 9876 5432",
    email: "michael@example.com",
    totalTransactions: 80,
    transactionVolume: 450000,
    status: "Deactivated",
  },
  {
    customerName: "Ava Thompson",
    id: "9026",
    phone: "+234 81 2345 6789",
    email: "ava@example.com",
    totalTransactions: 120,
    transactionVolume: 780000,
    status: "Active",
  },
  {
    customerName: "Emily Carter",
    id: "9027",
    phone: "+234 90 3456 7890",
    email: "emily@example.com",
    totalTransactions: 95,
    transactionVolume: 620000,
    status: "Active",
  },
  {
    customerName: "Oliver Reed",
    id: "9028",
    phone: "+234 70 4567 8901",
    email: "oliver@example.com",
    totalTransactions: 60,
    transactionVolume: 380000,
    status: "Deactivated",
  },
  {
    customerName: "Sophia Martinez",
    id: "9029",
    phone: "+234 81 5678 9012",
    email: "sophia@example.com",
    totalTransactions: 180,
    transactionVolume: 1100000,
    status: "Active",
  },
  {
    customerName: "James Wilson",
    id: "9030",
    phone: "+234 90 6789 0123",
    email: "james@example.com",
    totalTransactions: 140,
    transactionVolume: 890000,
    status: "Active",
  },
  {
    customerName: "Isabella Brown",
    id: "9031",
    phone: "+234 70 7890 1234",
    email: "isabella@example.com",
    totalTransactions: 75,
    transactionVolume: 420000,
    status: "Deactivated",
  },
  {
    customerName: "William Davis",
    id: "9032",
    phone: "+234 81 8901 2345",
    email: "william@example.com",
    totalTransactions: 165,
    transactionVolume: 1020000,
    status: "Active",
  },
  {
    customerName: "Charlotte Taylor",
    id: "9033",
    phone: "+234 90 9012 3456",
    email: "charlotte@example.com",
    totalTransactions: 110,
    transactionVolume: 680000,
    status: "Active",
  },
  {
    customerName: "Benjamin Anderson",
    id: "9034",
    phone: "+234 70 0123 4567",
    email: "benjamin@example.com",
    totalTransactions: 50,
    transactionVolume: 310000,
    status: "Deactivated",
  },
  {
    customerName: "Amelia White",
    id: "9035",
    phone: "+234 81 1234 5678",
    email: "amelia@example.com",
    totalTransactions: 195,
    transactionVolume: 1180000,
    status: "Active",
  },
  {
    customerName: "Lucas Harris",
    id: "9036",
    phone: "+234 90 2345 6789",
    email: "lucas@example.com",
    totalTransactions: 85,
    transactionVolume: 510000,
    status: "Deactivated",
  },
  {
    customerName: "Mia Clark",
    id: "9037",
    phone: "+234 70 3456 7890",
    email: "mia@example.com",
    totalTransactions: 130,
    transactionVolume: 820000,
    status: "Active",
  },
];

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
  const [filter, setFilter] = useState("Filter By");
  const router = useRouter();

  const allCustomers = useMemo(() => generateCustomers(), []);

  const filteredData = useMemo(() => {
    return allCustomers.filter((customer) => {
      const matchesSearch =
        customer.customerName.toLowerCase().includes(search.toLowerCase()) ||
        customer.id.includes(search) ||
        customer.email.toLowerCase().includes(search.toLowerCase()) ||
        customer.phone.includes(search);

      const matchesFilter =
        filter === "Filter By" ||
        filter === "All" ||
        customer.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [search, filter, allCustomers]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredData.slice(start, end);
  }, [page, filteredData]);

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
    <ActionIcon
      key="action"
      radius="xl"
      variant="light"
      color="orange"
      onClick={() => router.push(`/admin/customer/${item.id}`)}
    >
      <ChevronRight size={14} />
    </ActionIcon>,
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
              onChange={(e) => setSearch(e.currentTarget.value)}
              w={320}
              radius="xl"
            />
          </div>

          <Group>
            {/* Filter */}
            <Select
              value={filter}
              onChange={(value) => setFilter(value!)}
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
            >
              Export
            </Button>
          </Group>
        </Group>
      </div>

      <DynamicTableSection
        headers={customerHeaders}
        data={paginatedData}
        loading={false}
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
