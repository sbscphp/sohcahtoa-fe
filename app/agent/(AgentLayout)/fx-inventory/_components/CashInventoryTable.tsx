"use client";

import { useState, useMemo } from "react";
import {
  Card,
  Text,
  Group,
  TextInput,
  Button,
  Tabs,
  Badge,
} from "@mantine/core";
import { Search, ListFilter, Upload, ChevronRight } from "lucide-react";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import { TransactionDetailsModal } from "./TransactionDetailsModal";

type TransactionType = "disbursed" | "received_from_customer" | "received_from_admin";

interface CashTransaction {
  id: string;
  receivedFrom: string;
  cashAmount: string;
  transactionDate: string;
  transactionId?: string;
  currencyPair?: string;
  prepaidAmount?: string;
  transactionType?: string;
  nameOfAdmin?: string;
}

const generateMockTransactions = (
  type: TransactionType
): CashTransaction[] => {
  const baseTransactions: CashTransaction[] = [
    {
      id: "1",
      receivedFrom: "Bukayo Eze",
      cashAmount: "$1000",
      transactionDate: "Nov 16 2025, 11:00 am",
      transactionId: "TXN-55218",
      currencyPair: "USD-NGN",
      prepaidAmount: "$1000",
      transactionType: "PTA",
    },
    {
      id: "2",
      receivedFrom: "Mikel Osimhen",
      cashAmount: "$1000",
      transactionDate: "Nov 21 2025, 4:30 pm",
      transactionId: "TXN-55219",
      currencyPair: "USD-NGN",
      prepaidAmount: "$1000",
      transactionType: "BTA",
    },
    {
      id: "3",
      receivedFrom: "Noni Nwaneri",
      cashAmount: "$1000",
      transactionDate: "Nov 17 2025, 12:30 pm",
      transactionId: "TXN-55220",
      currencyPair: "EUR-NGN",
      prepaidAmount: "€ 1,000",
      transactionType: "School fees",
    },
    {
      id: "4",
      receivedFrom: "Bukayo Eze",
      cashAmount: "€ 1,000",
      transactionDate: "Nov 20 2025, 9:00 am",
      transactionId: "TXN-55221",
      currencyPair: "EUR-NGN",
      prepaidAmount: "€ 1,000",
      transactionType: "Medical",
    },
    {
      id: "5",
      receivedFrom: "Mikel Osimhen",
      cashAmount: "$1000",
      transactionDate: "Nov 22 2025, 10:00 am",
      transactionId: "TXN-55222",
      currencyPair: "JPY-NGN",
      prepaidAmount: "¥100,000",
      transactionType: "PTA",
    },
    {
      id: "6",
      receivedFrom: "Noni Nwaneri",
      cashAmount: "£1,200",
      transactionDate: "Nov 19 2025, 3:45 pm",
      transactionId: "TXN-55223",
      currencyPair: "GBP-NGN",
      prepaidAmount: "£1,200",
      transactionType: "BTA",
    },
    {
      id: "7",
      receivedFrom: "Samuel Franklin",
      cashAmount: "$1000",
      transactionDate: "Nov 18 2025, 2:15 pm",
      transactionId: "TXN-55224",
      currencyPair: "CAD-NGN",
      prepaidAmount: "$1000",
      transactionType: "Professional Body Fee",
    },
    {
      id: "8",
      receivedFrom: "Samuel Franklin",
      cashAmount: "$1000",
      transactionDate: "Nov 16 2025, 11:00 am",
      transactionId: "TXN-55225",
      currencyPair: "USD-NGN",
      prepaidAmount: "$1000",
      transactionType: "PTA",
    },
  ];

  if (type === "received_from_admin") {
    return baseTransactions.map((t) => ({
      ...t,
      receivedFrom: "Admin",
      nameOfAdmin: "Fiyinfoluwa Ajayi",
    }));
  }

  if (type === "disbursed") {
    return baseTransactions.map((t) => ({
      ...t,
      receivedFrom: t.receivedFrom, // Customer name for disbursed
    }));
  }

  return baseTransactions;
};

