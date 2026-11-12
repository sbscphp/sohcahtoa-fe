"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Group, Select, Text, TextInput } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { ListFilter, Plus, Search } from "lucide-react";
import { CustomButton } from "@/app/admin/_components/CustomButton";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import RowActionIcon from "@/app/admin/_components/RowActionIcon";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import type { FxInventoryDisbursementStatus } from "@/app/admin/_services/admin-api";
import { adminRoutes } from "@/lib/adminRoutes";
import {
  FX_INVENTORY_DISBURSEMENT_PAGE_SIZE,
  FX_INVENTORY_DISBURSEMENT_STATUS_OPTIONS,
  useFxInventoryDisbursements,
  type FxInventoryDisbursementRow,
} from "../../../settlement/hooks/useFxInventoryDisbursements";
import {
  CurrencyLabel,
  ExportButton,
  InventoryOverview,
  TimestampCell,
  downloadCsv,
} from "./detailShared";

const DISBURSEMENT_HEADERS = [
  { label: "Reference", key: "reference" },
  { label: "Currency", key: "currency" },
  { label: "Amount Disbursed", key: "amount" },
  { label: "Date Disbursed", key: "date" },
  { label: "Workflow Stage", key: "stage" },
  { label: "Status", key: "status" },
  { label: "Action", key: "action" },
];

export default function DisbursementTab({ agentId }: { agentId: string }) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [debouncedSearch] = useDebouncedValue(search, 350);
  const searchQuery = debouncedSearch.trim() || undefined;
  const status =
    statusFilter !== "All" ? (statusFilter as FxInventoryDisbursementStatus) : undefined;

  const queryParams = useMemo(
    () => ({
      page,
      limit: FX_INVENTORY_DISBURSEMENT_PAGE_SIZE,
      search: searchQuery,
      status,
      agentId,
    }),
    [agentId, page, searchQuery, status]
  );

  const { disbursements, isLoading, isFetching, isError, totalPages } =
    useFxInventoryDisbursements(queryParams);
  const pageCount = Math.max(totalPages, 1);

  const renderRow = (item: FxInventoryDisbursementRow) => [
    <Text key="reference" size="sm" fw={500}>
      {item.reference}
    </Text>,
    <CurrencyLabel key="currency" code={item.currency} label={item.currency} />,
    <Text key="amount" size="sm">
      {item.amount}
    </Text>,
    <TimestampCell key="date" date={item.date} time={item.time} />,
    <Text key="stage" size="sm">
      {item.workflowStage}
    </Text>,
    <StatusBadge key="status" status={item.status} />,
    <RowActionIcon
      key="action"
      onClick={() => router.push(adminRoutes.adminSettlementDisbursementDetails(item.id))}
    />,
  ];

  const handleExport = () => {
    const dateStamp = new Date().toISOString().slice(0, 10);
    downloadCsv(
      `agent-fx-disbursements-${dateStamp}.csv`,
      ["Reference", "Currency", "Amount Disbursed", "Date", "Time", "Workflow Stage", "Status"],
      disbursements.map((row) => [
        row.reference,
        row.currency,
        row.amount,
        row.date,
        row.time,
        row.workflowStage,
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
            <h2 className="text-base font-semibold">Disbursement</h2>
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
              data={FX_INVENTORY_DISBURSEMENT_STATUS_OPTIONS}
              radius="xl"
              w={150}
              rightSection={<ListFilter size={16} />}
              aria-label="Filter by status"
            />
            <ExportButton onClick={handleExport} />
            <CustomButton
              buttonType="primary"
              rightSection={<Plus size={16} />}
              onClick={() => router.push(adminRoutes.adminSettlementDisburseCash())}
            >
              Disburse Cash
            </CustomButton>
          </Group>
        </Group>
        <DynamicTableSection
          headers={DISBURSEMENT_HEADERS}
          data={isError ? [] : disbursements}
          loading={isLoading || isFetching}
          renderItems={renderRow}
          emptyTitle={isError ? "Could not load disbursements" : "No Disbursements Found"}
          emptyMessage={
            isError
              ? "Something went wrong while loading disbursements. Try again."
              : "There are currently no disbursements to display."
          }
          pagination={
            !isError && disbursements.length > 0
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
