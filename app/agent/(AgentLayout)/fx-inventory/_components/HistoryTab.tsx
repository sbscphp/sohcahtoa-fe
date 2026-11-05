"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import type { PaginatedTableColumn } from "@/app/agent/_components/common";
import { formatMoney } from "../_lib/format-fx";
import { downloadCsv } from "../_lib/export-csv";
import { formatDateTime } from "../_lib/format-fx";
import type { InventoryHistoryEntry } from "../_lib/types";
import { DateTimeCell, InventorySection, RowArrowButton, SignedAmount } from "./shared";

const text = "text-sm leading-5 text-body-text-300";

export function HistoryTab({ rows }: Readonly<{ rows: InventoryHistoryEntry[] }>) {
  const router = useRouter();

  const columns = useMemo<PaginatedTableColumn<InventoryHistoryEntry>[]>(
    () => [
      { key: "date", label: "Date & Time", render: (r) => <DateTimeCell iso={r.date} /> },
      { key: "transactionId", label: "Transaction ID", render: (r) => <span className={`${text} font-medium`}>{r.transactionId}</span> },
      { key: "currency", label: "Currency", render: (r) => <span className={text}>{r.currency}</span> },
      { key: "amount", label: "Amount", render: (r) => <SignedAmount value={r.amount} currency={r.currency} /> },
      { key: "balanceAfter", label: "Balance After", render: (r) => <span className={text}>{formatMoney(r.balanceAfter, r.currency)}</span> },
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
              router.push(`/agent/transactions/detail/${r.transactionId}`);
            }}
          />
        ),
      },
    ],
    [router],
  );

  const handleExport = () =>
    downloadCsv(
      "fx-inventory-history",
      ["Date & Time", "Transaction ID", "Currency", "Amount", "Balance After"],
      rows.map((r) => [formatDateTime(r.date), r.transactionId, r.currency, r.amount, r.balanceAfter]),
    );

  return (
    <InventorySection
      title="Inventory History Log"
      subtitle="Full audit trail of every event that changed inventory"
      onExport={handleExport}
      data={rows}
      columns={columns}
      keyExtractor={(r) => r.id}
    />
  );
}
