"use client";

import { useState, useMemo } from "react";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { Text, Group, TextInput, Select, Button } from "@mantine/core";
import { Search, Upload, ListFilter } from "lucide-react";
import { useRouter } from "next/navigation";
import RowActionIcon from "@/app/admin/_components/RowActionIcon";
import { SubmissionDetailModal } from "./SubmissionDetailModal";
// import { ReportSummaryModal } from "./[id]/page";

/* --------------------------------------------
 Types
--------------------------------------------- */
interface Submission {
  transactionId: string;
  customerName: string;
  currencyPair: string;
  transactionType: string;
  amount: string;
  status: "Submitted" | "Pending" | "Rejected";
}

/* --------------------------------------------
Mock Data
--------------------------------------------- */
const submissions: Submission[] = [
  {
    transactionId: "TXN-2031",
    customerName: "John Doe",
    currencyPair: "USD/NGN",
    transactionType: "BTA",
    amount: "$3,000",
    status: "Submitted",
  },
  {
    transactionId: "TXN-2032",
    customerName: "Sarah Bas",
    currencyPair: "GBP/NGN",
    transactionType: "PTA",
    amount: "£2,500",
    status: "Pending",
  },
  {
    transactionId: "TXN-2033",
    customerName: "Ola Bdc",
    currencyPair: "EUR/NGN",
    transactionType: "BTA",
    amount: "€2,500",
    status: "Rejected",
  },
  {
    transactionId: "TXN-2034",
    customerName: "Adekunle",
    currencyPair: "USD/NGN",
    transactionType: "School fees",
    amount: "$3,000",
    status: "Submitted",
  },

  {
    transactionId: "TXN-2032",
    customerName: "Sarah Bas",
    currencyPair: "GBP/NGN",
    transactionType: "PTA",
    amount: "£2,500",
    status: "Pending",
  },
  {
    transactionId: "TXN-2033",
    customerName: "Ola Bdc",
    currencyPair: "EUR/NGN",
    transactionType: "BTA",
    amount: "€2,500",
    status: "Rejected",
  },

  {
    transactionId: "TXN-2032",
    customerName: "Sarah Bas",
    currencyPair: "GBP/NGN",
    transactionType: "PTA",
    amount: "£2,500",
    status: "Pending",
  },
  {
    transactionId: "TXN-2033",
    customerName: "Ola Bdc",
    currencyPair: "EUR/NGN",
    transactionType: "BTA",
    amount: "€2,500",
    status: "Rejected",
  },
];

/* --------------------------------------------
 Helper Functions
--------------------------------------------- */
const generateSubmissions = () => submissions;

/* --------------------------------------------
 Component
--------------------------------------------- */
export default function SubmissionTable() {
  /* Pagination state */
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Filter By");

  const allCompliances = useMemo(() => generateSubmissions(), []);

  const filteredData = useMemo(() => {
    return allCompliances.filter((submission) => {
      const matchesSearch =
        submission.transactionId.toLowerCase().includes(search.toLowerCase()) ||
        submission.customerName.toLowerCase().includes(search.toLowerCase()) ||
        submission.currencyPair.toLowerCase().includes(search.toLowerCase()) ||
        submission.transactionType
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        submission.amount.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        filter === "Filter By" ||
        filter === "All" ||
        submission.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [search, filter, allCompliances]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredData.slice(start, end);
  }, [page, filteredData]);

  /* Table headers */
  const headers = [
    { label: "Transaction ID", key: "transactionId" },
    { label: "Customer Name", key: "customerName" },
    { label: "Currency Pair", key: "currencyPair" },
    { label: "transaction Type", key: "transactionType" },
    { label: "Amount", key: "amount" },
    { label: "Status", key: "status" },
    { label: "Action", key: "action" },
  ];

  /* Row renderer */
  const renderRow = (item: Submission) => [
    <Text key="id" fw={500} size="sm">
      {item.transactionId}
    </Text>,

    <Text key="name" size="sm">
      {item.customerName}
    </Text>,

    <Text key="pair" size="sm">
      {item.currencyPair}
    </Text>,

    <Text key="type" size="sm">
      {item.transactionType}
    </Text>,

    <Text key="amount" size="sm">
      {item.amount}
    </Text>,

    <StatusBadge key="status" status={item.status} />,

    <RowActionIcon key="action" onClick={() => setIsOpen(true)} />,
  ];

  return (
    <div className="my-5 p-5 rounded-lg bg-white">
      <div>
        <Group justify="space-between" mb="md" wrap="nowrap">
          <div className="flex items-center gap-4">
            <h2 className="font-semibold text-lg">TRMS Submissions</h2>
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
              data={["Filter By", "All", "Submitted", "Rejected", "Pending"]}
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
        headers={headers}
        data={paginatedData}
        loading={false}
        renderItems={renderRow}
        emptyTitle="No submissions Found"
        emptyMessage="There are currently no submissions to display. Submissions will appear here once they are made."
        pagination={{
          page,
          totalPages,
          onNext: () => setPage((p) => Math.min(p + 1, totalPages)),
          onPrevious: () => setPage((p) => Math.max(p - 1, 1)),
          onPageChange: setPage,
        }}
      />
      <SubmissionDetailModal opened={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}
