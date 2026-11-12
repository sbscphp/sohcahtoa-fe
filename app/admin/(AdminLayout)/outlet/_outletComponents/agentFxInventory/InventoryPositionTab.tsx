"use client";

import { useMemo, useState } from "react";
import { Group, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import type { ApiError, ApiResponse } from "@/app/_lib/api/client";
import { useGetExportData } from "@/app/_lib/api/hooks";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import {
  adminApi,
  type FxInventoryAgentPositionRow,
  type FxInventoryAgentPositionStatus,
} from "@/app/admin/_services/admin-api";
import type { AmountCell, PositionStatus } from "../../_data/agentFxInventoryMock";
import { formatCurrency } from "@/app/utils/helper/formatCurrency";
import { useFxInventoryAgentPosition } from "../../hooks/useFxInventoryAgentPosition";
import {
  AmountText,
  CurrencyLabel,
  ExportButton,
  FilterSelect,
  FLAGGED_COLOR,
  InventoryOverview,
  RECONCILED_COLOR,
  VARIANCE_COLOR,
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
  | { kind: "currency"; row: FxInventoryAgentPositionRow; status: PositionStatus }
  | { kind: "total"; row: FxInventoryAgentPositionRow; flaggedCount: number };

function positionStatus(variance: number | null | undefined): PositionStatus {
  return typeof variance === "number" ? "Variance" : "Reconciled";
}

function toAmountCell(amount: number | null | undefined, currency: string): AmountCell {
  if (typeof amount !== "number" || Number.isNaN(amount)) {
    return { text: "—", tone: "muted" };
  }

  return {
    text: formatCurrency(amount, currency) || "—",
    tone: amount < 0 ? "negative" : "default",
  };
}

function statusParam(filter: string | null): FxInventoryAgentPositionStatus | undefined {
  if (filter === "Reconciled") return "reconciled";
  if (filter === "Variance") return "variance";
  return undefined;
}

export default function InventoryPositionTab({ agentId }: { agentId: string }) {
  const [filter, setFilter] = useState<string | null>(null);
  const status = statusParam(filter);
  const params = useMemo(() => (status ? { status } : undefined), [status]);
  const { position, isLoading, isFetching, isError } = useFxInventoryAgentPosition(
    agentId,
    params
  );

  const tableRows = useMemo<PositionViewRow[]>(() => {
    if (isError || !position) return [];

    const rows = Array.isArray(position.rows) ? position.rows : [];
    const flaggedCount = rows.filter((row) => positionStatus(row.variance) === "Variance").length;

    return [
      ...rows.map((row) => ({
        kind: "currency" as const,
        row,
        status: positionStatus(row.variance),
      })),
      ...(position.total
        ? [{ kind: "total" as const, row: position.total, flaggedCount }]
        : []),
    ];
  }, [isError, position]);

  const renderRow = (item: PositionViewRow) => {
    if (item.kind === "total") {
      const currency = item.row.currency || "NGN";
      return [
        <CurrencyLabel key="currency" code={currency} label={`Total(${currency})`} />,
        <AmountText key="opening" value={toAmountCell(item.row.openingBalance, currency)} strong />,
        <AmountText
          key="disbursed"
          value={toAmountCell(item.row.disbursedFromAdmin, currency)}
          strong
        />,
        <AmountText
          key="purchased"
          value={toAmountCell(item.row.purchasedFromCustomers, currency)}
          strong
        />,
        <AmountText key="sold" value={toAmountCell(item.row.soldToCustomers, currency)} strong />,
        <AmountText key="lodged" value={toAmountCell(item.row.lodgedToHq, currency)} strong />,
        <AmountText
          key="closing"
          value={toAmountCell(item.row.closingBalance, currency)}
          strong
        />,
        <AmountText
          key="physical"
          value={toAmountCell(item.row.physicalCount, currency)}
          strong
        />,
        <AmountText key="variance" value={toAmountCell(item.row.variance, currency)} strong />,
        <Text key="status" size="sm" fw={600} c={FLAGGED_COLOR}>
          {item.flaggedCount} Flagged
        </Text>,
      ];
    }

    const currency = item.row.currency || "NGN";
    return [
      <CurrencyLabel key="currency" code={item.row.currency} label={item.row.currency} />,
      <AmountText key="opening" value={toAmountCell(item.row.openingBalance, currency)} />,
      <AmountText key="disbursed" value={toAmountCell(item.row.disbursedFromAdmin, currency)} />,
      <AmountText
        key="purchased"
        value={toAmountCell(item.row.purchasedFromCustomers, currency)}
      />,
      <AmountText key="sold" value={toAmountCell(item.row.soldToCustomers, currency)} />,
      <AmountText key="lodged" value={toAmountCell(item.row.lodgedToHq, currency)} />,
      <AmountText key="closing" value={toAmountCell(item.row.closingBalance, currency)} />,
      <AmountText key="physical" value={toAmountCell(item.row.physicalCount, currency)} />,
      <AmountText key="variance" value={toAmountCell(item.row.variance, currency)} />,
      <StatusBadge
        key="status"
        status={item.status}
        color={item.status === "Reconciled" ? RECONCILED_COLOR : VARIANCE_COLOR}
      />,
    ];
  };

  const exportPosition = useGetExportData(
    () =>
      adminApi.fxInventory.exportAgentInventoryPosition(
        agentId,
        params
      ) as Promise<Blob>,
    {
      onSuccess: (csvBlob) => {
        const objectUrl = URL.createObjectURL(csvBlob);
        const link = document.createElement("a");
        const dateStamp = new Date().toISOString().slice(0, 10);

        link.href = objectUrl;
        link.download = `agent-fx-inventory-position-${dateStamp}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(objectUrl);
      },
      onError: (error) => {
        const apiResponse = (error as unknown as ApiError).data as ApiResponse | undefined;
        notifications.show({
          title: "Export Inventory Position Failed",
          message:
            apiResponse?.error?.message ??
            error.message ??
            "Unable to export the inventory position at the moment. Please try again.",
          color: "red",
        });
      },
    }
  );

  return (
    <div className="space-y-4">
      <InventoryOverview agentId={agentId} />
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
            <ExportButton
              onClick={() => exportPosition.mutate()}
              loading={exportPosition.isPending}
            />
          </Group>
        </Group>
        <DynamicTableSection
          headers={POSITION_HEADERS}
          data={tableRows}
          loading={isLoading || isFetching}
          renderItems={renderRow}
          emptyTitle={isError ? "Could not load inventory position" : "No Inventory Position"}
          emptyMessage={
            isError
              ? "Something went wrong while loading the inventory position. Try again."
              : "There is no inventory position to display."
          }
        />
      </section>
    </div>
  );
}
