"use client";

import { useMemo } from "react";
import { TriangleAlert } from "lucide-react";
import type { PaginatedTableColumn } from "@/app/agent/_components/common";
import type { AgentDashboardCashStatsPeriod } from "@/app/_lib/api/types";
import { agentApi } from "@/app/agent/_services/agent-api";
import { useBackendExport, usePositionData } from "../hooks/useFxInventory";
import { formatAccounting } from "../_lib/format-fx";
import type { PositionRow } from "../_lib/types";
import { CurrencyCell, InventorySection, StatusPill } from "./shared";

type PositionTableRow = (PositionRow & { isTotal?: false }) | { isTotal: true; flagged: number };

const money = (v: number | null | undefined, currency: string) => (
  <span className="text-sm text-body-text-300">{formatAccounting(v, currency)}</span>
);

const signed = (v: number | null | undefined, currency: string) => (
  <span className={`text-sm ${v != null && v < 0 ? "text-red-600" : "text-body-text-300"}`}>
    {formatAccounting(v, currency)}
  </span>
);

export function InventoryPositionTab({ period }: Readonly<{ period: AgentDashboardCashStatsPeriod }>) {
  const { rows, pendingLodgements, isLoading, errorMessage } = usePositionData(period);

  const data = useMemo<PositionTableRow[]>(
    () => [...rows, { isTotal: true, flagged: rows.filter((r) => r.status === "Variance").length }],
    [rows],
  );

  const columns = useMemo<PaginatedTableColumn<PositionTableRow>[]>(() => {
    // The total row only carries the flagged count; every other cell is blank.
    const cell =
      (render: (r: PositionRow) => React.ReactNode) =>
      (r: PositionTableRow) =>
        r.isTotal ? null : render(r);
    return [
      {
        key: "currency",
        label: "Currency",
        render: (r) =>
          r.isTotal ? (
            <span className="text-sm font-semibold text-body-text-300">Total</span>
          ) : (
            <CurrencyCell code={r.currency} />
          ),
      },
      { key: "opening", label: "Opening Balance", render: cell((r) => money(r.openingBalance, r.currency)) },
      { key: "admin", label: "Disbursed from Admin", render: cell((r) => money(r.disbursedFromAdmin, r.currency)) },
      { key: "purchased", label: "Purchased from Customers", render: cell((r) => money(r.purchasedFromCustomers, r.currency)) },
      { key: "sold", label: "Sold to Customers", render: cell((r) => signed(r.soldToCustomers, r.currency)) },
      { key: "lodged", label: "Lodged to HQ", render: cell((r) => signed(r.lodgedToHq, r.currency)) },
      { key: "closing", label: "Closing Balance", render: cell((r) => money(r.closingBalance, r.currency)) },
      { key: "physical", label: "Physical Count", render: cell((r) => money(r.physicalCount, r.currency)) },
      { key: "variance", label: "Variance", render: cell((r) => signed(r.variance, r.currency)) },
      {
        key: "status",
        label: "Status",
        render: (r) =>
          r.isTotal ? (
            <span className="text-sm font-medium text-body-text-300">{r.flagged} Flagged</span>
          ) : (
            <StatusPill label={r.status} tone={r.status === "Reconciled" ? "success" : "warning"} />
          ),
      },
    ];
  }, []);

  // Backend export: SUMMARY per currency plus per-transaction DETAIL rows.
  const exporter = useBackendExport(() => agentApi.transactions.fxInventoryExport(), "fx-inventory");

  return (
    <div className="space-y-4">
      {pendingLodgements > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4">
          <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-400 text-white">
            <TriangleAlert className="size-3.5" />
          </span>
          <div>
            <p className="text-base font-semibold text-body-text-400">
              {pendingLodgements} Cash {pendingLodgements === 1 ? "lodgment" : "lodgments"} awaiting HQ verification
            </p>
            <p className="text-xs text-body-text-100">
              Cash you lodge to HQ stays in your available inventory until HQ confirms receipt.
            </p>
          </div>
        </div>
      )}
      <InventorySection
        title="FX Inventory Position"
        subtitle="Opening-to-closing movement per currency for the selected period"
        onExport={exporter.run}
        exporting={exporter.isPending}
        isLoading={isLoading}
        errorMessage={errorMessage}
        data={data}
        columns={columns}
        keyExtractor={(r) => (r.isTotal ? "total" : r.currency)}
      />
    </div>
  );
}
