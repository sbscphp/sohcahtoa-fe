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
import { Tabs } from "@mantine/core";
import { useRouter } from "next/navigation";

/* --------------------------------------------
 Types
--------------------------------------------- */
interface Transaction {
  customerName: string;
  id: string;
  date: string;
  type: string;
  stage: string;
  workflow: string;
  amount: number;
  status: "Pending" | "Settled" | "Rejected" | "More Info";
}

/* --------------------------------------------
 Mock Data
--------------------------------------------- */
const transactions: Transaction[] = [
  {
    customerName: "Samuel Johnson",
    id: "9023",
    date: "Nov 19",
    type: "BTA",
    stage: "Documentation",
    workflow: "Review",
    amount: 400,
    status: "Pending",
  },
  {
    customerName: "Michael Bennett",
    id: "9025",
    date: "Nov 21",
    type: "BTA",
    stage: "Documentation",
    workflow: "Approval",
    amount: 500,
    status: "Pending",
  },
  {
    customerName: "Ava Thompson",
    id: "9026",
    date: "Nov 23",
    type: "PTA",
    stage: "Settlement",
    workflow: "Approval",
    amount: 600,
    status: "Settled",
  },
  {
    customerName: "Emily Carter",
    id: "9024",
    date: "Nov 20",
    type: "PTA",
    stage: "Info request",
    workflow: "Approval",
    amount: 550,
    status: "More Info",
  },
  {
    customerName: "Emily Carter",
    id: "9024",
    date: "Nov 20",
    type: "PTA",
    stage: "Info request",
    workflow: "Approval",
    amount: 550,
    status: "More Info",
  },
  {
    customerName: "Emily Carter",
    id: "9024",
    date: "Nov 20",
    type: "PTA",
    stage: "Info request",
    workflow: "Approval",
    amount: 550,
    status: "More Info",
  },
  {
    customerName: "Emily Carter",
    id: "9024",
    date: "Nov 20",
    type: "PTA",
    stage: "Info request",
    workflow: "Approval",
    amount: 550,
    status: "More Info",
  },
];

/* --------------------------------------------
 Component
--------------------------------------------- */
export default function TransactionsTable() {
  /* Pagination state */
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Filter By");
  const router = useRouter();

  const filteredData = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch =
        tx.customerName.toLowerCase().includes(search.toLowerCase()) ||
        tx.id.includes(search);

      const matchesFilter = filter === "Buy FX" ? true : tx.type === filter;

      return matchesSearch && matchesFilter;
    });
  }, [search, filter]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredData.slice(start, end);
  }, [page, filteredData]);
  /* Table headers */
  const transactionHeaders = [
    { label: "Customer Name", key: "customer" },
    { label: "Date and ID", key: "date" },
    { label: "Transaction Type", key: "type" },
    { label: "Transaction Stage", key: "stage" },
    { label: "Workflow Stage", key: "workflow" },
    { label: "Transaction Value", key: "amount" },
    { label: "Status", key: "status" },
    { label: "Action", key: "action" },
  ];

  /* Row renderer */
  const renderTransactionRow = (item: Transaction) => [
    // Customer
    <div key="customer">
      <Text fw={500} size="sm">
        {item.customerName}
      </Text>
      <Text size="xs" c="dimmed">
        ID:{item.id}
      </Text>
    </div>,

    // Date & ID
    <div key="date">
      <Text size="sm">{item.date}</Text>
      <Text size="xs" c="dimmed">
        ID:{item.id}
      </Text>
    </div>,

    // Type
    <Text key="type" size="sm">
      {item.type}
    </Text>,

    // Stage
    <Text key="stage" size="sm">
      {item.stage}
    </Text>,

    // Workflow
    <Text key="workflow" size="sm">
      {item.workflow}
    </Text>,

    // Amount
    <Text key="amount" size="sm">
      ${item.amount}
    </Text>,

    // Status
    <StatusBadge key="status" status={item.status} />,

    // Action
    <ActionIcon
      key="action"
      radius="xl"
      variant="light"
      color="orange"
      w={10}
      h={10}
      onClick={() =>
        router.push(`/admin/transactions/${item.id}`)
      }
    >
      <ChevronRight size={14} />
    </ActionIcon>,
  ];

  return (
    <div className="my-5 p-5 rounded-lg bg-white">
      <div>
        <Group justify="space-between" mb="md" wrap="nowrap">
          <div className="flex items-center gap-4">
            <h2 className="font-semibold text-lg">All Transactions</h2>
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
              data={["Filter By", "Buy FX", "Sell FX", "Receive FX"]}
              radius="xl"
              w={120}
              rightSection={<ListFilter size={16} />}
            />

            {/* Export */}
            <Button
              variant="outline"
              color="#E36C2F"
              radius="xl"
              rightSection={<Upload size={16} />}
            >
              Export
            </Button>
          </Group>
        </Group>
      </div>

      <Tabs color="orange" defaultValue="buy-fx">
        <Tabs.List className="mb-3">
          <Tabs.Tab value="buy-fx">Buy FX</Tabs.Tab>
          <Tabs.Tab value="sell-fx">Sell FX</Tabs.Tab>
          <Tabs.Tab value="receive-fx">Receive FX</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="buy-fx">
          <DynamicTableSection
            headers={transactionHeaders}
            data={paginatedData}
            loading={false}
            renderItems={renderTransactionRow}
            emptyTitle="No Data Available Yet"
            emptyMessage="You currently don't have any data available yet. Check back later."
            pagination={{
              page,
              totalPages,
              onNext: () => setPage((p) => Math.min(p + 1, totalPages)),
              onPrevious: () => setPage((p) => Math.max(p - 1, 1)),
              onPageChange: setPage,
            }}
          />
        </Tabs.Panel>

        <Tabs.Panel value="sell-fx">Messages tab content</Tabs.Panel>

        <Tabs.Panel value="receive-fx">Settings tab content</Tabs.Panel>
      </Tabs>
    </div>
  );
}
