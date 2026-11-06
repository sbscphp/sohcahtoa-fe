"use client";

import { useMemo, useState } from "react";
import { Group, Text } from "@mantine/core";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import {
  INVENTORY_POSITION_ROWS,
  INVENTORY_POSITION_TOTAL,
  type InventoryPositionRow,
} from "../../_data/agentFxInventoryMock";
import {
  AmountText,
  CurrencyLabel,
  ExportButton,
  FilterSelect,
  FLAGGED_COLOR,
  InventoryOverview,
  RECONCILED_COLOR,
  VARIANCE_COLOR,
  downloadCsv,
} from "./detailShared";

const POSITION_HEADERS = [
  { label: "Currency", key: "currency" },
  { label: "Opening Balance", key: "opening" },
  { label: "Disbursed from Admin", key: "disbursed" },
  { label: "Purchased from Customers", key: "purchased" },
  { label: "Sold to Customers", key: "sold" },
  { label: "Lodged to HQ", key: "lodged" },
  { label: "Closing Balance", key: "closing" },
  { label: "Physical Count", key: "physical" },
  { label: "Variance", key: "variance" },
  { label: "Status", key: "status" },
];

type PositionViewRow =
  | { kind: "currency"; row: InventoryPositionRow }
  | { kind: "total" };

export default function InventoryPositionTab() {
  const [filter, setFilter] = useState<string | null>(null);

  const currencyRows = useMemo(
    () => INVENTORY_POSITION_ROWS.filter((row) => !filter || row.status === filter),
    [filter]
  );

  const tableRows: PositionViewRow[] = [
    ...currencyRows.map((row) => ({ kind: "currency" as const, row })),
    { kind: "total" as const },
  ];

  const renderRow = (item: PositionViewRow) => {
    if (item.kind === "total") {
      const total = INVENTORY_POSITION_TOTAL;
      return [
        <CurrencyLabel key="currency" code="NGN" label={total.label} />,
        <AmountText key="opening" value={total.openingBalance} strong />,
        <AmountText key="disbursed" value={total.disbursedFromAdmin} strong />,
        <AmountText key="purchased" value={total.purchasedFromCustomers} strong />,
        <AmountText key="sold" value={total.soldToCustomers} strong />,
        <AmountText key="lodged" value={total.lodgedToHq} strong />,
        <AmountText key="closing" value={total.closingBalance} strong />,
        <AmountText key="physical" value={total.physicalCount} strong />,
        <AmountText key="variance" value={total.variance} strong />,
        <Text key="status" size="sm" fw={600} c={FLAGGED_COLOR}>
          {total.flaggedLabel}
        </Text>,
      ];
    }

    const row = item.row;
    return [
      <CurrencyLabel key="currency" code={row.currency} label={row.currency} />,
      <AmountText key="opening" value={row.openingBalance} />,
      <AmountText key="disbursed" value={row.disbursedFromAdmin} />,
      <AmountText key="purchased" value={row.purchasedFromCustomers} />,
      <AmountText key="sold" value={row.soldToCustomers} />,
      <AmountText key="lodged" value={row.lodgedToHq} />,
      <AmountText key="closing" value={row.closingBalance} />,
      <AmountText key="physical" value={row.physicalCount} />,
      <AmountText key="variance" value={row.variance} />,
      <StatusBadge
        key="status"
        status={row.status}
        color={row.status === "Reconciled" ? RECONCILED_COLOR : VARIANCE_COLOR}
      />,
    ];
  };

  const handleExport = () => {
    const dateStamp = new Date().toISOString().slice(0, 10);
    const total = INVENTORY_POSITION_TOTAL;
    downloadCsv(
      `agent-fx-inventory-position-${dateStamp}.csv`,
      POSITION_HEADERS.map((header) => header.label),
      [
        ...currencyRows.map((row) => [
          row.currency,
          row.openingBalance.text,
          row.disbursedFromAdmin.text,
          row.purchasedFromCustomers.text,
          row.soldToCustomers.text,
          row.lodgedToHq.text,
          row.closingBalance.text,
          row.physicalCount.text,
          row.variance.text,
          row.status,
        ]),
        [
          total.label,
          total.openingBalance.text,
          total.disbursedFromAdmin.text,
          total.purchasedFromCustomers.text,
          total.soldToCustomers.text,
          total.lodgedToHq.text,
          total.closingBalance.text,
          total.physicalCount.text,
          total.variance.text,
          total.flaggedLabel,
        ],
      ]
    );
  };

  return (
    <div className="space-y-4">
      <InventoryOverview />
      <section className="rounded-lg bg-white p-5">
        <Group justify="space-between" align="flex-start" wrap="wrap" mb="md">
          <div>
            <h2 className="text-base font-semibold">FX Inventory Position</h2>
            <Text size="xs" c="dimmed">
              Today&apos;s opening-to-closing movement per currency
            </Text>
          </div>
          <Group>
            <FilterSelect
              value={filter}
              data={["Reconciled", "Variance"]}
              onChange={setFilter}
            />
            <ExportButton onClick={handleExport} />
          </Group>
        </Group>
        <DynamicTableSection
          headers={POSITION_HEADERS}
          data={tableRows}
          renderItems={renderRow}
        />
      </section>
    </div>
  );
}
