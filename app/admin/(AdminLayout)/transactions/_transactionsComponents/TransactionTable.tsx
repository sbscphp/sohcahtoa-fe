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
const generateBuyFXTransactions = (): Transaction[] => [
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
    customerName: "Oliver Reed",
    id: "9027",
    date: "Nov 22",
    type: "Medical Fee",
    stage: "Documentation",
    workflow: "Approval",
    amount: 450,
    status: "Rejected",
  },
  {
    customerName: "Samuel Johnson",
    id: "9023",
    date: "Nov 19",
    type: "School fee",
    stage: "Documentation",
    workflow: "Approval",
    amount: 400,
    status: "Pending",
  },
  {
    customerName: "Sophia Martinez",
    id: "9028",
    date: "Nov 24",
    type: "BTA",
    stage: "Settlement",
    workflow: "Review",
    amount: 750,
    status: "Settled",
  },
  {
    customerName: "James Wilson",
    id: "9029",
    date: "Nov 25",
    type: "PTA",
    stage: "Documentation",
    workflow: "Approval",
    amount: 320,
    status: "Pending",
  },
  {
    customerName: "Isabella Brown",
    id: "9030",
    date: "Nov 26",
    type: "Medical Fee",
    stage: "Info request",
    workflow: "Review",
    amount: 680,
    status: "More Info",
  },
  {
    customerName: "William Davis",
    id: "9031",
    date: "Nov 27",
    type: "School fee",
    stage: "Settlement",
    workflow: "Approval",
    amount: 520,
    status: "Settled",
  },
  {
    customerName: "Charlotte Taylor",
    id: "9032",
    date: "Nov 28",
    type: "BTA",
    stage: "Documentation",
    workflow: "Approval",
    amount: 890,
    status: "Rejected",
  },
  {
    customerName: "Benjamin Anderson",
    id: "9033",
    date: "Nov 29",
    type: "PTA",
    stage: "Settlement",
    workflow: "Review",
    amount: 410,
    status: "Pending",
  },
  {
    customerName: "Amelia White",
    id: "9034",
    date: "Nov 30",
    type: "Medical Fee",
    stage: "Documentation",
    workflow: "Approval",
    amount: 630,
    status: "Settled",
  },
  {
    customerName: "Lucas Harris",
    id: "9035",
    date: "Dec 1",
    type: "School fee",
    stage: "Info request",
    workflow: "Review",
    amount: 380,
    status: "More Info",
  },
  {
    customerName: "Mia Clark",
    id: "9036",
    date: "Dec 2",
    type: "BTA",
    stage: "Settlement",
    workflow: "Approval",
    amount: 720,
    status: "Pending",
  },
];

const generateSellFXTransactions = (): Transaction[] => [
  {
    customerName: "Robert Johnson",
    id: "8001",
    date: "Nov 18",
    type: "BTA",
    stage: "Documentation",
    workflow: "Review",
    amount: 1200,
    status: "Pending",
  },
  {
    customerName: "Patricia Williams",
    id: "8002",
    date: "Nov 19",
    type: "PTA",
    stage: "Settlement",
    workflow: "Approval",
    amount: 850,
    status: "Settled",
  },
  {
    customerName: "Daniel Miller",
    id: "8003",
    date: "Nov 20",
    type: "Medical Fee",
    stage: "Documentation",
    workflow: "Approval",
    amount: 950,
    status: "Pending",
  },
  {
    customerName: "Jennifer Garcia",
    id: "8004",
    date: "Nov 21",
    type: "School fee",
    stage: "Info request",
    workflow: "Review",
    amount: 1100,
    status: "More Info",
  },
  {
    customerName: "Matthew Rodriguez",
    id: "8005",
    date: "Nov 22",
    type: "BTA",
    stage: "Settlement",
    workflow: "Approval",
    amount: 1350,
    status: "Settled",
  },
  {
    customerName: "Linda Martinez",
    id: "8006",
    date: "Nov 23",
    type: "PTA",
    stage: "Documentation",
    workflow: "Approval",
    amount: 780,
    status: "Rejected",
  },
  {
    customerName: "Christopher Lee",
    id: "8007",
    date: "Nov 24",
    type: "Medical Fee",
    stage: "Settlement",
    workflow: "Review",
    amount: 920,
    status: "Pending",
  },
  {
    customerName: "Barbara Walker",
    id: "8008",
    date: "Nov 25",
    type: "School fee",
    stage: "Documentation",
    workflow: "Approval",
    amount: 1050,
    status: "Settled",
  },
  {
    customerName: "Joseph Hall",
    id: "8009",
    date: "Nov 26",
    type: "BTA",
    stage: "Info request",
    workflow: "Review",
    amount: 1400,
    status: "More Info",
  },
  {
    customerName: "Susan Allen",
    id: "8010",
    date: "Nov 27",
    type: "PTA",
    stage: "Settlement",
    workflow: "Approval",
    amount: 650,
    status: "Pending",
  },
  {
    customerName: "David Young",
    id: "8011",
    date: "Nov 28",
    type: "Medical Fee",
    stage: "Documentation",
    workflow: "Approval",
    amount: 880,
    status: "Rejected",
  },
  {
    customerName: "Jessica King",
    id: "8012",
    date: "Nov 29",
    type: "School fee",
    stage: "Settlement",
    workflow: "Review",
    amount: 1150,
    status: "Settled",
  },
  {
    customerName: "Richard Wright",
    id: "8013",
    date: "Nov 30",
    type: "BTA",
    stage: "Documentation",
    workflow: "Approval",
    amount: 1250,
    status: "Pending",
  },
  {
    customerName: "Sarah Lopez",
    id: "8014",
    date: "Dec 1",
    type: "PTA",
    stage: "Info request",
    workflow: "Review",
    amount: 720,
    status: "More Info",
  },
  {
    customerName: "Thomas Hill",
    id: "8015",
    date: "Dec 2",
    type: "Medical Fee",
    stage: "Settlement",
    workflow: "Approval",
    amount: 980,
    status: "Settled",
  },
];

