"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Group, Select, Text, TextInput } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { Coins, CreditCard, ListFilter, Search, Upload } from "lucide-react";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import RowActionIcon from "@/app/admin/_components/RowActionIcon";
import StatCard from "@/app/admin/_components/StatCard";
import { adminRoutes } from "@/lib/adminRoutes";
import {
  AGENT_FX_INVENTORY_ROWS,
  AGENT_FX_INVENTORY_STATS,
  type AgentFxInventoryRow,
} from "../_data/agentFxInventoryMock";

const PAGE_SIZE = 6;

const AGENT_HEADERS = [
  { label: "Agent", key: "agent" },
  { label: "Contact", key: "contact" },
  { label: "Total Disbursement", key: "totalDisbursement" },
  { label: "Total Lodgment", key: "totalLodgment" },
  { label: "Action", key: "action" },
];

function matchesAgent(row: AgentFxInventoryRow, query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  return (
    row.agentName.toLowerCase().includes(normalized) ||
    row.agentId.toLowerCase().includes(normalized) ||
    `id:${row.agentId}`.includes(normalized) ||
    row.phone.toLowerCase().includes(normalized) ||
    row.email.toLowerCase().includes(normalized)
  );
}

function escapeCsv(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

function downloadCsv(filename: string, headers: string[], rows: string[][]) {
  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCsv).join(","))
    .join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}

export default function AgentFxInventorySection() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 350);

  const filteredRows = useMemo(
    () => AGENT_FX_INVENTORY_ROWS.filter((row) => matchesAgent(row, debouncedSearch)),
    [debouncedSearch]
  );

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filteredRows.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const renderRow = (item: AgentFxInventoryRow) => [
    <div key="agent">
      <Text fw={500} size="sm">
        {item.agentName}
      </Text>
      <Text size="xs" c="dimmed">
        ID:{item.agentId}
      </Text>
    </div>,
    <div key="contact">
      <Text fw={500} size="sm">
        {item.phone}
      </Text>
      <Text size="xs" c="dimmed">
        {item.email}
      </Text>
    </div>,
    <Text key="totalDisbursement" size="sm">
      {item.totalDisbursement}
    </Text>,
    <Text key="totalLodgment" size="sm">
      {item.totalLodgment}
    </Text>,
    <RowActionIcon
      key="action"
      onClick={() => router.push(adminRoutes.adminOutletAgentFxInventoryDetails(item.id))}
    />,
  ];

  const handleExport = () => {
    const dateStamp = new Date().toISOString().slice(0, 10);
    downloadCsv(
      `agent-fx-inventory-${dateStamp}.csv`,
      [
        "Agent",
        "Agent ID",
        "Phone",
        "Email",
        "Total Disbursement",
        "Total Lodgment",
      ],
      filteredRows.map((row) => [
        row.agentName,
        row.agentId,
        row.phone,
        row.email,
        String(row.totalDisbursement),
        String(row.totalLodgment),
      ])
    );
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Disbursement"
          value={AGENT_FX_INVENTORY_STATS.totalDisbursement}
          icon={<Coins className="h-5 w-5 text-primary-400" />}
          iconBg="bg-primary-00"
        />
        <StatCard
          title="Total Lodgments"
          value={AGENT_FX_INVENTORY_STATS.totalLodgments}
          icon={<Coins className="h-5 w-5 text-primary-300" />}
          iconBg="bg-primary-00"
        />
        <StatCard
          title="Pending Approvals"
          value={AGENT_FX_INVENTORY_STATS.pendingApprovals}
          icon={<Coins className="h-5 w-5 text-yellow-600" />}
          iconBg="bg-yellow-100"
        />
        <StatCard
          title="Approved Disbursement"
          value={AGENT_FX_INVENTORY_STATS.approvedDisbursement}
          icon={<CreditCard className="h-5 w-5 text-blue-600" />}
          iconBg="bg-blue-100"
        />
      </div>

      <div className="my-5 rounded-lg bg-white p-5">
        <Group justify="space-between" mb="md" wrap="wrap">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">Agents</h2>
            <TextInput
              placeholder="Enter keyword"
              leftSection={<Search size={16} color="#DD4F05" />}
              value={search}
              onChange={(event) => {
                setSearch(event.currentTarget.value);
                setPage(1);
              }}
              w={320}
              radius="xl"
            />
          </div>
          <Group>
            <Select
              data={[]}
              placeholder="Filter By"
              clearable
              radius="xl"
              w={120}
              rightSection={<ListFilter size={16} />}
            />
            <Button
              variant="outline"
              color="#E36C2F"
              radius="xl"
              rightSection={<Upload size={16} />}
              onClick={handleExport}
            >
              Export
            </Button>
          </Group>
        </Group>
        <DynamicTableSection
          headers={AGENT_HEADERS}
          data={pageRows}
          renderItems={renderRow}
          emptyTitle="No Agents Found"
          emptyMessage="There are currently no agents to display."
          pagination={{
            page: currentPage,
            totalPages,
            onNext: () => setPage((value) => Math.min(value + 1, totalPages)),
            onPrevious: () => setPage((value) => Math.max(value - 1, 1)),
            onPageChange: setPage,
          }}
        />
      </div>
    </>
  );
}
