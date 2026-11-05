"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import type { PaginatedTableColumn } from "@/app/agent/_components/common";
import { formatMoney } from "../_lib/format-fx";
import { downloadCsv } from "../_lib/export-csv";
import { formatDateTime, formatPlainNumber } from "../_lib/format-fx";
import type { InventoryTabValue, InventoryTransaction } from "../_lib/types";
import {
  DateTimeCell,
  InventorySection,
  RowArrowButton,
  SignedAmount,
  SummaryTile,
  SummaryTiles,
} from "./shared";

interface Props {
  rows: InventoryTransaction[];
  stats: { totalFxPurchased: number; totalFxSold: number; transactionsThisPeriod: number };
  currency: string;
  onNavigateTab: (tab: InventoryTabValue) => void;
}

const text = "text-sm leading-5 text-body-text-300";

export function TransactionsTab({ rows, stats, currency, onNavigateTab }: Readonly<Props>) {
  const router = useRouter();

  const open = (row: InventoryTransaction) => {
    if (row.id.startsWith("LDG")) onNavigateTab("cash-lodgement");
    else router.push(`/agent/transactions/detail/${row.id}`);
  };

  const columns = useMemo<PaginatedTableColumn<InventoryTransaction>[]>(
    () => [
      { key: "id", label: "Transaction ID", render: (r) => <span className={`${text} font-medium`}>{r.id}</span> },
      { key: "customerName", label: "Customer Name", render: (r) => <span className={text}>{r.customerName}</span> },
      { key: "transactionType", label: "Transaction type", render: (r) => <span className={text}>{r.transactionType}</span> },
      { key: "currencyPair", label: "Currency Pair", render: (r) => <span className={text}>{r.currencyPair}</span> },
      { key: "fxAmount", label: "FX Amount", render: (r) => <SignedAmount value={r.fxAmount} currency={r.currency} /> },
      { key: "rate", label: "Rate (NGN)", render: (r) => <span className={text}>{formatPlainNumber(r.rate)}</span> },
      { key: "ngnAmount", label: "NGN Amount", render: (r) => <span className={text}>{formatMoney(r.ngnAmount, "NGN")}</span> },
      { key: "date", label: "Transaction Date", render: (r) => <DateTimeCell iso={r.date} /> },
      {
        key: "action",
        label: "",
        headerClassName: "w-12",
        className: "w-12",
        render: (r) => (
          <RowArrowButton
            label="View transaction"
            onClick={(e) => {
              e.stopPropagation();
              open(r);
            }}
          />
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const handleExport = () =>
    downloadCsv(
      "fx-inventory-transactions",
      ["Transaction ID", "Customer", "Type", "Pair", "FX Amount", "Rate (NGN)", "NGN Amount", "Date"],
      rows.map((r) => [r.id, r.customerName, r.transactionType, r.currencyPair, r.fxAmount, r.rate, r.ngnAmount, formatDateTime(r.date)]),
    );

  return (
    <div className="space-y-4">
      <SummaryTiles>
        <SummaryTile label="Total FX Purchased" value={formatMoney(stats.totalFxPurchased, currency)} />
        <SummaryTile label="Total FX Sold" value={formatMoney(stats.totalFxSold, currency)} />
        <SummaryTile label="Transactions this period" value={stats.transactionsThisPeriod} />
      </SummaryTiles>
      <InventorySection
        title="Inventory Transactions"
        subtitle="Every purchase, sale and transfer affecting FX inventory"
        onExport={handleExport}
        data={rows}
        columns={columns}
        keyExtractor={(r, i) => `${r.id}-${i}`}
        onRowClick={open}
      />
    </div>
  );
}
