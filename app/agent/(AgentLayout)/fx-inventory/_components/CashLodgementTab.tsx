"use client";

import { useMemo } from "react";
import { Button } from "@mantine/core";
import type { PaginatedTableColumn } from "@/app/agent/_components/common";
import { formatAccounting } from "../_lib/format-fx";
import type { CashLodgement, LodgementStatus } from "../_lib/types";
import { CurrencyCell, DateTimeCell, InventorySection, StatusPill, SummaryTile, SummaryTiles } from "./shared";

const TONE: Record<LodgementStatus, "success" | "warning" | "danger"> = {
  Confirmed: "success",
  "Pending Verification": "warning",
  "Needs Review": "warning",
};

const text = "text-sm leading-5 text-body-text-300";

interface Props {
  rows: CashLodgement[];
  stats: { pendingVerification: number; confirmed: number; varianceRecorded: number };
  onLodge: () => void;
}

export function CashLodgementTab({ rows, stats, onLodge }: Readonly<Props>) {
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
      { key: "submittedAt", label: "Submitted", render: (r) => <DateTimeCell iso={r.submittedAt} /> },
    ],
    [],
  );

  return (
    <div className="space-y-4">
      <SummaryTiles>
        <SummaryTile label="Pending Verification" value={stats.pendingVerification} />
        <SummaryTile label="Confirmed this period" value={stats.confirmed} />
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
        data={rows}
        columns={columns}
        keyExtractor={(r) => r.id}
      />
    </div>
  );
}
