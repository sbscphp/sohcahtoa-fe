"use client";

import { useMemo, useState } from "react";
import {
  ActionIcon,
  Button,
  Divider,
  Group,
  Menu,
  Select,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useParams } from "next/navigation";
import { Download, MoreVertical, Search } from "lucide-react";
import DynamicTableSection, {
  Header,
} from "@/app/admin/_components/DynamicTableSection";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { DetailItem } from "@/app/admin/_components/DetailItem";

type AgentStatus = "Active" | "Deactivated";

interface AgentDetails {
  id: string;
  name: string;
  status: AgentStatus;
  createdAt: string;
  createdTime: string;
  email: string;
  phone: string;
  branch: string;
  totalTransactions: number;
  transactionValue: number;
  lastTransaction: string;
  documentLabel: string;
}

type TransactionStatus = "Posted" | "Pending" | "Rejected";

interface AgentTransaction {
  id: string;
  actionDate: string;
  actionTime: string;
  type: string;
  transactionValue: number;
  status: TransactionStatus;
}

const formatNaira = (amount: number): string =>
  `₦ ${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const AGENT_DETAILS: AgentDetails[] = [
  {
    id: "9023",
    name: "Tunde Bashorun",
    status: "Active",
    createdAt: "Nov 17 2025",
    createdTime: "11:00am",
    email: "tunde@eternalglobal.com",
    phone: "+234 90 2323 4545",
    branch: "Chevron Drive, Lekki",
    totalTransactions: 209,
    transactionValue: 1250000,
    lastTransaction: "LekkiBranch@sohcattoa.com",
    documentLabel: "Doc.pdf",
  },
  {
    id: "9025",
    name: "Queen Omotola",
    status: "Active",
    createdAt: "Oct 02 2025",
    createdTime: "09:30am",
    email: "queen@kudimata.com",
    phone: "+234 90 5858 3939",
    branch: "Victoria Island, Lagos",
    totalTransactions: 9,
    transactionValue: 875000,
    lastTransaction: "VI-Branch@sohcahtoa.com",
    documentLabel: "KYC-Queen.pdf",
  },
];

const MOCK_TRANSACTIONS: AgentTransaction[] = [
  {
    id: "7844gAGA563A",
    actionDate: "September 12, 2025",
    actionTime: "11:00 am",
    type: "BTA Buy",
    transactionValue: 1250000,
    status: "Posted",
  },
  {
    id: "7844gAGA563B",
    actionDate: "September 12, 2025",
    actionTime: "11:00 am",
    type: "PTA Buy",
    transactionValue: 875000,
    status: "Pending",
  },
  {
    id: "7844gAGA563C",
    actionDate: "September 12, 2025",
    actionTime: "11:00 am",
    type: "PTA Buy",
    transactionValue: 930500,
    status: "Rejected",
  },
  {
    id: "7844gAGA563D",
    actionDate: "September 12, 2025",
    actionTime: "11:00 am",
    type: "Export Proceeds",
    transactionValue: 1100000,
    status: "Posted",
  },
  {
    id: "7844gAGA563E",
    actionDate: "September 12, 2025",
    actionTime: "11:00 am",
    type: "BTA Buy",
    transactionValue: 790000,
    status: "Pending",
  },
  {
    id: "7844gAGA563F",
    actionDate: "September 12, 2025",
    actionTime: "11:00 am",
    type: "PTA Sell",
    transactionValue: 980000,
    status: "Posted",
  },
];

export default function AgentDetailsPage() {
  const params = useParams<{ id: string }>();
  const agentId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const agent = useMemo(
    () => AGENT_DETAILS.find((a) => a.id === agentId) ?? AGENT_DETAILS[0],
    [agentId]
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>("All");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const headers: Header[] = [
    { label: "Transaction ID", key: "transactionId" },
    { label: "Action Date", key: "actionDate" },
    { label: "Type", key: "type" },
    { label: "Transaction Value", key: "transactionValue" },
    { label: "Action Effect", key: "actionEffect" },
    { label: "Action", key: "action" },
  ];

  const filteredTransactions = useMemo(() => {
    return MOCK_TRANSACTIONS.filter((tx) => {
      const matchesSearch =
        tx.id.toLowerCase().includes(search.toLowerCase()) ||
        tx.type.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        !statusFilter ||
        statusFilter === "All" ||
        tx.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / pageSize));

  const paginatedTransactions = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredTransactions.slice(start, end);
  }, [filteredTransactions, page, pageSize]);

  const renderTransactionRow = (tx: AgentTransaction) => [
    <Text key="transactionId" size="sm" fw={500}>
      {tx.id}
    </Text>,
    <div key="actionDate" className="flex flex-col">
      <Text size="sm">{tx.actionDate}</Text>
      <Text size="xs" c="dimmed">
        {tx.actionTime}
      </Text>
    </div>,
    <Text key="type" size="sm">
      {tx.type}
    </Text>,
    <Text key="transactionValue" size="sm" fw={500}>
      {formatNaira(tx.transactionValue)}
    </Text>,
    <StatusBadge key="actionEffect" status={tx.status} />,
    <ActionIcon
      key="action"
      variant="subtle"
      color="gray"
      radius="xl"
      aria-label="More actions"
    >
      <MoreVertical size={16} />
    </ActionIcon>,
  ];

  return (
    <div className="space-y-6">
      {/* Header + Agent Details Card */}
      <div className="rounded-xl bg-white p-5 shadow-sm space-y-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Stack gap={4} className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <Text size="xl" fw={600}>
                {agent.name}
              </Text>
              <StatusBadge status={agent.status} />
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-[#6B7280]">
              <span>
                <span className="font-medium text-[#111827]">
                  Date Created:
                </span>{" "}
                {agent.createdAt} | {agent.createdTime}
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="text-emerald-700 font-medium">
                  {agent.status}
                </span>
              </span>
            </div>
          </Stack>

          <Menu position="bottom-end" shadow="md" width={160}>
            <Menu.Target>
              <Button
                radius="xl"
                size="md"
                color="#DD4F05"
                className="self-start md:self-auto"
              >
                Take Action
              </Button>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item>Edit</Menu.Item>
              <Menu.Divider />
              <Menu.Item>Deactivate</Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </div>

        <Divider />

        {/* Agent Details Summary */}
        <div>
          <Text fw={600} className="mb-4! text-orange-500!">
            Agent Details
          </Text>

          <div className="grid gap-6 md:grid-cols-4">
            <DetailItem label="Agent ID" value={agent.id} />
            <DetailItem label="Email Address" value={agent.email} />
            <DetailItem label="Phone Number" value={agent.phone} />
            <DetailItem label="Branch" value={agent.branch} />
            <DetailItem
              label="Total Transactions"
              value={String(agent.totalTransactions)}
            />
            <DetailItem
              label="Transaction Value"
              value={formatNaira(agent.transactionValue)}
            />
            <DetailItem
              label="Last Transaction"
              value={agent.lastTransaction}
            />

            <div className="space-y-1">
              <Text size="xs" className="text-body-text-50!" mb={4}>
                Doc
              </Text>
              <Button
                variant="subtle"
                color="orange"
                size="xs"
                leftSection={<Download size={14} />}
                className="px-0"
              >
                {agent.documentLabel}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Transactions Table */}
      <div className="rounded-xl bg-white p-5 shadow-sm">
        <Group justify="space-between" align="center" mb="md" wrap="wrap">
          <Text fw={600} size="md">
            Agent Transactions
          </Text>

          <Group gap="sm" wrap="wrap">
            <TextInput
              placeholder="Enter keyword"
              leftSection={<Search size={16} color="#DD4F05" />}
              value={search}
              onChange={(e) => {
                setSearch(e.currentTarget.value);
                setPage(1);
              }}
              radius="xl"
              w={260}
            />

            <Select
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value);
                setPage(1);
              }}
              data={["All", "Posted", "Pending", "Rejected"]}
              radius="xl"
              w={140}
              placeholder="Filter By"
            />

            <Button
              variant="outline"
              color="#E36C2F"
              radius="xl"
            >
              Export
            </Button>
          </Group>
        </Group>

        <DynamicTableSection
          headers={headers}
          data={paginatedTransactions}
          renderItems={renderTransactionRow}
          emptyTitle="No Transactions Found"
          emptyMessage="There are currently no transactions for this agent."
          pagination={{
            page,
            totalPages,
            onNext: () => setPage((prev) => Math.min(prev + 1, totalPages)),
            onPrevious: () => setPage((prev) => Math.max(prev - 1, 1)),
            onPageChange: setPage,
          }}
        />
      </div>
    </div>
  );
}