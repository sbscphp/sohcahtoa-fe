"use client";

import { useMemo } from "react";
import { Button } from "@mantine/core";
import { Plus } from "lucide-react";
import type { PaginatedTableColumn } from "@/app/agent/_components/common";
import { formatAccounting, formatPercent } from "../_lib/format-fx";
import type { ReconciliationRow } from "../_lib/types";
import { CurrencyCell, DateTimeCell, InventorySection, StatusPill } from "./shared";

const text = "text-sm leading-5 text-body-text-300";

interface Props {
  rows: ReconciliationRow[];
  onStart: () => void;
}

export function ReconciliationTab({ rows, onStart }: Readonly<Props>) {
  const columns = useMemo<PaginatedTableColumn<ReconciliationRow>[]>(
    () => [
      { key: "currency", label: "Currency", render: (r) => <CurrencyCell code={r.currency} /> },
      { key: "system", label: "System Closing Balance", render: (r) => <span className={text}>{formatAccounting(r.systemClosingBalance, r.currency)}</span> },
      { key: "physical", label: "Physical Count", render: (r) => <span className={text}>{formatAccounting(r.physicalCount, r.currency)}</span> },
      {
        key: "variance",
        label: "Variance",
        render: (r) => (
          <span className={`text-sm ${r.variance < 0 ? "text-red-600" : "text-body-text-300"}`}>
            {formatAccounting(r.variance, r.currency)}
          </span>
        ),
      },
      { key: "variancePercent", label: "Variance %", render: (r) => <span className={text}>{formatPercent(r.variancePercent)}</span> },
      {
        key: "status",
        label: "Status",
        render: (r) => <StatusPill label={r.status} tone={r.status === "Reconciled" ? "success" : "warning"} />,
      },
      { key: "lastUpdated", label: "Last Updated", render: (r) => <DateTimeCell iso={r.lastUpdated} /> },
    ],
    [],
  );

  return (
    <InventorySection
      title="Daily Reconciliation"
      subtitle="Compare system closing balance against the physical cash count"
      action={
        <Button
          radius="xl"
          leftSection={<Plus size={16} />}
          onClick={onStart}
          className="bg-primary-400! hover:bg-primary-500!"
        >
          Start Reconciliation
        </Button>
      }
      data={rows}
      columns={columns}
      keyExtractor={(r) => r.currency}
    />
  );
}
