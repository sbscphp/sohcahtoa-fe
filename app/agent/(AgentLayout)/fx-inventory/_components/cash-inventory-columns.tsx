"use client";

import type { MouseEvent } from "react";
import { ActionIcon, Badge } from "@mantine/core";
import type { PaginatedTableColumn } from "@/app/agent/_components/common";
import { IconArrowRight } from "@/components/icons/IconArrowRight";
import type {
  AgentPaymentMovementItem,
  AgentPaymentMovementType,
} from "@/app/_lib/api/types";
import {
  formatMovementDate,
  formatNgnAmount,
  formatTransactionTypeLabel,
  movementAmountDisplay,
  movementReceivedFromLabel,
} from "../_lib/format-inventory";

function RowAction({
  onOpen,
}: Readonly<{
  onOpen: (e: MouseEvent<HTMLButtonElement>) => void;
}>) {
  return (
    <ActionIcon
      radius="md"
      variant="light"
      w={40}
      h={40}
      className="bg-[#FFF6F1]! border border-[#FFF6F1]!"
      style={{
        boxShadow: "0px 1px 2px rgba(16, 24, 40, 0.05)",
        padding: "10px",
      }}
      onClick={onOpen}
      aria-label="View transaction details"
    >
      <IconArrowRight className="w-8 h-8" />
    </ActionIcon>
  );
}

export function buildCashInventoryColumns(options: {
  movementType: AgentPaymentMovementType;
  currencyCode: string;
  onOpenDetails: (row: AgentPaymentMovementItem) => void;
}): PaginatedTableColumn<AgentPaymentMovementItem>[] {
  const { movementType, currencyCode, onOpenDetails } = options;

  if (movementType === "cash_disbursed") {
    return [
      {
        key: "transaction_id",
        label: "Transaction ID",
        render: (t) => (
          <p className="text-body-text-300 font-medium text-sm leading-5">{t.transaction_id}</p>
        ),
      },
      {
        key: "customer_full_name",
        label: "Customer Name",
        render: (t) => (
          <p className="text-body-text-400 text-sm leading-5">{t.customer_full_name ?? "—"}</p>
        ),
      },
      {
        key: "amount_disbursed",
        label: "Cash Disbursed",
        render: (t) => (
          <p className="text-body-text-300 font-medium text-sm leading-5">
            {formatNgnAmount(t.amount_disbursed, currencyCode)}
          </p>
        ),
      },
      {
        key: "currency_pair",
        label: "Currency Pair",
        render: (t) => (
          <p className="text-body-text-400 text-sm leading-5">{t.currency_pair ?? "—"}</p>
        ),
      },
      {
        key: "prepaid_amount",
        label: "Prepaid Amount",
        render: (t) => (
          <p className="text-body-text-400 text-sm leading-5">
            {formatNgnAmount(
              typeof t.prepaid_amount === "number" ? t.prepaid_amount : null,
              currencyCode
            )}
          </p>
        ),
      },
      {
        key: "transaction_type",
        label: "Transaction type",
        render: (t) => (
          <Badge variant="light" color="orange" size="sm">
            {formatTransactionTypeLabel(t.transaction_type ?? undefined)}
          </Badge>
        ),
      },
      {
        key: "transaction_date",
        label: "Transaction Date",
        render: (t) => (
          <p className="text-body-text-200 text-sm leading-5">
            {formatMovementDate(t.transaction_date)}
          </p>
        ),
      },
      {
        key: "action",
        label: "",
        headerClassName: "w-12",
        className: "w-12",
        render: (row) => (
          <RowAction
            onOpen={(e) => {
              e.stopPropagation();
              onOpenDetails(row);
            }}
          />
        ),
      },
    ];
  }

  return [
    {
      key: "receivedFrom",
      label: "Received From",
      render: (t) => (
        <p className="text-body-text-300 font-medium text-sm leading-5">
          {movementReceivedFromLabel(t, movementType)}
        </p>
      ),
    },
    {
      key: "cashReceived",
      label: "Cash Received",
      render: (t) => (
        <p className="text-body-text-300 font-medium text-sm leading-5">
          {movementAmountDisplay(t, movementType, currencyCode)}
        </p>
      ),
    },
    {
      key: "transaction_date",
      label: "Transaction Date",
      render: (t) => (
        <p className="text-body-text-200 text-sm leading-5">
          {formatMovementDate(t.transaction_date)}
        </p>
      ),
    },
    {
      key: "action",
      label: "",
      headerClassName: "w-12",
      className: "w-12",
      render: (row) => (
        <RowAction
          onOpen={(e) => {
            e.stopPropagation();
            onOpenDetails(row);
          }}
        />
      ),
    },
  ];
}
