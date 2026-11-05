"use client";

import { useMemo } from "react";
import { Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import type { PaginatedTableColumn } from "@/app/agent/_components/common";
import { formatMoney } from "../_lib/format-fx";
import { downloadCsv } from "../_lib/export-csv";
import { formatDateTime } from "../_lib/format-fx";
import type { PendingSettlement, SettlementStatus } from "../_lib/types";
import { DateTimeCell, InventorySection, SignedAmount, StatusPill, SummaryTile, SummaryTiles } from "./shared";

const TONE: Record<SettlementStatus, "success" | "warning" | "danger"> = {
  Pending: "warning",
  Overdue: "danger",
  Settled: "success",
};

const text = "text-sm leading-5 text-body-text-300";

interface Props {
  rows: PendingSettlement[];
  stats: { pending: number; totalOutstanding: number; overdue: number };
  onMarkSettled: (id: string) => void;
}

export function PendingSettlementsTab({ rows, stats, onMarkSettled }: Readonly<Props>) {
  const columns = useMemo<PaginatedTableColumn<PendingSettlement>[]>(
    () => [
      { key: "id", label: "Transaction ID", render: (r) => <span className={`${text} font-medium`}>{r.id}</span> },
      { key: "customerName", label: "Customer Name", render: (r) => <span className={text}>{r.customerName}</span> },
      { key: "transactionType", label: "Transaction type", render: (r) => <span className={text}>{r.transactionType}</span> },
      { key: "currencyPair", label: "Currency Pair", render: (r) => <span className={text}>{r.currencyPair}</span> },
      { key: "fxAmount", label: "FX Amount", render: (r) => <SignedAmount value={r.fxAmount} currency={r.currency} /> },
      { key: "ngnAmountOwed", label: "(NGN) Amount Owed", render: (r) => <span className={text}>{formatMoney(r.ngnAmountOwed, "NGN")}</span> },
      { key: "date", label: "Transaction Date", render: (r) => <DateTimeCell iso={r.date} /> },
      { key: "status", label: "Status", render: (r) => <StatusPill label={r.status} tone={TONE[r.status]} /> },
      {
        key: "action",
        label: "",
        render: (r) => {
          const settled = r.status === "Settled";
          return (
            <Button
              size="xs"
              radius="md"
              disabled={settled}
              onClick={(e) => {
                e.stopPropagation();
                onMarkSettled(r.id);
                notifications.show({
                  title: "Marked as settled",
                  message: `${r.id} has been marked as settled.`,
                  color: "green",
                });
              }}
              className={settled ? "bg-[#8F8B8B]! text-white!" : "bg-[#1F1E1E]! text-white! hover:bg-black!"}
            >
              Mark as settled
            </Button>
          );
        },
      },
    ],
    [onMarkSettled],
  );

  const handleExport = () =>
    downloadCsv(
      "fx-inventory-pending-settlements",
      ["Transaction ID", "Customer", "Type", "Pair", "FX Amount", "NGN Owed", "Date", "Status"],
      rows.map((r) => [r.id, r.customerName, r.transactionType, r.currencyPair, r.fxAmount, r.ngnAmountOwed, formatDateTime(r.date), r.status]),
    );

  return (
    <div className="space-y-4">
      <SummaryTiles>
        <SummaryTile label="Transactions Pending" value={stats.pending} />
        <SummaryTile label="Total Outstanding" value={formatMoney(stats.totalOutstanding, "NGN")} tone="danger" />
        <SummaryTile label="Overdue (> 24h)" value={stats.overdue} tone="danger" />
      </SummaryTiles>
      <InventorySection
        title="Awaiting Settlement"
        subtitle="Transactions where cash has not yet been received or paid out"
        onExport={handleExport}
        data={rows}
        columns={columns}
        keyExtractor={(r) => r.id}
      />
    </div>
  );
}
