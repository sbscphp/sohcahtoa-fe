"use client";

import { useMemo, useState } from "react";
import { Button, Collapse } from "@mantine/core";
import { ChevronDown, TriangleAlert } from "lucide-react";
import type { PaginatedTableColumn } from "@/app/agent/_components/common";
import { useReceivedData } from "../hooks/useFxInventory";
import { downloadCsv } from "../_lib/export-csv";
import { formatDateTime, formatMoney } from "../_lib/format-fx";
import type { CashDisbursement, DisbursementDisplayStatus } from "../_lib/types";
import { DateTimeCell, InventorySection, StatusPill, SummaryTile, SummaryTiles } from "./shared";

const TONE: Record<DisbursementDisplayStatus, "success" | "warning" | "danger"> = {
  Pending: "warning",
  Confirmed: "success",
  Rejected: "danger",
};

const text = "text-sm leading-5 text-body-text-300";

interface Props {
  onConfirm: (item: CashDisbursement) => void;
  onReject: (item: CashDisbursement) => void;
}

export function InventoryReceivedTab({ onConfirm, onReject }: Readonly<Props>) {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const { rows, awaitingRows: awaiting, stats, totalPages, isLoading, errorMessage } = useReceivedData(page);

  const columns = useMemo<PaginatedTableColumn<CashDisbursement>[]>(
    () => [
      { key: "date", label: "Date", render: (r) => (r.date ? <DateTimeCell iso={r.date} /> : <span className={text}>—</span>) },
      { key: "reference", label: "Reference", render: (r) => <span className={`${text} font-medium`}>{r.reference}</span> },
      { key: "currency", label: "Currency", render: (r) => <span className={text}>{r.currency || "—"}</span> },
      { key: "amount", label: "Amount", render: (r) => <span className={text}>{r.amount == null ? "—" : formatMoney(r.amount, r.currency)}</span> },
      { key: "purpose", label: "Purpose", render: (r) => <span className={text}>{r.purpose}</span> },
      { key: "disbursedBy", label: "Disbursed by", render: (r) => <span className={text}>{r.disbursedBy}</span> },
      { key: "resolved", label: "Resolved", render: (r) => (r.resolvedAt ? <DateTimeCell iso={r.resolvedAt} /> : <span className={text}>—</span>) },
      { key: "status", label: "Status", render: (r) => <StatusPill label={r.status} tone={TONE[r.status]} /> },
    ],
    [],
  );

  const handleExport = () =>
    downloadCsv(
      "fx-inventory-received",
      ["Date", "Reference", "Currency", "Amount", "Purpose", "Disbursed by", "Resolved", "Status"],
      rows.map((r) => [r.date ? formatDateTime(r.date) : "", r.reference, r.currency, r.amount, r.purpose, r.disbursedBy, r.resolvedAt ? formatDateTime(r.resolvedAt) : "", r.status]),
    );

  return (
    <div className="space-y-4">
      <SummaryTiles>
        <SummaryTile label="Awaiting your confirmation" value={stats.awaiting} />
        <SummaryTile label="Confirmed" value={stats.confirmed} />
        <SummaryTile label="Rejected" value={stats.rejected} tone="danger" />
      </SummaryTiles>

      <div className="space-y-3 rounded-2xl border border-gray-100 bg-white p-4">
        <div>
          <h2 className="text-lg font-semibold text-body-heading-300">Awaiting Your Confirmation</h2>
          <p className="text-xs text-body-text-50">
            Cash disbursed to you by Admin — confirm receipt to credit your balance
          </p>
        </div>
        {awaiting.length === 0 ? (
          <p className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-body-text-100">
            Nothing is waiting for your confirmation.
          </p>
        ) : (
          <div className="rounded-xl border border-primary-25 bg-[#FFF6F1]">
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="flex w-full items-start gap-3 p-4 text-left"
              aria-expanded={open}
            >
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-400 text-white">
                <TriangleAlert className="size-3.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-semibold text-body-text-400">
                  You have {awaiting.length} {awaiting.length === 1 ? "Disbursement" : "Disbursements"} awaiting your confirmation
                </span>
                <span className="block text-xs text-body-text-100">
                  Confirm if you received these disbursements, or reject it if you didn’t — your balance only updates once you confirm.
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-1 text-xs text-body-text-200">
                {open ? "Close" : "Open"}
                <ChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
              </span>
            </button>
            <Collapse in={open}>
              <ul className="divide-y divide-primary-25 border-t border-primary-25">
                {awaiting.map((d) => (
                  <li key={d.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-body-text-400">
                        {d.currency} {d.amount == null ? "—" : d.amount.toLocaleString("en-US")} from Admin
                      </p>
                      <p className="text-xs text-body-text-100">
                        {d.purpose} · Disbursed by {d.disbursedBy}
                        {d.date ? ` · ${formatDateTime(d.date)}` : ""} · Ref {d.reference}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-3">
                      <Button variant="outline" radius="xl" onClick={() => onReject(d)} className="border-primary-25! bg-white! text-primary-400!">
                        Reject
                      </Button>
                      <Button radius="xl" onClick={() => onConfirm(d)} className="bg-primary-400! hover:bg-primary-500!">
                        Confirm Receipt
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </Collapse>
          </div>
        )}
      </div>

      <InventorySection
        title="All Disbursements"
        subtitle="Every cash release from HQ to this agent, whatever its status"
        onExport={handleExport}
        isLoading={isLoading}
        errorMessage={errorMessage}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        data={rows}
        columns={columns}
        keyExtractor={(r) => r.id}
        emptyMessage="No disbursements from HQ yet."
      />
    </div>
  );
}
