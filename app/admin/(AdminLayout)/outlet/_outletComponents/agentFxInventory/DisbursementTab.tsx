"use client";

import { useMemo, useState } from "react";
import { Group, Text, TextInput } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { Plus, Search } from "lucide-react";
import { CustomButton } from "@/app/admin/_components/CustomButton";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import RowActionIcon from "@/app/admin/_components/RowActionIcon";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import {
  AGENT_FX_DISBURSEMENTS,
  type AgentFxDisbursementRow,
} from "../../_data/agentFxInventoryMock";
import {
  CurrencyLabel,
  ExportButton,
  FilterSelect,
  InventoryOverview,
  TimestampCell,
  downloadCsv,
  paginate,
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
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string | null>(null);
  const [debouncedSearch] = useDebouncedValue(search, 350);

  const filtered = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    return AGENT_FX_DISBURSEMENTS.filter((row) => {
      const matchesQuery =
        !query ||
        row.reference.toLowerCase().includes(query) ||
        row.currency.toLowerCase().includes(query);
      const matchesFilter = !filter || row.status === filter;
      return matchesQuery && matchesFilter;
    });
  }, [debouncedSearch, filter]);

  const pageResult = paginate(filtered, page);

  const renderRow = (item: AgentFxDisbursementRow) => [
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
    <RowActionIcon key="action" onClick={() => undefined} />,
  ];

  const handleExport = () => {
    const dateStamp = new Date().toISOString().slice(0, 10);
    downloadCsv(
      `agent-fx-disbursements-${dateStamp}.csv`,
      ["Reference", "Currency", "Amount Disbursed", "Date", "Time", "Workflow Stage", "Status"],
      filtered.map((row) => [
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
            <FilterSelect
              value={filter}
              data={["Pending", "Approved", "Rejected"]}
              onChange={(value) => {
                setFilter(value);
                setPage(1);
              }}
            />
            <ExportButton onClick={handleExport} />
            <CustomButton
              buttonType="primary"
              rightSection={<Plus size={16} />}
              onClick={() => undefined}
            >
              Disburse Cash
            </CustomButton>
          </Group>
        </Group>
        <DynamicTableSection
          headers={DISBURSEMENT_HEADERS}
          data={pageResult.rows}
          renderItems={renderRow}
          emptyTitle="No Disbursements Found"
          emptyMessage="There are currently no disbursements to display."
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
