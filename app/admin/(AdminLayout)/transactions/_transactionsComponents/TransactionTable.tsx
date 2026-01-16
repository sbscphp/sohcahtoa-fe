"use client";

import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { Group, Text, ActionIcon } from "@mantine/core";
import { ChevronRight } from "lucide-react";

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
];

export default function TransactionsTable() {
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

  const renderTransactionRow = (
    item: Transaction,
    headers: { label: string; key: string }[]
  ) => [
    // Customer Name
    <div key="customer">
      <Text fw={500}>{item.customerName}</Text>
      <Text size="xs" c="dimmed">
        ID:{item.id}
      </Text>
    </div>,

    // Date and ID
    <div key="date">
      <Text>{item.date}</Text>
      <Text size="xs" c="dimmed">
        ID:{item.id}
      </Text>
    </div>,

    // Transaction Type
    <Text key="type">{item.type}</Text>,

    // Transaction Stage
    <Text key="stage">{item.stage}</Text>,

    // Workflow Stage
    <Text key="workflow">{item.workflow}</Text>,

    // Transaction Value
    <Text key="amount">${item.amount}</Text>,

    // Status
    <StatusBadge key="status" status={item.status} />,

    // Action
    <ActionIcon key="action" radius="xl" variant="light" color="orange">
      <ChevronRight size={16} />
    </ActionIcon>,
  ];

  return (
    <DynamicTableSection
      headers={transactionHeaders}
      data={transactions}
      loading={false}
      renderItems={renderTransactionRow}
      emptyTitle="No Transactions"
      emptyMessage="There are no transactions to display"
    />
  );
}
