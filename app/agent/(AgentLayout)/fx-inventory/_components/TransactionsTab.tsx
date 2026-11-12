"use client";

import { useMemo, useState } from "react";
import { Select } from "@mantine/core";
import type { PaginatedTableColumn } from "@/app/agent/_components/common";
import type { AgentDashboardCashStatsPeriod } from "@/app/_lib/api/types";
import { agentApi } from "@/app/agent/_services/agent-api";
import { useBackendExport, useTransactionsData } from "../hooks/useFxInventory";
import { formatMoney, formatPlainNumber } from "../_lib/format-fx";
import type { InventoryTransaction, TransactionSettlementStatus } from "../_lib/types";
import { DateTimeCell, InventorySection, SignedAmount, StatusPill, SummaryTile, SummaryTiles } from "./shared";

const TONE: Record<TransactionSettlementStatus, "success" | "warning" | "danger"> = {
  Pending: "warning",
  Overdue: "danger",
  Settled: "success",
  Rejected: "danger",
};

/** Filter values are the API's own transaction statuses, so filtering happens on the server. */
const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "AWAITING_VERIFICATION", label: "Awaiting verification" },
  { value: "AWAITING_DEPOSIT", label: "Awaiting deposit" },
  { value: "ADMIN_APPROVAL_PENDING", label: "Awaiting approval" },
  { value: "APPROVED", label: "Approved" },
  { value: "COMPLETED", label: "Settled" },
  { value: "REJECTED", label: "Rejected" },
  { value: "CANCELLED", label: "Cancelled" },
];

const text = "text-sm leading-5 text-body-text-300";

interface Props {
  period: AgentDashboardCashStatsPeriod;
  currency: string;
}

export function TransactionsTab({ period, currency }: Readonly<Props>) {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const { rows, totalPages, stats, isLoading, errorMessage } = useTransactionsData(period, currency, status || undefined, page);

  const columns = useMemo<PaginatedTableColumn<InventoryTransaction>[]>(
    () => [
      { key: "id", label: "Transaction ID", render: (r) => <span className={`${text} font-medium`}>{r.id}</span> },
      { key: "customerName", label: "Customer Name", render: (r) => <span className={text}>{r.customerName}</span> },
      { key: "transactionType", label: "Transaction type", render: (r) => <span className={text}>{r.transactionType}</span> },
      { key: "currencyPair", label: "Currency Pair", render: (r) => <span className={text}>{r.currencyPair}</span> },
      {
        key: "fxAmount",
        label: "FX Amount",
        render: (r) =>
          r.fxAmount == null ? <span className={text}>—</span> : <SignedAmount value={r.fxAmount} currency={r.currency} />,
      },
      { key: "rate", label: "Rate (NGN)", render: (r) => <span className={text}>{r.rate == null ? "—" : formatPlainNumber(r.rate)}</span> },
      { key: "ngnAmount", label: "NGN Amount", render: (r) => <span className={text}>{r.ngnAmount == null ? "—" : formatPlainNumber(r.ngnAmount)}</span> },
      { key: "status", label: "Status", render: (r) => <StatusPill label={r.status} tone={TONE[r.status]} /> },
      { key: "date", label: "Transaction Date", render: (r) => <DateTimeCell iso={r.date} /> },
    ],
    [],
  );

  // Backend export: every transaction matching the status filter, not just this page.
  const exporter = useBackendExport(
    () => agentApi.transactions.export(status ? { status } : undefined),
    "fx-inventory-transactions",
  );

  return (
    <div className="space-y-4">
      <SummaryTiles>
        <SummaryTile label="Total FX Purchased" value={formatMoney(stats.totalFxPurchased, currency)} />
        <SummaryTile label="Total FX Sold" value={formatMoney(stats.totalFxSold, currency)} />
        <SummaryTile label="Transactions" value={stats.transactions} />
      </SummaryTiles>
      <InventorySection
        title="Transactions"
        subtitle="Every purchase, sale and transfer affecting FX inventory"
        toolbar={
          <Select
            size="sm"
            w={190}
            radius="xl"
            data={STATUS_OPTIONS}
            value={status}
            onChange={(v) => {
              setStatus(v ?? "");
              setPage(1);
            }}
            allowDeselect={false}
            aria-label="Filter by status"
          />
        }
        onExport={exporter.run}
        exporting={exporter.isPending}
        isLoading={isLoading}
        errorMessage={errorMessage}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        data={rows}
        columns={columns}
        keyExtractor={(r) => r.key}
      />
    </div>
  );
}
