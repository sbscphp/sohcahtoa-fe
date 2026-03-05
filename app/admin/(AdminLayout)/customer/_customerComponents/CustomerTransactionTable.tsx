"use client";

import { useState, useMemo } from "react";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import RowActionIcon from "@/app/admin/_components/RowActionIcon";
import { Text, Group, TextInput, Select, Button } from "@mantine/core";
import { Search, Upload, ListFilter } from "lucide-react";
import { Tabs } from "@mantine/core";
import { useRouter } from "next/navigation";
import AdminTabButton from "@/app/admin/_components/AdminTabButton";
import { useFetchDataSeperateLoading } from "@/app/_lib/api/hooks";
import { adminApi } from "@/app/admin/_services/admin-api";
import { adminKeys } from "@/app/_lib/api/query-keys";
import { useDebouncedValue } from "@mantine/hooks";
import { adminRoutes } from "@/lib/adminRoutes";

/* --------------------------------------------
 Types
--------------------------------------------- */
interface Transaction {
  customerName: string;
  id: string;
  date: string;
  reference: string;
  type: string;
  stage: string;
  workflow: string;
  amount: number;
  status: string;
}


/* --------------------------------------------
 Component
--------------------------------------------- */
interface ApiTransactionItem {
  id?: string;
  transactionId?: string;
  customerName?: string;
  dateAndId?: {
    date?: string;
    reference?: string;
  };
  date?: string;
  createdAt?: string;
  reference?: string;
  type?: string;
  transactionType?: string;
  stage?: string;
  transactionStage?: string;
  workflow?: string;
  workflowStage?: string;
  amount?: number | string;
  transactionValue?: number | string;
  status?: string;
}

interface CustomerTransactionsResponse {
  success: boolean;
  data:
    | ApiTransactionItem[]
    | {
        transactions?: ApiTransactionItem[];
        items?: ApiTransactionItem[];
      };
  metadata?: {
    pagination?: {
      total?: number;
      page?: number;
      limit?: number;
      totalPages?: number;
    };
  } | null;
}

interface CustomerTransactionsTableProps {
  customerId: string;
}

const PAGE_SIZE = 5;
const STATUS_OPTIONS = [
  { value: "Filter By", label: "Filter By" },
  { value: "AWAITING_VERIFICATION", label: "Awaiting Verification" },
  { value: "SETTLED", label: "Settled" },
  { value: "REJECTED", label: "Rejected" },
];

function humanize(value?: string): string {
  if (!value) return "—";
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function parseAmount(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) return numeric;
  }
  return 0;
}

function mapTransaction(item: ApiTransactionItem): Transaction {
  const dateValue = item.dateAndId?.date ?? item.date ?? item.createdAt;
  return {
    customerName: item.customerName ?? "—",
    id: item.id ?? item.transactionId ?? "",
    date: formatDate(dateValue),
    reference: item.dateAndId?.reference ?? item.reference ?? "—",
    type: item.transactionType ?? item.type ?? "—",
    stage: humanize(item.transactionStage ?? item.stage),
    workflow: humanize(item.workflowStage ?? item.workflow),
    amount: parseAmount(item.amount ?? item.transactionValue),
    status: humanize(item.status),
  };
}

function extractTransactions(
  responseData: CustomerTransactionsResponse["data"] | undefined
): ApiTransactionItem[] {
  if (Array.isArray(responseData)) return responseData;
  if (!responseData || typeof responseData !== "object") return [];
  return responseData.transactions ?? responseData.items ?? [];
}

export default function CustomerTransactionsTable({
  customerId,
}: CustomerTransactionsTableProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const [status, setStatus] = useState("Filter By");
  const [activeTab, setActiveTab] = useState<string>("buyfx");
  const router = useRouter();

  const statusParam = status === "Filter By" ? undefined : status;

  const query = useFetchDataSeperateLoading<CustomerTransactionsResponse>(
    customerId
      ? [
          ...adminKeys.customers.transactions(customerId, {
            page,
            limit: PAGE_SIZE,
            status: statusParam,
            type: activeTab,
            search: debouncedSearch || undefined,
          }),
        ]
      : [],
    () =>
      adminApi.customers.transactions(customerId, {
        page,
        limit: PAGE_SIZE,
        status: statusParam,
        type: activeTab,
        search: debouncedSearch || undefined,
      }) as unknown as Promise<CustomerTransactionsResponse>,
    !!customerId
  );

  const entries = useMemo(
    () => extractTransactions(query.data?.data).map(mapTransaction),
    [query.data?.data]
  );

  const totalPages = query.data?.metadata?.pagination?.totalPages ?? 1;

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

  const renderTransactionRow = (item: Transaction) => [
    <div key="customer">
      <Text fw={500} size="sm">
        {item.customerName}
      </Text>
      <Text size="xs" c="dimmed">
        ID:{item.id || "—"}
      </Text>
    </div>,
    <div key="date">
      <Text size="sm">{item.date}</Text>
      <Text size="xs" c="dimmed">
        Ref:{item.reference}
      </Text>
    </div>,
    <Text key="type" size="sm">
      {item.type}
    </Text>,
    <Text key="stage" size="sm">
      {item.stage}
    </Text>,
    <Text key="workflow" size="sm">
      {item.workflow}
    </Text>,
    <Text key="amount" size="sm">
      ${item.amount}
    </Text>,
    <StatusBadge key="status" status={item.status} defaultColor="orange" />,
    <RowActionIcon
      key="action"
      onClick={() => router.push(adminRoutes.adminTransactionDetails(item.id))}
    />,
  ];

  return (
    <div className="my-5 rounded-lg bg-white p-5">
      <div>
        <Group justify="space-between" mb="md" wrap="wrap">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">All Transactions</h2>
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
              value={status}
              onChange={(value) => {
                setStatus(value ?? "Filter By");
                setPage(1);
              }}
              data={STATUS_OPTIONS}
              radius="xl"
              w={200}
              rightSection={<ListFilter size={16} />}
            />
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
          setActiveTab(value || "buyfx");
          setPage(1);
        }}
      >
        <Tabs.List className="mb-4 border-0! before:content-none!">
          <AdminTabButton value="buyfx">Buy FX</AdminTabButton>
          <AdminTabButton value="sellfx">Sell FX</AdminTabButton>
          <AdminTabButton value="receivefx">Receive FX</AdminTabButton>
        </Tabs.List>
      </Tabs>

      <DynamicTableSection
        headers={transactionHeaders}
        data={entries}
        loading={query.isLoading}
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
    </div>
  );
}
