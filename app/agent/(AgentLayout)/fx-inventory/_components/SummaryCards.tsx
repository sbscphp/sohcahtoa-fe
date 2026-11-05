"use client";

import {
  BankIcon,
  Clock01Icon,
  Money03Icon,
  BalanceScaleIcon,
} from "@hugeicons/core-free-icons";
import { StatCard } from "@/app/agent/_components/common";
import { formatMoney } from "../_lib/format-fx";
import type { InventorySummary } from "../_lib/types";

interface Props {
  summary: InventorySummary;
  currency: string;
}

const pink = { iconBgColor: "bg-[#FFF1F3]", iconColor: "text-[#E5484D]" };

export function SummaryCards({ summary, currency }: Readonly<Props>) {
  const pending = summary.pendingSettlements;
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={Money03Icon}
        label="Available FX Inventory"
        value={formatMoney(summary.availableFxInventory, currency)}
        {...pink}
      />
      <StatCard
        icon={BankIcon}
        label="NGN Cash Available"
        value={formatMoney(summary.ngnCashAvailable, "NGN")}
        {...pink}
      />
      <StatCard
        icon={Clock01Icon}
        label="Pending Settlements"
        value={`${pending} ${pending === 1 ? "Transaction" : "Transactions"}`}
        {...pink}
      />
      <StatCard
        icon={BalanceScaleIcon}
        label="Inventory Variance"
        value={`${formatMoney(0, "NGN")}/${formatMoney(summary.inventoryVariance, "USD")}`}
        {...pink}
      />
    </div>
  );
}
