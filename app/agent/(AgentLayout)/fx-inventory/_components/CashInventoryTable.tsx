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
  Select,
} from "@mantine/core";
import { Search, ListFilter, Upload, ChevronRight } from "lucide-react";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import { ActionButton } from "@/app/admin/_components/ActionButton";
import { TransactionDetailsModal } from "./TransactionDetailsModal";
import { SELECT_WIDTH } from "@/app/agent/utils/constants";

type TransactionType =
  | "disbursed"
  | "received_from_customer"
  | "received_from_admin";

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

const generateMockTransactions = (type: TransactionType): CashTransaction[] => {
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
  const [activeTab, setActiveTab] = useState<TransactionType>(
    "received_from_customer",
  );
  const [search, setSearch] = useState("");
  const [selectedTransaction, setSelectedTransaction] =
    useState<CashTransaction | null>(null);
  const [modalOpened, setModalOpened] = useState(false);

  const transactions = useMemo(
    () => generateMockTransactions(activeTab),
    [activeTab],
  );

  const filteredTransactions = useMemo(() => {
    if (!search.trim()) return transactions;
    const q = search.toLowerCase();
    return transactions.filter(
      (t) =>
        t.receivedFrom.toLowerCase().includes(q) ||
        t.cashAmount.toLowerCase().includes(q) ||
        t.transactionId?.toLowerCase().includes(q) ||
        t.transactionDate.toLowerCase().includes(q),
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
        <ActionButton
          key="action"
          onClick={() => {
            setSelectedTransaction(item);
            setModalOpened(true);
          }}
          aria-label="View transaction details"
        />,
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
      <ActionButton
        key="action"
        onClick={() => {
          setSelectedTransaction(item);
          setModalOpened(true);
        }}
        aria-label="View transaction details"
      />,
    ];
  };

  return (
    <>
      <Card radius="md" padding="lg" withBorder>
        <Group justify="space-between" mb="md">
          <Tabs
            value={activeTab}
            onChange={(v) => setActiveTab(v as TransactionType)}
          >
            <Tabs.List className="w-full flex flex-1 flex-wrap items-start gap-3 border-0 bg-transparent pb-3">
              {[
                { value: "disbursed" as const, label: "Cash Disbursed" },
                {
                  value: "received_from_customer" as const,
                  label: "Cash Received from Customer",
                },
                {
                  value: "received_from_admin" as const,
                  label: "Cash Received from Admin",
                },
              ].map((tab) => {
                const isActive = activeTab === tab.value;
                return (
                  <Tabs.Tab
                    key={tab.value}
                    value={tab.value}
                    className={`shrink-0 cursor-pointer rounded-full! border px-2.5 py-1.5 text-sm font-normal leading-[120%] transition-colors mx-2 ${
                      isActive
                        ? "border! border-primary-100! bg-[#FFF6F1]! text-primary-400!"
                        : "border! border-[#E4E4E7]! bg-white! text-gray-900! hover:border-gray-300!"
                    }`}
                  >
                    {tab.label}
                  </Tabs.Tab>
                );
              })}
            </Tabs.List>
          </Tabs>
        </Group>
        <div className="flex items-center gap-2 justify-between pt-2 pb-6">
          <TextInput
            placeholder="Enter keyword"
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            size="sm"
          />
          <div className="flex items-center gap-2">
            <Select
              placeholder="Filter By"
              data={["All", "Pending", "Completed"]}
              size="sm"
              w={SELECT_WIDTH}
            />
            <Button
              variant="outline"
              color="orange"
              size="sm"
              rightSection={<Upload size={16} />}
              w={SELECT_WIDTH}
            >
              Export
            </Button>
          </div>
        </div>
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
