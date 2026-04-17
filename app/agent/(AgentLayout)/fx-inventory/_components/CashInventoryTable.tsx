"use client";

import { useCallback, useMemo, useState } from "react";
import { ActionIcon, Badge, Card, TextInput } from "@mantine/core";
import {
  TableWrapper,
  type FilterTabOption,
  type PaginatedTableColumn,
} from "@/app/agent/_components/common";
import {
  type TableFilterGroup,
  type TableFilterValues,
} from "@/app/agent/_components/common/table/TableFilterSheet";
import { IconArrowRight } from "@/components/icons/IconArrowRight";
import { TransactionDetailsModal } from "./TransactionDetailsModal";

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

const FILTER_TABS: FilterTabOption[] = [
  { value: "disbursed", label: "Cash Disbursed" },
  { value: "received_from_customer", label: "Cash Received from Customer" },
  { value: "received_from_admin", label: "Cash Received from Admin" },
];

const CASH_FILTER_GROUPS: TableFilterGroup[] = [
  {
    label: "Status",
    key: "status",
    type: "single",
    options: [
      { label: "All", value: "all" },
      { label: "Pending", value: "pending" },
      { label: "Completed", value: "completed" },
    ],
  },
];

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
      receivedFrom: t.receivedFrom,
    }));
  }

  return baseTransactions;
};

export function CashInventoryTable() {
  const [activeTab, setActiveTab] = useState<TransactionType>("received_from_customer");
  const [search, setSearch] = useState("");
  const [filterValues, setFilterValues] = useState<TableFilterValues>({
    selections: {},
    dateRange: null,
  });
  const [selectedTransaction, setSelectedTransaction] = useState<CashTransaction | null>(null);
  const [modalOpened, setModalOpened] = useState(false);

  const transactions = useMemo(() => generateMockTransactions(activeTab), [activeTab]);

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

  const openDetails = useCallback((item: CashTransaction) => {
    setSelectedTransaction(item);
    setModalOpened(true);
  }, []);

  const columns = useMemo((): PaginatedTableColumn<CashTransaction>[] => {
    if (activeTab === "disbursed") {
      return [
        {
          key: "transactionId",
          label: "Transaction ID",
          render: (t) => (
            <p className="text-body-text-300 font-medium text-sm leading-5">{t.transactionId}</p>
          ),
        },
        {
          key: "customerName",
          label: "Customer Name",
          render: (t) => (
            <p className="text-body-text-400 text-sm leading-5">{t.receivedFrom}</p>
          ),
        },
        {
          key: "cashDisbursed",
          label: "Cash Disbursed",
          render: (t) => (
            <p className="text-body-text-300 font-medium text-sm leading-5">{t.cashAmount}</p>
          ),
        },
        {
          key: "currencyPair",
          label: "Currency Pair",
          render: (t) => (
            <p className="text-body-text-400 text-sm leading-5">{t.currencyPair}</p>
          ),
        },
        {
          key: "prepaidAmount",
          label: "Prepaid Amount",
          render: (t) => (
            <p className="text-body-text-400 text-sm leading-5">{t.prepaidAmount}</p>
          ),
        },
        {
          key: "transactionType",
          label: "Transaction type",
          render: (t) => (
            <Badge variant="light" color="orange" size="sm">
              {t.transactionType}
            </Badge>
          ),
        },
        {
          key: "transactionDate",
          label: "Transaction Date",
          render: (t) => (
            <p className="text-body-text-200 text-sm leading-5">{t.transactionDate}</p>
          ),
        },
        {
          key: "action",
          label: "",
          headerClassName: "w-12",
          className: "w-12",
          render: (row) => (
            <ActionIcon
              radius="md"
              variant="light"
              w={40}
              h={40}
              className="bg-[#FFF6F1]! border border-[#FFF6F1]!"
              style={{
                boxShadow: "0px 1px 2px rgba(16, 24, 40, 0.05)",
                padding: "10px",
              }}
              onClick={(e) => {
                e.stopPropagation();
                openDetails(row);
              }}
              aria-label="View transaction details"
            >
              <IconArrowRight className="w-8 h-8" />
            </ActionIcon>
          ),
        },
      ];
    }

    return [
      {
        key: "receivedFrom",
        label: "Received From",
        render: (t) => (
          <p className="text-body-text-300 font-medium text-sm leading-5">{t.receivedFrom}</p>
        ),
      },
      {
        key: "cashReceived",
        label: "Cash Received",
        render: (t) => (
          <p className="text-body-text-300 font-medium text-sm leading-5">{t.cashAmount}</p>
        ),
      },
      {
        key: "transactionDate",
        label: "Transaction Date",
        render: (t) => (
          <p className="text-body-text-200 text-sm leading-5">{t.transactionDate}</p>
        ),
      },
      {
        key: "action",
        label: "",
        headerClassName: "w-12",
        className: "w-12",
        render: (row) => (
          <ActionIcon
            radius="md"
            variant="light"
            w={40}
            h={40}
            className="bg-[#FFF6F1]! border border-[#FFF6F1]!"
            style={{
              boxShadow: "0px 1px 2px rgba(16, 24, 40, 0.05)",
              padding: "10px",
            }}
            onClick={(e) => {
              e.stopPropagation();
              openDetails(row);
            }}
            aria-label="View transaction details"
          >
            <IconArrowRight className="w-8 h-8" />
          </ActionIcon>
        ),
      },
    ];
  }, [activeTab, openDetails]);

  return (
    <>
      <Card radius="md" padding="lg" withBorder>
        <TableWrapper<CashTransaction>
          title="Cash inventory"
          filterOptions={FILTER_TABS}
          activeFilter={activeTab}
          onFilterChange={(v) => setActiveTab(v as TransactionType)}
          filters={CASH_FILTER_GROUPS}
          filterValues={filterValues}
          onFiltersApply={setFilterValues}
          filterSheetTitle="Filter By"
          onExportClick={() => {
            // Wire to export API when available
          }}
          toolbarBelowFilters={
            <div className="flex flex-col gap-3 pt-2 pb-2 sm:flex-row sm:items-center sm:justify-between">
              <TextInput
                placeholder="Enter keyword"
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
                size="sm"
                className="w-full sm:max-w-xs"
              />
            </div>
          }
          data={filteredTransactions}
          columns={columns}
          pageSize={10}
          onRowClick={openDetails}
          keyExtractor={(t) => t.id}
          emptyTitle="No data available yet"
          emptyMessage="You currently have not have any data available yet. Check back Later."
          isLoading={false}
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
