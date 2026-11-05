"use client";

import { useMemo } from "react";
import { TriangleAlert } from "lucide-react";
import type { PaginatedTableColumn } from "@/app/agent/_components/common";
import { downloadCsv } from "../_lib/export-csv";
import { formatAccounting } from "../_lib/format-fx";
import type { InventoryPositionRow, InventoryPositionTotals } from "../_lib/types";
import { CurrencyCell, InventorySection } from "./shared";

type PositionTableRow =
  | (InventoryPositionRow & { isTotal?: false })
  | (InventoryPositionTotals & { isTotal: true });

const num = (v: number | null | undefined, currency: string, bold = false) => (
  <span className={`text-sm ${bold ? "font-semibold" : "font-normal"} text-body-text-300`}>
    {formatAccounting(v, currency)}
  </span>
);

const negative = (v: number | null | undefined, currency: string) => (
  <span className={`text-sm ${v != null && v < 0 ? "text-red-600" : "text-body-text-300"}`}>
    {formatAccounting(v, currency)}
  </span>
);

interface Props {
  rows: InventoryPositionRow[];
  totals: InventoryPositionTotals;
  pendingLodgements: number;
}

export function InventoryPositionTab({ rows, totals, pendingLodgements }: Readonly<Props>) {
  const data = useMemo<PositionTableRow[]>(() => [...rows, { ...totals, isTotal: true }], [rows, totals]);

  const columns = useMemo<PaginatedTableColumn<PositionTableRow>[]>(
    () => [
      {
        key: "currency",
        label: "Currency",
        render: (r) =>
          r.isTotal ? (
            <span className="text-sm font-semibold text-body-text-300">Total({r.currency})</span>
          ) : (
            <CurrencyCell code={r.currency} />
          ),
      },
      { key: "openingBalance", label: "Opening Balance", render: (r) => num(r.openingBalance, r.currency, r.isTotal) },
      { key: "receivedFromAdmin", label: "Received from Admin", render: (r) => num(r.receivedFromAdmin, r.currency, r.isTotal) },
      { key: "purchasedFromCustomers", label: "Purchased from Customers", render: (r) => num(r.purchasedFromCustomers, r.currency, r.isTotal) },
      { key: "soldToCustomers", label: "Sold to Customers", render: (r) => negative(r.soldToCustomers, r.currency) },
      { key: "lodgedToHq", label: "Lodged to HQ", render: (r) => negative(r.lodgedToHq, r.currency) },
      { key: "adjustments", label: "Adjustments", render: (r) => num(r.adjustments, r.currency, r.isTotal) },
      { key: "closingBalance", label: "Closing Balance", render: (r) => num(r.closingBalance, r.currency, r.isTotal) },
      { key: "physicalCount", label: "Physical Count", render: (r) => num(r.physicalCount, r.currency, r.isTotal) },
      { key: "variance", label: "Variance", render: (r) => negative(r.variance, r.currency) },
      ],
    [],
  );

  const handleExport = () =>
    downloadCsv(
      "fx-inventory-position",
      ["Currency", "Opening", "Received from Admin", "Purchased", "Sold", "Lodged to HQ", "Adjustments", "Closing", "Physical Count", "Variance"],
      rows.map((r) => [r.currency, r.openingBalance, r.receivedFromAdmin, r.purchasedFromCustomers, r.soldToCustomers, r.lodgedToHq, r.adjustments, r.closingBalance, r.physicalCount, r.variance]),
    );

  return (
    <div className="space-y-4">
      {pendingLodgements > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4">
          <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-400 text-white">
            <TriangleAlert className="size-3.5" />
          </span>
          <div>
            <p className="text-base font-semibold text-body-text-400">
              {pendingLodgements} cash {pendingLodgements === 1 ? "lodgment" : "lodgments"} awaiting HQ verification
            </p>
            <p className="text-xs text-body-text-100">
              Cash you lodge to HQ stays in your available inventory until HQ confirms receipt — it moves to
              “Confirmed” once verified, or “Variance Recorded” if the counted amount differs.
            </p>
          </div>
        </div>
      )}
      <InventorySection
        title="FX Inventory Position"
        subtitle="Today’s opening-to-closing movement per currency"
        onExport={handleExport}
        data={data}
        columns={columns}
        keyExtractor={(r) => (r.isTotal ? "total" : r.currency)}
      />
    </div>
  );
}