export function CashInventoryTable() {
  const [activeTab, setActiveTab] = useState<TransactionType>("received_from_customer");
  const [search, setSearch] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState<CashTransaction | null>(null);
  const [modalOpened, setModalOpened] = useState(false);

  const transactions = useMemo(
    () => generateMockTransactions(activeTab),
    [activeTab]
  );

  const filteredTransactions = useMemo(() => {
    if (!search.trim()) return transactions;
    const q = search.toLowerCase();
    return transactions.filter(
      (t) =>
        t.receivedFrom.toLowerCase().includes(q) ||
        t.cashAmount.toLowerCase().includes(q) ||
        t.transactionId?.toLowerCase().includes(q) ||
        t.transactionDate.toLowerCase().includes(q)
    );
  }, [search, transactions]);

  const getHeaders = () => {
    if (activeTab === "disbursed") {
      return [
        { label: "Transaction ID", key: "transactionId" },
        { label: "Customer Name", key: "customerName" },
        { label: "Cash Disbursed", key: "cashDisbursed" },
        { label: "Currency Pair", key: "currencyPair" },
        { label: "Prepaid Amount", key: "prepaidAmount" },
        { label: "Transaction type", key: "transactionType" },
        { label: "Transaction Date", key: "transactionDate" },
        { label: "Action", key: "action" },
      ];
    }
    return [
      { label: "Received From", key: "receivedFrom" },
      { label: "Cash Received", key: "cashReceived" },
      { label: "Transaction Date", key: "transactionDate" },
      { label: "Action", key: "action" },
    ];
  };

  const renderRow = (item: CashTransaction) => {
    if (activeTab === "disbursed") {
      return [
        <Text key="transactionId" size="sm" fw={500}>
          {item.transactionId}
        </Text>,
        <Text key="customerName" size="sm">
          {item.receivedFrom}
        </Text>,
        <Text key="cashDisbursed" size="sm" fw={500}>
          {item.cashAmount}
        </Text>,
        <Text key="currencyPair" size="sm">
          {item.currencyPair}
        </Text>,
        <Text key="prepaidAmount" size="sm">
          {item.prepaidAmount}
        </Text>,
        <Badge key="transactionType" variant="light" color="orange" size="sm">
          {item.transactionType}
        </Badge>,
        <Text key="transactionDate" size="sm" c="dimmed">
          {item.transactionDate}
        </Text>,
        <button
          key="action"
          onClick={() => {
            setSelectedTransaction(item);
            setModalOpened(true);
          }}
          className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center hover:bg-primary-200 transition-colors"
        >
          <ChevronRight size={16} className="text-primary-400" />
        </button>,
      ];
    }

    return [
      <Text key="receivedFrom" size="sm" fw={500}>
        {item.receivedFrom}
      </Text>,
      <Text key="cashReceived" size="sm" fw={500}>
        {item.cashAmount}
      </Text>,
      <Text key="transactionDate" size="sm" c="dimmed">
        {item.transactionDate}
      </Text>,
      <button
        key="action"
        onClick={() => {
          setSelectedTransaction(item);
          setModalOpened(true);
        }}
        className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center hover:bg-primary-200 transition-colors"
      >
        <ChevronRight size={16} className="text-primary-400" />
      </button>,
    ];
  };

  return (
    <>
      <Card radius="md" padding="lg" withBorder>
        <Group justify="space-between" mb="md">
          <Tabs value={activeTab} onChange={(v) => setActiveTab(v as TransactionType)}>
            <Tabs.List>
              <Tabs.Tab value="disbursed">Cash Disbursed</Tabs.Tab>
              <Tabs.Tab value="received_from_customer">
                Cash Received from Customer
              </Tabs.Tab>
              <Tabs.Tab value="received_from_admin">
                Cash Received from Admin
              </Tabs.Tab>
            </Tabs.List>
          </Tabs>

          <Group gap="xs">
            <TextInput
              placeholder="Enter keyword"
              leftSection={<Search size={16} />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              size="sm"
              style={{ width: 200 }}
            />
            <Button
              variant="default"
              leftSection={<ListFilter size={16} />}
              size="sm"
            >
              Filter By
            </Button>
            <Button
              variant="outline"
              color="orange"
              leftSection={<Upload size={16} />}
              size="sm"
            >
              Export
            </Button>
          </Group>
        </Group>

        <DynamicTableSection
          headers={getHeaders()}
          data={filteredTransactions}
          loading={false}
          renderItems={renderRow}
          emptyTitle="No data available yet"
          emptyMessage="You currently have not have any data available yet. Check back Later."
        />
      </Card>

      {selectedTransaction && (
        <TransactionDetailsModal
          opened={modalOpened}
          onClose={() => {
            setModalOpened(false);
            setSelectedTransaction(null);
          }}
          transaction={{
            cashReceivedFrom:
              activeTab === "received_from_customer"
                ? selectedTransaction.cashAmount
                : undefined,
            nameOfAdmin: selectedTransaction.nameOfAdmin,
            transactionDate: selectedTransaction.transactionDate,
            transactionId: selectedTransaction.transactionId || "",
          }}
        />
      )}
    </>
  );
}
