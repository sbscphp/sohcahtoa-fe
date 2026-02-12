"use client";

import { useState, useMemo } from "react";
import { Text, Group, TextInput, Select, Button } from "@mantine/core";
import { Search, Upload, ListFilter } from "lucide-react";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import RowActionIcon from "@/app/admin/_components/RowActionIcon";
import { AuditDetailModal } from "./AuditDetailModal";

/* --------------------------------------------
 Types
--------------------------------------------- */
interface AuditLog {
  timestamp: string;
  user: string;
  actionPerformed: string;
  module: string;
  affectedReportId: string;
}

/* --------------------------------------------
 Mock Data
--------------------------------------------- */
const auditLogs: AuditLog[] = [
  {
    timestamp: "2025-09-15 09:00 AM",
    user: "System Auto",
    actionPerformed: "Generated new Daily FX Report",
    module: "Rate Management",
    affectedReportId: "REP-2025012",
  },
  {
    timestamp: "2025-09-15 09:00 AM",
    user: "Compliance Officer",
    actionPerformed: "Reviewed report before submission",
    module: "FN Reports",
    affectedReportId: "REP-2025012",
  },
  {
    timestamp: "2025-09-15 09:00 AM",
    user: "FN Integration",
    actionPerformed: "Submitted report to FN Window",
    module: "API Service",
    affectedReportId: "REP-2025012",
  },
  {
    timestamp: "2025-09-15 09:00 AM",
    user: "Admin",
    actionPerformed: "Updated FX Allocation Rate",
    module: "Rate Management",
    affectedReportId: "-----",
  },
  {
    timestamp: "2025-09-15 09:00 AM",
    user: "FN Integration",
    actionPerformed: "Report failed submission",
    module: "CBN Export",
    affectedReportId: "REP-2025009",
  },
];

/* --------------------------------------------
 Component
--------------------------------------------- */
export default function AuditLogTable() {
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("All");
  const [ isOpen, setIsOpen ] = useState(false);

  const filteredData = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchesSearch =
        log.user.toLowerCase().includes(search.toLowerCase()) ||
        log.actionPerformed.toLowerCase().includes(search.toLowerCase()) ||
        log.module.toLowerCase().includes(search.toLowerCase()) ||
        log.affectedReportId.toLowerCase().includes(search.toLowerCase());

      const matchesSort = sortBy === "All" || log.module === sortBy;

      return matchesSearch && matchesSort;
    });
  }, [search, sortBy]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [page, filteredData]);

  /* --------------------------------------------
 Table Headers
--------------------------------------------- */
  const headers = [
    { label: "Timestamp", key: "timestamp" },
    { label: "User / System", key: "user" },
    { label: "Action Performed", key: "actionPerformed" },
    { label: "Module / Section", key: "module" },
    { label: "Affected Report ID", key: "affectedReportId" },
    { label: "Action", key: "action" },
  ];

  /* --------------------------------------------
 Row Renderer
--------------------------------------------- */
  const renderRow = (item: AuditLog) => [
    <Text size="sm" key="timestamp">{item.timestamp}</Text>,
    <Text size="sm" key="user">{item.user}</Text>,
    <Text size="sm" key="action">{item.actionPerformed}</Text>,
    <Text size="sm" key="module" c="dimmed">{item.module}</Text>,
    <Text size="sm" key="report">{item.affectedReportId}</Text>,
        <RowActionIcon key="action" onClick={() => setIsOpen(true)} />,
,
  ];

  return (
    <div className="my-5 p-5 rounded-lg bg-white">
      {/* Header */}
      <Group justify="space-between" mb="md">
        <TextInput
            placeholder="Enter keyword"
            leftSection={<Search size={16} color="#DD4F05" />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            radius="xl"
            w={280}
          />

        <Group>
          

          <Select
            value={sortBy}
            onChange={(value) => setSortBy(value!)}
            data={["All", "Rate Management", "FN Reports", "API Service", "CBN Export"]}
            radius="xl"
            w={150}
            rightSection={<ListFilter size={16} />}
          />

          <Button
            color="#E36C2F"
            radius="xl"
            rightSection={<Upload size={16} />}
          >
            Export
          </Button>
        </Group>
      </Group>

      {/* Table */}
      <DynamicTableSection
        headers={headers}
        data={paginatedData}
        loading={false}
        renderItems={renderRow}
        emptyTitle="No Audit Logs Found"
        emptyMessage="System and user activities will appear here."
        pagination={{
          page,
          totalPages,
          onNext: () => setPage((p) => Math.min(p + 1, totalPages)),
          onPrevious: () => setPage((p) => Math.max(p - 1, 1)),
          onPageChange: setPage,
        }}
      />
      <AuditDetailModal opened={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}
