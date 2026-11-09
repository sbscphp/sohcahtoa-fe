"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Group, Select, Tabs, Text, TextInput } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { ListFilter, Plus, Search, Upload } from "lucide-react";
import AdminTabButton from "@/app/admin/_components/AdminTabButton";
import { CustomButton } from "@/app/admin/_components/CustomButton";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import RowActionIcon from "@/app/admin/_components/RowActionIcon";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { adminRoutes } from "@/lib/adminRoutes";
import type {
  FxInventoryDisbursementStatus,
  FxInventoryLodgmentStatus,
} from "@/app/admin/_services/admin-api";
import {
  FX_INVENTORY_DISBURSEMENT_PAGE_SIZE,
  FX_INVENTORY_DISBURSEMENT_STATUS_OPTIONS,
  useFxInventoryDisbursements,
  type FxInventoryDisbursementRow,
} from "../hooks/useFxInventoryDisbursements";
import {
  FX_INVENTORY_LODGMENT_PAGE_SIZE,
  FX_INVENTORY_LODGMENT_STATUS_OPTIONS,
  useFxInventoryLodgments,
  type FxInventoryLodgmentRow,
} from "../hooks/useFxInventoryLodgments";

const CONFIRMED_STATUS_COLOR = "#027A48";

type HistoryTab = "disbursement" | "lodgments";

const DISBURSEMENT_HEADERS = [
  { label: "Agent", key: "agent" },
  { label: "Amount Disbursed", key: "amount" },
  { label: "Timestamp", key: "timestamp" },
  { label: "Workflow Stage", key: "workflowStage" },
  { label: "Status", key: "status" },
  { label: "Action", key: "action" },
];

const LODGMENT_HEADERS = [
  { label: "Agent", key: "agent" },
  { label: "Amount Lodged", key: "amountLodged" },
  { label: "Updated Amount", key: "updatedAmount" },
  { label: "Timestamp", key: "timestamp" },
  { label: "Status", key: "status" },
  { label: "Action", key: "action" },
];

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

function AgentCell({ name, agentId }: { name: string; agentId: string }) {
  return (
    <div>
      <Text size="sm" fw={500}>
        {name}
      </Text>
      <Text size="xs" c="dimmed">
        ID:{agentId}
      </Text>
    </div>
  );
}

function TimestampCell({ date, time }: { date: string; time: string }) {
  return (
    <div>
      <Text size="sm">{date}</Text>
      <Text size="xs" c="dimmed">
        {time}
      </Text>
    </div>
  );
}

