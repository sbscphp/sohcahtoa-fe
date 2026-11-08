"use client";

import { useMemo, useState } from "react";
import { Button } from "@mantine/core";
import type { PaginatedTableColumn } from "@/app/agent/_components/common";
import { useLodgementData } from "../hooks/useFxInventory";
import { formatAccounting } from "../_lib/format-fx";
import type { CashLodgement, LodgementDisplayStatus } from "../_lib/types";
import { CurrencyCell, DateTimeCell, InventorySection, StatusPill, SummaryTile, SummaryTiles } from "./shared";

const TONE: Record<LodgementDisplayStatus, "success" | "warning" | "danger"> = {
  Confirmed: "success",
  "Pending Verification": "warning",
  Rejected: "danger",
};

const text = "text-sm leading-5 text-body-text-300";

export function CashLodgementTab({ onLodge }: Readonly<{ onLodge: () => void }>) {
  const [page, setPage] = useState(1);
  const { rows, stats, totalPages, isLoading, errorMessage } = useLodgementData(page);

  const columns = useMemo<PaginatedTableColumn<CashLodgement>[]>(
    () => [
      { key: "currency", label: "Currency", render: (r) => <CurrencyCell code={r.currency} /> },
      { key: "declared", label: "Declared Amount", render: (r) => <span className={text}>{formatAccounting(r.declaredAmount, r.currency)}</span> },
      { key: "received", label: "Amount Received", render: (r) => <span className={text}>{formatAccounting(r.amountReceived, r.currency)}</span> },
      {
        key: "variance",
        label: "Variance",
        render: (r) => (
          <span className={`text-sm ${(r.variance ?? 0) < 0 ? "text-red-600" : "text-body-text-300"}`}>
            {formatAccounting(r.variance, r.currency)}
          </span>
        ),
      },
      { key: "status", label: "Status", render: (r) => <StatusPill label={r.status} tone={TONE[r.status]} /> },
      { key: "submittedAt", label: "Submitted", render: (r) => (r.submittedAt ? <DateTimeCell iso={r.submittedAt} /> : <span className={text}>—</span>) },
    ],
    [],
  );

  return (
    <div className="space-y-4">
      <SummaryTiles>
        <SummaryTile label="Pending Verification" value={stats.pendingVerification} />
        <SummaryTile label="Confirmed" value={stats.confirmed} />
        <SummaryTile label="Variance Recorded" value={stats.varianceRecorded} tone="danger" />
      </SummaryTiles>
      <InventorySection
        title="Cash Lodgements"
        subtitle="Cash you’ve returned to HQ, and how it was verified"
        action={
          <Button radius="xl" onClick={onLodge} className="bg-primary-400! hover:bg-primary-500!">
            + Lodge Cash
          </Button>
        }
        isLoading={isLoading}
        errorMessage={errorMessage}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        data={rows}
        columns={columns}
        keyExtractor={(r) => r.id}
        emptyMessage="You haven’t lodged any cash yet."
      />
    </div>
  );
}
