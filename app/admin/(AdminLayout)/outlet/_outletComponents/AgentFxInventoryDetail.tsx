"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Button, Group, Select, Text, TextInput } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { ChevronDown, Clock, Coins, ListFilter, Plus, Scale, Search, Upload } from "lucide-react";
import CurrencySelector from "@/app/admin/_components/CurrencySelector";
import { CustomButton } from "@/app/admin/_components/CustomButton";
import { DetailItem } from "@/app/admin/_components/DetailItem";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import RowActionIcon from "@/app/admin/_components/RowActionIcon";
import StatCard from "@/app/admin/_components/StatCard";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { CURRENCIES } from "@/app/admin/_lib/constants";
import { getCurrencyFlagUrl } from "@/app/admin/_lib/currency";
import {
  AGENT_FX_DISBURSEMENTS,
  AGENT_FX_LODGMENTS,
  AGENT_FX_TRANSACTIONS,
  INVENTORY_POSITION_ROWS,
  INVENTORY_POSITION_TOTAL,
  type AgentFxDisbursementRow,
  type AgentFxInventoryDetail as AgentFxDetail,
  type AgentFxLodgmentRow,
  type AgentFxTransactionRow,
  type AmountCell,
  type InventoryPositionRow,
} from "../_data/agentFxInventoryMock";

const PAGE_SIZE = 6;
const RECONCILED_COLOR = "#027A48";
const VARIANCE_COLOR = "#B54708";
const CONFIRMED_COLOR = "#027A48";
const FLAGGED_COLOR = "#B42318";

type CurrencyCode = (typeof CURRENCIES)[number]["code"];
type DetailTab = "overview" | "inventory-position" | "transactions" | "disbursement" | "lodgment";

const POSITION_HEADERS = [
  { label: "Currency", key: "currency" },
  { label: "Opening Balance", key: "opening" },
  { label: "Disbursed from Admin", key: "disbursed" },
  { label: "Purchased from Customers", key: "purchased" },
  { label: "Sold to Customers", key: "sold" },
  { label: "Lodged to HQ", key: "lodged" },
  { label: "Closing Balance", key: "closing" },
  { label: "Physical Count", key: "physical" },
  { label: "Variance", key: "variance" },
  { label: "Status", key: "status" },
];

const TRANSACTION_HEADERS = [
  { label: "Transaction ID", key: "id" },
  { label: "Action Date", key: "date" },
  { label: "Type", key: "type" },
  { label: "Transaction Value", key: "value" },
  { label: "Action Effect", key: "effect" },
  { label: "Action", key: "action" },
];

const DISBURSEMENT_HEADERS = [
  { label: "Reference", key: "reference" },
  { label: "Currency", key: "currency" },
  { label: "Amount Disbursed", key: "amount" },
  { label: "Date Disbursed", key: "date" },
  { label: "Workflow Stage", key: "stage" },
  { label: "Status", key: "status" },
  { label: "Action", key: "action" },
];

const LODGMENT_HEADERS = [
  { label: "Reference", key: "reference" },
  { label: "Currency", key: "currency" },
  { label: "Amount Lodged", key: "amount" },
  { label: "Updated Amount", key: "updated" },
  { label: "Timestamp", key: "timestamp" },
  { label: "Status", key: "status" },
  { label: "Action", key: "action" },
];

type PositionViewRow =
  | { kind: "currency"; row: InventoryPositionRow }
  | { kind: "total" };