const generateReceiveFXTransactions = (): Transaction[] => [
  {
    customerName: "Andrew Scott",
    id: "7001",
    date: "Nov 17",
    type: "BTA",
    stage: "Documentation",
    workflow: "Review",
    amount: 2000,
    status: "Pending",
  },
  {
    customerName: "Nancy Green",
    id: "7002",
    date: "Nov 18",
    type: "PTA",
    stage: "Settlement",
    workflow: "Approval",
    amount: 1500,
    status: "Settled",
  },
  {
    customerName: "Mark Adams",
    id: "7003",
    date: "Nov 19",
    type: "Medical Fee",
    stage: "Documentation",
    workflow: "Approval",
    amount: 1800,
    status: "Pending",
  },
  {
    customerName: "Betty Nelson",
    id: "7004",
    date: "Nov 20",
    type: "School fee",
    stage: "Info request",
    workflow: "Review",
    amount: 2200,
    status: "More Info",
  },
  {
    customerName: "Paul Baker",
    id: "7005",
    date: "Nov 21",
    type: "BTA",
    stage: "Settlement",
    workflow: "Approval",
    amount: 2500,
    status: "Settled",
  },
  {
    customerName: "Helen Carter",
    id: "7006",
    date: "Nov 22",
    type: "PTA",
    stage: "Documentation",
    workflow: "Approval",
    amount: 1600,
    status: "Rejected",
  },
  {
    customerName: "Steven Mitchell",
    id: "7007",
    date: "Nov 23",
    type: "Medical Fee",
    stage: "Settlement",
    workflow: "Review",
    amount: 1900,
    status: "Pending",
  },
  {
    customerName: "Donna Perez",
    id: "7008",
    date: "Nov 24",
    type: "School fee",
    stage: "Documentation",
    workflow: "Approval",
    amount: 2100,
    status: "Settled",
  },
  {
    customerName: "Kenneth Roberts",
    id: "7009",
    date: "Nov 25",
    type: "BTA",
    stage: "Info request",
    workflow: "Review",
    amount: 2800,
    status: "More Info",
  },
  {
    customerName: "Carol Turner",
    id: "7010",
    date: "Nov 26",
    type: "PTA",
    stage: "Settlement",
    workflow: "Approval",
    amount: 1300,
    status: "Pending",
  },
  {
    customerName: "Joshua Phillips",
    id: "7011",
    date: "Nov 27",
    type: "Medical Fee",
    stage: "Documentation",
    workflow: "Approval",
    amount: 1750,
    status: "Rejected",
  },
  {
    customerName: "Michelle Campbell",
    id: "7012",
    date: "Nov 28",
    type: "School fee",
    stage: "Settlement",
    workflow: "Review",
    amount: 2300,
    status: "Settled",
  },
  {
    customerName: "Kevin Parker",
    id: "7013",
    date: "Nov 29",
    type: "BTA",
    stage: "Documentation",
    workflow: "Approval",
    amount: 2400,
    status: "Pending",
  },
  {
    customerName: "Dorothy Evans",
    id: "7014",
    date: "Nov 30",
    type: "PTA",
    stage: "Info request",
    workflow: "Review",
    amount: 1400,
    status: "More Info",
  },
  {
    customerName: "Brian Edwards",
    id: "7015",
    date: "Dec 1",
    type: "Medical Fee",
    stage: "Settlement",
    workflow: "Approval",
    amount: 1950,
    status: "Settled",
  },
];

const allTransactions: Transaction[] = [
  ...generateBuyFXTransactions(),
  ...generateSellFXTransactions(),
  ...generateReceiveFXTransactions(),
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
  const [activeTab, setActiveTab] = useState<string>("buy-fx");
  const router = useRouter();

  const filteredData = useMemo(() => {
    let tabFiltered = allTransactions;

    // Filter by active tab
    if (activeTab === "buy-fx") {
      tabFiltered = generateBuyFXTransactions();
    } else if (activeTab === "sell-fx") {
      tabFiltered = generateSellFXTransactions();
    } else if (activeTab === "receive-fx") {
      tabFiltered = generateReceiveFXTransactions();
    }

    return tabFiltered.filter((tx) => {
      const matchesSearch =
        tx.customerName.toLowerCase().includes(search.toLowerCase()) ||
        tx.id.includes(search);

      const matchesFilter =
        filter === "Filter By" || filter === "Buy FX" || filter === "Sell FX" || filter === "Receive FX"
          ? true
          : tx.type === filter;

      return matchesSearch && matchesFilter;
    });
  }, [search, filter, activeTab]);

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

      <Tabs
       className="mt-8!"
        color="orange"
        value={activeTab}
        onChange={(value) => {
          setActiveTab(value || "buy-fx");
          setPage(1); // Reset to first page when switching tabs
        }}
      >
        <Tabs.List className="mb-4 border-0! before:content-none!">
          <Tabs.Tab value="buy-fx" className="pb-3!">Buy FX</Tabs.Tab>
          <Tabs.Tab value="sell-fx" className="pb-3!">Sell FX</Tabs.Tab>
          <Tabs.Tab value="receive-fx" className="pb-3!">Receive FX</Tabs.Tab>
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

        <Tabs.Panel value="sell-fx">
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

        <Tabs.Panel value="receive-fx">
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
      </Tabs>
    </div>
  );
}
