"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Group, Select, Text, TextInput } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { ListFilter, Search } from "lucide-react";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import RowActionIcon from "@/app/admin/_components/RowActionIcon";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import type { FxInventoryLodgmentStatus } from "@/app/admin/_services/admin-api";
import { adminRoutes } from "@/lib/adminRoutes";
import {
  FX_INVENTORY_LODGMENT_PAGE_SIZE,
  FX_INVENTORY_LODGMENT_STATUS_OPTIONS,
  useFxInventoryLodgments,
  type FxInventoryLodgmentRow,
} from "../../../settlement/hooks/useFxInventoryLodgments";
import {
  CONFIRMED_COLOR,
  CurrencyLabel,
  ExportButton,
  InventoryOverview,
  TimestampCell,
  downloadCsv,
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

export default function LodgmentTab({ agentId }: { agentId: string }) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [debouncedSearch] = useDebouncedValue(search, 350);
  const searchQuery = debouncedSearch.trim() || undefined;
  const status =
    statusFilter !== "All" ? (statusFilter as FxInventoryLodgmentStatus) : undefined;

  const queryParams = useMemo(
    () => ({
      page,
      limit: FX_INVENTORY_LODGMENT_PAGE_SIZE,
      search: searchQuery,
      status,
      agentId,
    }),
    [agentId, page, searchQuery, status]
  );

  const { lodgments, isLoading, isFetching, isError, totalPages } =
    useFxInventoryLodgments(queryParams);
  const pageCount = Math.max(totalPages, 1);

  const renderRow = (item: FxInventoryLodgmentRow) => [
    <Text key="reference" size="sm" fw={500}>
      {item.reference}
    </Text>,
    <CurrencyLabel key="currency" code={item.currency} label={item.currency} />,
    <Text key="amount" size="sm">
      {item.amountLodged}
    </Text>,
    <Text key="updated" size="sm">
      {item.updatedAmount ?? "-"}
    </Text>,
    <TimestampCell key="timestamp" date={item.date} time={item.time} />,
    <StatusBadge
      key="status"
      status={item.status}
      color={item.status === "Confirmed" ? CONFIRMED_COLOR : undefined}
    />,
    <RowActionIcon
      key="action"
      onClick={() => router.push(adminRoutes.adminSettlementLodgmentDetails(item.id))}
    />,
  ];

  const handleExport = () => {
    const dateStamp = new Date().toISOString().slice(0, 10);
    downloadCsv(
      `agent-fx-lodgments-${dateStamp}.csv`,
      ["Reference", "Currency", "Amount Lodged", "Updated Amount", "Date", "Time", "Status"],
      lodgments.map((row) => [
        row.reference,
        row.currency,
        row.amountLodged,
        row.updatedAmount ?? "-",
        row.date,
        row.time,
        row.status,
      ])
    );
  };

  return (
    <div className="space-y-4">
      <InventoryOverview agentId={agentId} />
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
            <Select
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value ?? "All");
                setPage(1);
              }}
              data={FX_INVENTORY_LODGMENT_STATUS_OPTIONS}
              radius="xl"
              w={150}
              rightSection={<ListFilter size={16} />}
              aria-label="Filter by status"
            />
            <ExportButton onClick={handleExport} />
          </Group>
        </Group>
        <DynamicTableSection
          headers={LODGMENT_HEADERS}
          data={isError ? [] : lodgments}
          loading={isLoading || isFetching}
          renderItems={renderRow}
          emptyTitle={isError ? "Could not load lodgments" : "No Lodgments Found"}
          emptyMessage={
            isError
              ? "Something went wrong while loading lodgments. Try again."
              : "There are currently no lodgments to display."
          }
          pagination={
            !isError && lodgments.length > 0
              ? {
                  page,
                  totalPages: pageCount,
                  onNext: () => setPage((value) => Math.min(value + 1, pageCount)),
                  onPrevious: () => setPage((value) => Math.max(value - 1, 1)),
                  onPageChange: setPage,
                }
              : undefined
          }
        />
      </section>
    </div>
  );
}
