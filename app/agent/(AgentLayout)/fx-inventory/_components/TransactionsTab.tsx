"use client";

import { useMemo, useState } from "react";
import { Select } from "@mantine/core";
import type { PaginatedTableColumn } from "@/app/agent/_components/common";
import { downloadCsv } from "../_lib/export-csv";
import { formatDateTime, formatMoney, formatPlainNumber } from "../_lib/format-fx";
import type { InventoryTransaction, TransactionSettlementStatus } from "../_lib/types";
import { DateTimeCell, InventorySection, SignedAmount, StatusPill, SummaryTile, SummaryTiles } from "./shared";

const TONE: Record<TransactionSettlementStatus, "success" | "warning" | "danger"> = {
  Pending: "warning",
  Overdue: "danger",
  Settled: "success",
  Rejected: "danger",
};

const STATUS_OPTIONS = ["All Statuses", "Pending", "Overdue", "Settled", "Rejected"];

const text = "text-sm leading-5 text-body-text-300";

interface Props {
  rows: InventoryTransaction[];
  stats: { totalFxPurchased: number; totalFxSold: number; transactionsThisPeriod: number };
  currency: string;
  isLoading: boolean;
}

export function TransactionsTab({ rows, stats, currency, isLoading }: Readonly<Props>) {
  const [status, setStatus] = useState("All Statuses");

  const filtered = useMemo(
    () => (status === "All Statuses" ? rows : rows.filter((r) => r.status === status)),
    [rows, status],
  );

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

  const handleExport = () =>
    downloadCsv(
      "fx-inventory-transactions",
      ["Transaction ID", "Customer", "Type", "Pair", "FX Amount", "Rate (NGN)", "NGN Amount", "Status", "Date"],
      filtered.map((r) => [r.id, r.customerName, r.transactionType, r.currencyPair, r.fxAmount, r.rate, r.ngnAmount, r.status, formatDateTime(r.date)]),
    );

  return (
    <div className="space-y-4">
      <SummaryTiles>
        <SummaryTile label="Total FX Purchased" value={formatMoney(stats.totalFxPurchased, currency)} />
        <SummaryTile label="Total FX Sold" value={formatMoney(stats.totalFxSold, currency)} />
        <SummaryTile label="Transactions" value={stats.transactionsThisPeriod} />
      </SummaryTiles>
      <InventorySection
        title="Transactions"
        subtitle="Every purchase, sale and transfer affecting FX inventory"
        toolbar={
          <Select
            size="sm"
            w={150}
            radius="xl"
            data={STATUS_OPTIONS}
            value={status}
            onChange={(v) => v && setStatus(v)}
            allowDeselect={false}
            aria-label="Filter by status"
          />
        }
        onExport={handleExport}
        isLoading={isLoading}
        data={filtered}
        columns={columns}
        keyExtractor={(r) => r.key}
      />
    </div>
  );
}