function escapeCsv(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

function downloadCsv(filename: string, headers: string[], rows: string[][]) {
  const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\n");
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

function AmountText({ value, strong = false }: { value: AmountCell; strong?: boolean }) {
  return (
    <Text
      size="sm"
      fw={strong || value.tone === "negative" ? 600 : 400}
      c={value.tone === "negative" ? "red.6" : value.tone === "muted" ? "dimmed" : undefined}
    >
      {value.text}
    </Text>
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

function TypeCell({ type }: { type: string }) {
  const [first, ...rest] = type.split(" ");
  return (
    <div>
      <Text size="sm">{first}</Text>
      {rest.length > 0 ? <Text size="sm">{rest.join(" ")}</Text> : null}
    </div>
  );
}

function CurrencyLabel({ code, label }: { code?: string; label: string }) {
  const flag = code ? getCurrencyFlagUrl(code) : null;
  return (
    <div className="flex items-center gap-2">
      {flag ? (
        <span className="relative h-4 w-6 overflow-hidden rounded-sm">
          <Image src={flag} alt="" width={24} height={16} className="h-4 w-6 object-cover" />
        </span>
      ) : null}
      <Text size="sm" fw={500}>
        {label}
      </Text>
    </div>
  );
}

function PeriodControls() {
  const [currency, setCurrency] = useState<CurrencyCode>("USD");

  return (
    <Group gap="sm">
      <CurrencySelector mode="secondary" value={currency} onChange={setCurrency} />
      <Button variant="default" radius="xl" rightSection={<ChevronDown size={14} />}>
        Date: Today
      </Button>
    </Group>
  );
}

function InventoryOverview() {
  return (
    <section className="rounded-xl bg-white p-5">
      <Group justify="space-between" align="center" wrap="wrap" mb="md">
        <h2 className="text-base font-semibold">Inventory Overview</h2>
        <PeriodControls />
      </Group>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Available FX Inventory"
          value="$20,000"
          icon={<Coins className="h-5 w-5 text-primary-400" />}
          iconBg="bg-primary-00"
        />
        <StatCard
          title="NGN Cash Available"
          value="₦5,135,000"
          icon={<Coins className="h-5 w-5 text-primary-300" />}
          iconBg="bg-primary-00"
        />
        <StatCard
          title="Pending Settlements"
          value="3 Transactions"
          icon={<Clock className="h-5 w-5 text-yellow-600" />}
          iconBg="bg-yellow-100"
        />
        <StatCard
          title="Cash Lodgement"
          value="₦5,135,000"
          icon={<Scale className="h-5 w-5 text-blue-600" />}
          iconBg="bg-blue-100"
        />
      </div>
    </section>
  );
}

function TransactionOverview() {
  return (
    <section className="rounded-xl bg-white p-5">
      <Group justify="space-between" align="center" wrap="wrap" mb="md">
        <h2 className="text-base font-semibold">Transaction Overview</h2>
        <PeriodControls />
      </Group>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Total FX Purchased"
          value="$18,650"
          icon={<Coins className="h-5 w-5 text-primary-400" />}
          iconBg="bg-primary-00"
        />
        <StatCard
          title="Total FX Sold"
          value="$41,200"
          icon={<Coins className="h-5 w-5 text-primary-300" />}
          iconBg="bg-primary-00"
        />
        <StatCard
          title="Total Transactions"
          value="178"
          icon={<Coins className="h-5 w-5 text-primary-400" />}
          iconBg="bg-primary-00"
        />
      </div>
    </section>
  );
}

function FilterSelect({
  value,
  data,
  onChange,
}: {
  value: string | null;
  data: string[];
  onChange: (value: string | null) => void;
}) {
  return (
    <Select
      value={value}
      onChange={onChange}
      data={data}
      placeholder="Filter By"
      clearable
      radius="xl"
      w={140}
      rightSection={<ListFilter size={16} />}
    />
  );
}

function ExportButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="outline"
      color="#E36C2F"
      radius="xl"
      rightSection={<Upload size={16} />}
      onClick={onClick}
    >
      Export
    </Button>
  );
}

function paginate<T>(rows: T[], page: number) {
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  return {
    totalPages,
    currentPage,
    rows: rows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
  };
}

function OverviewPanel({ detail }: { detail: AgentFxDetail }) {
  return (
    <section className="rounded-xl bg-white p-6">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-xl font-semibold text-gray-900">{detail.agentName}</h2>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <Text size="sm" c="dimmed">
          Date Created: {detail.dateCreated} | {detail.timeCreated}
        </Text>
        <StatusBadge status={detail.status} />
      </div>
      <div className="my-5 border-t border-gray-100" />
      <p className="mb-4 text-sm font-semibold text-primary-400">Agent Details</p>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <DetailItem label="Agent ID" value={detail.agentId} />
        <DetailItem label="Email Address" value={detail.email} />
        <DetailItem label="Phone Number" value={detail.phone} />
        <DetailItem label="Branch" value={detail.branch} />
      </div>
    </section>
  );
}

function InventoryPositionPanel() {
  const [filter, setFilter] = useState<string | null>(null);

  const currencyRows = useMemo(
    () => INVENTORY_POSITION_ROWS.filter((row) => !filter || row.status === filter),
    [filter]
  );

  const tableRows: PositionViewRow[] = [
    ...currencyRows.map((row) => ({ kind: "currency" as const, row })),
    { kind: "total" as const },
  ];

  const renderRow = (item: PositionViewRow) => {
    if (item.kind === "total") {
      const total = INVENTORY_POSITION_TOTAL;
      return [
        <CurrencyLabel key="currency" code="NGN" label={total.label} />,
        <AmountText key="opening" value={total.openingBalance} strong />,
        <AmountText key="disbursed" value={total.disbursedFromAdmin} strong />,
        <AmountText key="purchased" value={total.purchasedFromCustomers} strong />,
        <AmountText key="sold" value={total.soldToCustomers} strong />,
        <AmountText key="lodged" value={total.lodgedToHq} strong />,
        <AmountText key="closing" value={total.closingBalance} strong />,
        <AmountText key="physical" value={total.physicalCount} strong />,
        <AmountText key="variance" value={total.variance} strong />,
        <Text key="status" size="sm" fw={600} c={FLAGGED_COLOR}>
          {total.flaggedLabel}
        </Text>,
      ];
    }

    const row = item.row;
    return [
      <CurrencyLabel key="currency" code={row.currency} label={row.currency} />,
      <AmountText key="opening" value={row.openingBalance} />,
      <AmountText key="disbursed" value={row.disbursedFromAdmin} />,
      <AmountText key="purchased" value={row.purchasedFromCustomers} />,
      <AmountText key="sold" value={row.soldToCustomers} />,
      <AmountText key="lodged" value={row.lodgedToHq} />,
      <AmountText key="closing" value={row.closingBalance} />,
      <AmountText key="physical" value={row.physicalCount} />,
      <AmountText key="variance" value={row.variance} />,
      <StatusBadge
        key="status"
        status={row.status}
        color={row.status === "Reconciled" ? RECONCILED_COLOR : VARIANCE_COLOR}
      />,
    ];
  };

  const handleExport = () => {
    const dateStamp = new Date().toISOString().slice(0, 10);
    const total = INVENTORY_POSITION_TOTAL;
    downloadCsv(
      `agent-fx-inventory-position-${dateStamp}.csv`,
      POSITION_HEADERS.map((header) => header.label),
      [
        ...currencyRows.map((row) => [
          row.currency,
          row.openingBalance.text,
          row.disbursedFromAdmin.text,
          row.purchasedFromCustomers.text,
          row.soldToCustomers.text,
          row.lodgedToHq.text,
          row.closingBalance.text,
          row.physicalCount.text,
          row.variance.text,
          row.status,
        ]),
        [
          total.label,
          total.openingBalance.text,
          total.disbursedFromAdmin.text,
          total.purchasedFromCustomers.text,
          total.soldToCustomers.text,
          total.lodgedToHq.text,
          total.closingBalance.text,
          total.physicalCount.text,
          total.variance.text,
          total.flaggedLabel,
        ],
      ]
    );
  };

  return (
    <div className="space-y-4">
      <InventoryOverview />
      <section className="rounded-lg bg-white p-5">
        <Group justify="space-between" align="flex-start" wrap="wrap" mb="md">
          <div>
            <h2 className="text-base font-semibold">FX Inventory Position</h2>
            <Text size="xs" c="dimmed">
              Today&apos;s opening-to-closing movement per currency
            </Text>
          </div>
          <Group>
            <FilterSelect
              value={filter}
              data={["Reconciled", "Variance"]}
              onChange={setFilter}
            />
            <ExportButton onClick={handleExport} />
          </Group>
        </Group>
        <DynamicTableSection
          headers={POSITION_HEADERS}
          data={tableRows}
          renderItems={renderRow}
        />
      </section>
    </div>
  );
}

function TransactionsPanel() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string | null>(null);
  const [debouncedSearch] = useDebouncedValue(search, 350);

  const filtered = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    return AGENT_FX_TRANSACTIONS.filter((row) => {
      const matchesQuery =
        !query ||
        row.transactionId.toLowerCase().includes(query) ||
        row.type.toLowerCase().includes(query);
      const matchesFilter = !filter || row.effect === filter;
      return matchesQuery && matchesFilter;
    });
  }, [debouncedSearch, filter]);

  const pageResult = paginate(filtered, page);

  const renderRow = (item: AgentFxTransactionRow) => [
    <Text key="id" size="sm" fw={500}>
      {item.transactionId}
    </Text>,
    <TimestampCell key="date" date={item.date} time={item.time} />,
    <TypeCell key="type" type={item.type} />,
    <Text key="value" size="sm">
      {item.value}
    </Text>,
    <StatusBadge key="effect" status={item.effect} />,
    <RowActionIcon key="action" onClick={() => undefined} />,
  ];

  const handleExport = () => {
    const dateStamp = new Date().toISOString().slice(0, 10);
    downloadCsv(
      `agent-fx-transactions-${dateStamp}.csv`,
      ["Transaction ID", "Date", "Time", "Type", "Transaction Value", "Action Effect"],
      filtered.map((row) => [
        row.transactionId,
        row.date,
        row.time,
        row.type,
        row.value,
        row.effect,
      ])
    );
  };

  return (
    <div className="space-y-4">
      <TransactionOverview />
      <section className="rounded-lg bg-white p-5">
        <Group justify="space-between" wrap="wrap" mb="md">
          <div className="flex items-center gap-4">
            <h2 className="text-base font-semibold">All Transactions</h2>
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
            <FilterSelect
              value={filter}
              data={["Posted", "Pending", "Rejected"]}
              onChange={(value) => {
                setFilter(value);
                setPage(1);
              }}
            />
            <ExportButton onClick={handleExport} />
          </Group>
        </Group>
        <DynamicTableSection
          headers={TRANSACTION_HEADERS}
          data={pageResult.rows}
          renderItems={renderRow}
          emptyTitle="No Transactions Found"
          emptyMessage="There are currently no transactions to display."
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

function DisbursementPanel() {
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
      <InventoryOverview />
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

function LodgmentPanel() {
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

export default function AgentFxInventoryDetail({
  detail,
  tab,
}: {
  detail: AgentFxDetail;
  tab: DetailTab;
}) {
  if (tab === "inventory-position") return <InventoryPositionPanel />;
  if (tab === "transactions") return <TransactionsPanel />;
  if (tab === "disbursement") return <DisbursementPanel />;
  if (tab === "lodgment") return <LodgmentPanel />;
  return <OverviewPanel detail={detail} />;
}
