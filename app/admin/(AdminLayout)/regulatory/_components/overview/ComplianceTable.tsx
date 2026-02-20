"use client";

import { useState, useMemo } from "react";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import {
  Text,
  Group,
  TextInput,
  Select,
  Button,
} from "@mantine/core";
import { Search, Upload, ListFilter } from "lucide-react";
import { useRouter } from "next/navigation";
import RowActionIcon from "@/app/admin/_components/RowActionIcon";
import { ReportSummaryModal } from "./[id]/page";

/* --------------------------------------------
 Types
--------------------------------------------- */
interface compliance {
  report: string;
  id: string;
  date: string;
  time: string;
  file: string;
  channel: string;
  status: "Submitted" | "Rejected" | "Pending";
}

/* --------------------------------------------
Mock Data
--------------------------------------------- */
const generateCompliance = (): compliance[] => [
  {
    report: "Daily FX sales Report",
    id: "1",
    date: "2025-10-04",
    time: "7:00am",
    file: "XML",
    channel: "FN window",
    status: "Submitted",
  },
  {
    report: "Weekly FX Allocation summary",
    id: "2",
    date: "2025-10-11",
    time: "14:00pm",
    file: "CSV",
    channel: "Manual upload",
    status: "Submitted",
  },
  {
    report: "Sanctions Screening summary",
    id: "3",
    date: "2025-10-18",
    time: "19:00pm",
    file: "PDF",
    channel: "System",
    status: "Pending",
  },
  {
    report: "Monthly BDC XML Export",
    id: "4",
    date: "2025-10-25",
    time: "15:30pm",
    file: "XML",
    channel: "CBN portal",
    status: "Rejected",
  },
  {
    report: "FX utilization Report",
    id: "5",
    date: "2025-10-30",
    time: "18:00pm",
    file: "PDF",
    channel: "System",
    status: "Submitted",
  },
  {
    report: "Suspicion transaction log",
    id: "6",
    date: "2025-11-05",
    time: "10:00am",
    file: "CSV",
    channel: "Manual upload",
    status: "Rejected",
  },
  {
    report: "Sophia Martinez",
    id: "7",
    date: "2025-11-12",
    time: "12:00pm",
    file: "PDF",
    channel: "System",
    status: "Submitted",
  },
  {
    report: "James Wilson",
    id: "8",
    date: "2025-11-19",
    time: "10:30am",
    file: "CSV",
    channel: "Manual upload",
    status: "Pending",
  },
  {
    report: "Isabella Brown",
    id: "9",
    date: "2025-11-26",
    time: "11:00am",
    file: "PDF",
    channel: "System",
    status: "Rejected",
  },
  {
    report: "William Davis",
    id: "10",
    date: "2025-12-03",
    time: "10:00am",
    file: "XML",
    channel: "FN window",
    status: "Submitted",
  },
  {
    report: "Charlotte Taylor",
    id: "11",
    date: "2025-12-10",
    time: "12:30pm",
    file: "PDF",
    channel: "System",
    status: "Pending",
  },
  {
    report: "Benjamin Anderson",
    id: "12",
    date: "2025-12-17",
    time: "11:00am",
    file: "CSV",
    channel: "Manual upload",
    status: "Rejected",
  },
  {
    report: "Amelia White",
    id: "13",
    date: "2025-12-24",
    time: "12:30pm",
    file: "PDF",
    channel: "System",
    status: "Submitted",
  },
  {
    report: "Lucas Harris",
    id: "14",
    date: "2025-12-31",
    time: "15:00pm",
    file: "CSV",
    channel: "FN window",
    status: "Rejected",
  },
  {
    report: "Mia Clark",
    id: "15",
    date: "2025-12-31",
    time: "09:30am",
    file: "PDF",
    channel: "System",
    status: "Submitted",
  },
];



/* --------------------------------------------
 Component
--------------------------------------------- */
export default function ComplianceTable() {
  /* Pagination state */
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [ isOpen, setIsOpen ] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Filter By");

  const allCompliances = useMemo(() => generateCompliance(), []);

  const filteredData = useMemo(() => {
    return allCompliances.filter((compliance) => {
      const matchesSearch =
        compliance.report.toLowerCase().includes(search.toLowerCase()) ||
        compliance.id.includes(search) ||
        compliance.time.toLowerCase().includes(search.toLowerCase()) ||
        compliance.date.includes(search);

      const matchesFilter =
        filter === "Filter By" ||
        filter === "All" ||
        compliance.status === filter;

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
  const complianceHeaders = [
    { label: "Report Name", key: "report" },
    { label: "Reporting Date", key: "reportingDate" },
    { label: "File type", key: "file" },
    { label: "Status", key: "status" },
    { label: "Channel", key: "channel" },
    { label: "Action", key: "action" },
  ];

  /* Row renderer */
  const rendercomplianceRow = (item: compliance) => [
    // compliance
    <div key="report">
      <Text fw={500} size="sm">
        {item.report}
      </Text>
    </div>,

    // Contact
    <div key="reportingDate">
      <Text fw={500} size="sm">
        {item.date}
      </Text>
      <Text size="xs" c="dimmed">
        {item.time}
      </Text>
    </div>,

    // Total Transactions
    <Text key="file" size="sm">
      {item.file}
    </Text>,

    // Status
    <StatusBadge key="status" status={item.status} />,

    // Transaction Volume
    <Text key="channel" size="sm">
      {item.channel}
    </Text>,

    

    // Action
    <RowActionIcon
      key="action"
      onClick={() => setIsOpen(true)}
    />
  ];

  return (
    <div className="my-5 p-5 rounded-lg bg-white">
      <div>
        <Group justify="space-between" mb="md" wrap="nowrap">
          <div className="flex items-center gap-4">
            <h2 className="font-semibold text-lg">Compliance Reports</h2>
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
              data={["Filter By", "All", "Submitted", "Rejected"]}
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
        headers={complianceHeaders}
        data={paginatedData}
        loading={false}
        renderItems={rendercomplianceRow}
        emptyTitle="No compliances Found"
        emptyMessage="There are currently no compliances to display. compliances will appear here once they create accounts."
        pagination={{
          page,
          totalPages,
          onNext: () => setPage((p) => Math.min(p + 1, totalPages)),
          onPrevious: () => setPage((p) => Math.max(p - 1, 1)),
          onPageChange: setPage,
        }}
      />
      <ReportSummaryModal opened={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}