export default function FxInventoryHistory() {
  const router = useRouter();
  const [historyTab, setHistoryTab] = useState<HistoryTab>("disbursement");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [debouncedSearch] = useDebouncedValue(search, 350);

  const statusOptions =
    historyTab === "disbursement"
      ? FX_INVENTORY_DISBURSEMENT_STATUS_OPTIONS
      : FX_INVENTORY_LODGMENT_STATUS_OPTIONS;

  const searchQuery = debouncedSearch.trim() || undefined;

  const disbursementStatus =
    historyTab === "disbursement" && statusFilter !== "All"
      ? (statusFilter as FxInventoryDisbursementStatus)
      : undefined;

  const {
    disbursements,
    isLoading: disbursementsLoading,
    isFetching: disbursementsFetching,
    isError: disbursementsError,
    totalPages: disbursementTotalPages,
  } = useFxInventoryDisbursements(
    {
      page,
      limit: FX_INVENTORY_DISBURSEMENT_PAGE_SIZE,
      search: searchQuery,
      status: disbursementStatus,
    },
    historyTab === "disbursement"
  );

  const lodgmentStatus =
    historyTab === "lodgments" && statusFilter !== "All"
      ? (statusFilter as FxInventoryLodgmentStatus)
      : undefined;

  const {
    lodgments,
    isLoading: lodgmentsLoading,
    isFetching: lodgmentsFetching,
    isError: lodgmentsError,
    totalPages: lodgmentTotalPages,
  } = useFxInventoryLodgments(
    {
      page,
      limit: FX_INVENTORY_LODGMENT_PAGE_SIZE,
      search: searchQuery,
      status: lodgmentStatus,
    },
    historyTab === "lodgments"
  );

  const disbursementPageCount = Math.max(disbursementTotalPages, 1);
  const lodgmentPageCount = Math.max(lodgmentTotalPages, 1);

  const renderDisbursementRow = (item: FxInventoryDisbursementRow) => [
    <AgentCell key="agent" name={item.agentName} agentId={item.agentId} />,
    <Text key="amount" size="sm" fw={500}>
      {item.amount}
    </Text>,
    <TimestampCell key="timestamp" date={item.date} time={item.time} />,
    <Text key="workflowStage" size="sm">
      {item.workflowStage}
    </Text>,
    <StatusBadge key="status" status={item.status} />,
    <RowActionIcon
      key="action"
      onClick={() => router.push(adminRoutes.adminSettlementDisbursementDetails(item.id))}
    />,
  ];

  const renderLodgmentRow = (item: FxInventoryLodgmentRow) => [
    <AgentCell key="agent" name={item.agentName} agentId={item.agentId} />,
    <Text key="amountLodged" size="sm" fw={500}>
      {item.amountLodged}
    </Text>,
    <Text key="updatedAmount" size="sm" fw={500}>
      {item.updatedAmount ?? "-"}
    </Text>,
    <TimestampCell key="timestamp" date={item.date} time={item.time} />,
    <StatusBadge
      key="status"
      status={item.status}
      color={item.status === "Confirmed" ? CONFIRMED_STATUS_COLOR : undefined}
    />,
    <RowActionIcon
      key="action"
      onClick={() => router.push(adminRoutes.adminSettlementLodgmentDetails(item.id))}
    />,
  ];

  const handleExport = () => {
    const dateStamp = new Date().toISOString().slice(0, 10);

    if (historyTab === "disbursement") {
      downloadCsv(
        `fx-inventory-disbursements-${dateStamp}.csv`,
        [
          "Agent",
          "Agent ID",
          "Amount Disbursed",
          "Date",
          "Time",
          "Workflow Stage",
          "Status",
        ],
        disbursements.map((row) => [
          row.agentName,
          row.agentId,
          row.amount,
          row.date,
          row.time,
          row.workflowStage,
          row.status,
        ])
      );
      return;
    }

    downloadCsv(
      `fx-inventory-lodgments-${dateStamp}.csv`,
      [
        "Agent",
        "Agent ID",
        "Amount Lodged",
        "Updated Amount",
        "Date",
        "Time",
        "Status",
      ],
      lodgments.map((row) => [
        row.agentName,
        row.agentId,
        row.amountLodged,
        row.updatedAmount ?? "-",
        row.date,
        row.time,
        row.status,
      ])
    );
  };

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <Group justify="space-between" mb="md" wrap="wrap">
        <div className="flex flex-wrap items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900">FX Inventory History</h2>
          <TextInput
            placeholder="Enter keyword"
            leftSection={<Search size={16} className="text-primary-400" />}
            value={search}
            onChange={(event) => {
              setSearch(event.currentTarget.value);
              setPage(1);
            }}
            w={320}
            radius="xl"
            aria-label="Search FX inventory"
          />
        </div>

        <Group gap="sm" wrap="wrap">
          <Select
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value ?? "All");
              setPage(1);
            }}
            data={statusOptions}
            radius="xl"
            w={150}
            rightSection={<ListFilter size={16} />}
            aria-label="Filter by status"
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

          <CustomButton
            buttonType="primary"
            rightSection={<Plus size={16} />}
            onClick={() => router.push(adminRoutes.adminSettlementDisburseCash())}
          >
            Disburse Cash
          </CustomButton>
        </Group>
      </Group>

      <Tabs
        className="mt-4!"
        color="orange"
        value={historyTab}
        onChange={(value) => {
          setHistoryTab((value as HistoryTab) ?? "disbursement");
          setStatusFilter("All");
          setPage(1);
        }}
      >
        <Tabs.List className="mb-4 border-0! before:content-none!">
          <AdminTabButton value="disbursement">Disbursement</AdminTabButton>
          <AdminTabButton value="lodgments">Lodgments</AdminTabButton>
        </Tabs.List>

        <Tabs.Panel value={historyTab}>
          {historyTab === "disbursement" ? (
            <DynamicTableSection
              headers={DISBURSEMENT_HEADERS}
              data={disbursementsError ? [] : disbursements}
              loading={disbursementsLoading || disbursementsFetching}
              renderItems={renderDisbursementRow}
              emptyTitle={
                disbursementsError ? "Could not load disbursements" : "No disbursements found"
              }
              emptyMessage={
                disbursementsError
                  ? "Something went wrong while loading disbursements. Try again."
                  : "No disbursements match your search or filter."
              }
              pagination={
                !disbursementsError && disbursements.length > 0
                  ? {
                      page,
                      totalPages: disbursementPageCount,
                      onNext: () =>
                        setPage((current) => Math.min(current + 1, disbursementPageCount)),
                      onPrevious: () => setPage((current) => Math.max(current - 1, 1)),
                      onPageChange: setPage,
                    }
                  : undefined
              }
            />
          ) : (
            <DynamicTableSection
              headers={LODGMENT_HEADERS}
              data={lodgmentsError ? [] : lodgments}
              loading={lodgmentsLoading || lodgmentsFetching}
              renderItems={renderLodgmentRow}
              emptyTitle={lodgmentsError ? "Could not load lodgments" : "No lodgments found"}
              emptyMessage={
                lodgmentsError
                  ? "Something went wrong while loading lodgments. Try again."
                  : "No lodgments match your search or filter."
              }
              pagination={
                !lodgmentsError && lodgments.length > 0
                  ? {
                      page,
                      totalPages: lodgmentPageCount,
                      onNext: () =>
                        setPage((current) => Math.min(current + 1, lodgmentPageCount)),
                      onPrevious: () => setPage((current) => Math.max(current - 1, 1)),
                      onPageChange: setPage,
                    }
                  : undefined
              }
            />
          )}
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}
