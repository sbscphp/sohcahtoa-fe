"use client";

import { useState, useMemo } from "react";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { Text, Group, TextInput, Select, Button } from "@mantine/core";
import { Search, Upload, ListFilter } from "lucide-react";
import { useRouter } from "next/navigation";
import RowActionIcon from "@/app/admin/_components/RowActionIcon";
import { ReportsDetailModal } from "./ReportsDetailModal";

/* --------------------------------------------
 Types
--------------------------------------------- */
interface Submission {
  reportId: string;
  reportName: string;
  reportType: string;
  submittedDate: string;
  submittedTime: string;
  status: "Success" | "Pending";
  submittedBy: string;
}

/* --------------------------------------------
Mock Data
--------------------------------------------- */
const submissions: Submission[] = [
  {
    reportId: "REP-2031",
    reportName: "Daly Dx Sales Summary",
    reportType: "Weekly",
    submittedDate: "2025-10-21",
    submittedTime: "09:45",
    status: "Success",
    submittedBy: "System Auto",
  },
  {
    reportId: "REP-2032",
    reportName: "PTA Allocations Summary",
    reportType: "Daily",
    submittedDate: "2025-10-01",
    submittedTime: "09:45",
    status: "Pending",
    submittedBy: "Compliance officer",
  },
  {
    reportId: "REP-2033",
    reportName: "Monthly FX report dc",
    reportType: "Monthly",
    submittedDate: "2025-10-21",
    submittedTime: "16:45",
    status: "Success",
    submittedBy: "Admin"
  },
  {
    reportId: "REP-2034",
    reportName: "CBN Weekly report",
    reportType: "Daily",
    submittedDate: "2025-09-30",
    submittedTime: "15:05",
    status: "Success",
    submittedBy: "System Auto"
  },

  {
    reportId: "REP-2032",
    reportName: "Corporate FX report",
    reportType: "Weekly",
    submittedDate: "2025-10-01",
    submittedTime: "11:27",
    status: "Pending",
    submittedBy: "Compliance Officer"
  },
  {
    reportId: "REP-2033",
    reportName: "Daly Branch Report",
    reportType: "monthly",
    submittedDate: "2025-10-21",
    submittedTime: "11:45",
    status: "Success",
    submittedBy: "System Auto"
  },

  {
    reportId: "REP-2032",
    reportName: "Corporate Branch report",
    reportType: "Daily",
    submittedDate: "2025-10-01",
    submittedTime: "09:45",
    status: "Pending",
    submittedBy: "Compliance Officer"
  },
  {
    reportId: "REP-2033",
    reportName: "PTA Allocation report",
    reportType: "Weekly",
    submittedDate: "2025-10-21",
    submittedTime: "19:45",
    status: "Success",
    submittedBy: "Admin"
  },
];

/* --------------------------------------------
 Helper Functions
--------------------------------------------- */
const generateSubmissions = () => submissions;

/* --------------------------------------------
 Component
--------------------------------------------- */
export default function ReportsTable() {
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
        submission.reportId.toLowerCase().includes(search.toLowerCase()) ||
        submission.reportName.toLowerCase().includes(search.toLowerCase()) ||
        submission.reportType.toLowerCase().includes(search.toLowerCase()) ||
        submission.submittedDate
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        submission.SubmittedTime.toLowerCase().includes(search.toLowerCase());

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
    { label: "Report ID", key: "reportId" },
    { label: "Report Name", key: "reportName" },
    { label: "Report Type", key: "reportType" },
    { label: "submitted Date", key: "submittedDate" },
    { label: "Status", key: "status" },
    { label: "Submitted By", key: "SubmittedBy" },
    { label: "Action", key: "action" },
  ];

  /* Row renderer */
  const renderRow = (item: Submission) => [
    <Text key="id" fw={500} size="sm">
      {item.reportId}
    </Text>,

    <Text key="name" size="sm">
      {item.reportName}
    </Text>,

    <Text key="pair" size="sm">
      {item.reportType}
    </Text>,

    <div key="date-time" className="flex flex-col gap-1">
    <Text key="submittedDate" size="sm">
      {item.submittedDate}
    </Text>
    <Text key="submittedTime" size="xs">
      {item.submittedTime}
    </Text>

    </div>,

    <StatusBadge key="status" status={item.status} />,
    <Text key="submittedBy" size="sm">
      {item.submittedBy}
    </Text>,

    <RowActionIcon key="action" onClick={() => setIsOpen(true)} />,
  ];

  return (
    <div className="my-5 p-5 rounded-lg bg-white">
      <div>
        <Group justify="space-between" mb="md" wrap="nowrap">
          <div className="flex items-center gap-4">
            <h2 className="font-semibold text-lg">FN?/CBN Reports</h2>
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
              data={["Filter By", "All", "Success", "Pending"]}
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
      <ReportsDetailModal opened={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}
