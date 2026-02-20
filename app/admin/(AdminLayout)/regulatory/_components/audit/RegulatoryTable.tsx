"use client";

import { useState, useMemo } from "react";
import { Text, Group, TextInput, Select, Button } from "@mantine/core";
import { Search, Upload, ListFilter } from "lucide-react";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import RowActionIcon from "@/app/admin/_components/RowActionIcon";
import { RegulatoryDetailModal } from "./RegulatoryDetailModal";

/* --------------------------------------------
 Types
--------------------------------------------- */
interface RegulatoryLog {
  timestamp: string;
  systemEvent: string;
  referenceId: string;
  externalEndpoint: string;
  responseMessage: string;
}

/* --------------------------------------------
 Mock Data
--------------------------------------------- */
const regulatoryLogs: RegulatoryLog[] = [
  {
    timestamp: "2025-09-15 09:00 AM",
    systemEvent: "Report submitted to FN Window",
    referenceId: "FNW-00982",
    externalEndpoint: "/api/v1/fnwindow/upload",
    responseMessage: "200 OK",
  },
  {
    timestamp: "2025-09-15 09:00 AM",
    systemEvent: "Validation check by CBN",
    referenceId: "CBN-02468",
    externalEndpoint: "/cbn/validate/report",
    responseMessage: "202 Accepted",
  },
  {
    timestamp: "2025-09-15 09:00 AM",
    systemEvent: "Report submission failed",
    referenceId: "FNW-00975",
    externalEndpoint: "/api/v1/fnwindow/upload",
    responseMessage: "504 Gateway Timeout",
  },
  {
    timestamp: "2025-09-15 09:00 AM",
    systemEvent: "FN Window retry attempt",
    referenceId: "FNW-00975",
    externalEndpoint: "/api/v1/fnwindow/retry",
    responseMessage: "200 OK",
  },
  {
    timestamp: "2025-09-15 09:00 AM",
    systemEvent: "CBN Compliance Upload",
    referenceId: "FNW-00975",
    externalEndpoint: "/cbn/upload/compliance",
    responseMessage: "406 Invalid Format",
  },
];

/* --------------------------------------------
 Component
--------------------------------------------- */
export default function RegulatoryLogTable() {
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("All");
  const [ isOpen, setIsOpen ] = useState(false);

  /* --------------------------------------------
   Filtering
  --------------------------------------------- */
  const filteredData = useMemo(() => {
    return regulatoryLogs.filter((log) => {
      const matchesSearch =
        log.systemEvent.toLowerCase().includes(search.toLowerCase()) ||
        log.referenceId.toLowerCase().includes(search.toLowerCase()) ||
        log.externalEndpoint.toLowerCase().includes(search.toLowerCase()) ||
        log.responseMessage.toLowerCase().includes(search.toLowerCase());

      const matchesSort =
        sortBy === "All" ||
        log.responseMessage.toLowerCase().includes(sortBy.toLowerCase());

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
    { label: "System Event", key: "systemEvent" },
    { label: "Reference ID", key: "referenceId" },
    { label: "External Endpoint", key: "externalEndpoint" },
    { label: "Response Code / Message", key: "responseMessage" },
    { label: "Action", key: "action" },
  ];

  /* --------------------------------------------
 Row Renderer
--------------------------------------------- */
  const renderRow = (item: RegulatoryLog) => [
    <Text size="sm" key="timestamp">{item.timestamp}</Text>,
    <Text size="sm" key="event">{item.systemEvent}</Text>,
    <Text size="sm" key="ref">{item.referenceId}</Text>,
    <Text size="sm" key="endpoint" c="dimmed">
      {item.externalEndpoint}
    </Text>,
    <Text
      size="sm"
      key="response"
    //   c={
    //     item.responseMessage.startsWith("200")
    //       ? "green"
    //       : item.responseMessage.startsWith("202")
    //       ? "blue"
    //       : "red"
    //   }
    >
      {item.responseMessage}
    </Text>,
    <RowActionIcon key="action" onClick={() => setIsOpen(true)} />,
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
            w={300}
          />

        <Group>
          

          <Select
            value={sortBy}
            onChange={(value) => setSortBy(value!)}
            data={["All", "200", "202", "400", "500"]}
            radius="xl"
            w={120}
            rightSection={<ListFilter size={16} />}
          />

          <Button
            radius="xl"
            color="#E36C2F"
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
        emptyTitle="No Regulatory Logs Found"
        emptyMessage="Regulatory interactions with FN and CBN will appear here."
        pagination={{
          page,
          totalPages,
          onNext: () => setPage((p) => Math.min(p + 1, totalPages)),
          onPrevious: () => setPage((p) => Math.max(p - 1, 1)),
          onPageChange: setPage,
        }}
      /> 
      <RegulatoryDetailModal opened={isOpen} onClose={() => setIsOpen(false)} />

    </div>
  );
}
