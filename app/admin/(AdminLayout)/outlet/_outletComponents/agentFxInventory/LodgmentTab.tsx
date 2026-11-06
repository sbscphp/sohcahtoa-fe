"use client";

import { useMemo, useState } from "react";
import { Group, Text, TextInput } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { Search } from "lucide-react";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import RowActionIcon from "@/app/admin/_components/RowActionIcon";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import {
  AGENT_FX_LODGMENTS,
  type AgentFxLodgmentRow,
} from "../../_data/agentFxInventoryMock";
import {
  CONFIRMED_COLOR,
  CurrencyLabel,
  ExportButton,
  FilterSelect,
  InventoryOverview,
  TimestampCell,
  downloadCsv,
  paginate,
} from "./detailShared";

const LODGMENT_HEADERS = [
  { label: "Reference", key: "reference" },
  { label: "Currency", key: "currency" },
  { label: "Amount Lodged", key: "amount" },
  { label: "Updated Amount", key: "updated" },
  { label: "Timestamp", key: "timestamp" },
  { label: "Status", key: "status" },
  { label: "Action", key: "action" },
];

export default function LodgmentTab() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string | null>(null);
  const [debouncedSearch] = useDebouncedValue(search, 350);

  const filtered = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    return AGENT_FX_LODGMENTS.filter((row) => {
      const matchesQuery =
        !query ||
        row.reference.toLowerCase().includes(query) ||
        row.currency.toLowerCase().includes(query);
      const matchesFilter = !filter || row.status === filter;
      return matchesQuery && matchesFilter;
    });
  }, [debouncedSearch, filter]);

  const pageResult = paginate(filtered, page);

  const renderRow = (item: AgentFxLodgmentRow) => [
    <Text key="reference" size="sm" fw={500}>
      {item.reference}
    </Text>,
    <CurrencyLabel key="currency" code={item.currency} label={item.currency} />,
    <Text key="amount" size="sm">
      {item.amountLodged}
    </Text>,
    <Text key="updated" size="sm">
      {item.updatedAmount}
    </Text>,
    <TimestampCell key="timestamp" date={item.date} time={item.time} />,
    <StatusBadge
      key="status"
      status={item.status}
      color={item.status === "Confirmed" ? CONFIRMED_COLOR : undefined}
    />,
    <RowActionIcon key="action" onClick={() => undefined} />,
  ];

  const handleExport = () => {
    const dateStamp = new Date().toISOString().slice(0, 10);
    downloadCsv(
      `agent-fx-lodgments-${dateStamp}.csv`,
      ["Reference", "Currency", "Amount Lodged", "Updated Amount", "Date", "Time", "Status"],
      filtered.map((row) => [
        row.reference,
        row.currency,
        row.amountLodged,
        row.updatedAmount,
        row.date,
        row.time,
        row.status,
      ])
    );
  };

  return (
    <div className="space-y-4">
      <InventoryOverview />
      <section className="rounded-lg bg-white p-5">
        <Group justify="space-between" wrap="wrap" mb="md">
          <div className="flex items-center gap-4">
            <h2 className="text-base font-semibold">Lodgment</h2>
            <TextInput
              placeholder="Enter keyword"
              leftSection={<Search size={16} color="#DD4F05" />}
              value={search}
              onChange={(event) => {
                setSearch(event.currentTarget.value);
                setPage(1);
              }}
              w={280}
              radius="xl"
            />
          </div>
          <Group>
            <FilterSelect
              value={filter}
              data={["Pending", "Confirmed", "Rejected"]}
              onChange={(value) => {
                setFilter(value);
                setPage(1);
              }}
            />
            <ExportButton onClick={handleExport} />
          </Group>
        </Group>
        <DynamicTableSection
          headers={LODGMENT_HEADERS}
          data={pageResult.rows}
          renderItems={renderRow}
          emptyTitle="No Lodgments Found"
          emptyMessage="There are currently no lodgments to display."
          pagination={{
            page: pageResult.currentPage,
            totalPages: pageResult.totalPages,
            onNext: () => setPage((value) => Math.min(value + 1, pageResult.totalPages)),
            onPrevious: () => setPage((value) => Math.max(value - 1, 1)),
            onPageChange: setPage,
          }}
        />
      </section>
    </div>
  );
}
