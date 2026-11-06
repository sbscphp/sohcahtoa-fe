"use client";

import type { ReactNode } from "react";
import { Select } from "@mantine/core";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  BankIcon,
  Clock01Icon,
  Money03Icon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons";
import { formatMoney } from "../_lib/format-fx";
import type { InventorySummary } from "../_lib/types";

interface Props {
  summary: InventorySummary;
  currency: string;
  currencies: string[];
  onCurrencyChange: (code: string) => void;
}

function InventoryCard({
  icon,
  label,
  value,
  aside,
}: Readonly<{ icon: typeof Money03Icon; label: string; value: string; aside?: ReactNode }>) {
  return (
    <div className="flex items-center gap-2 rounded-xl border-[1.5px] border-gray-100 bg-white p-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-[#FFF1F3]">
        <HugeiconsIcon icon={icon} className="size-6 text-[#E5484D]" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
          <p className="text-xs text-[#8F8B8B]">{label}</p>
          {aside}
        </div>
        <p className="truncate text-lg font-bold leading-[26px] text-[#323131]">{value}</p>
      </div>
    </div>
  );
}

export function SummaryCards({ summary, currency, currencies, onCurrencyChange }: Readonly<Props>) {
  const pending = summary.pendingSettlements;
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <InventoryCard
        icon={Money03Icon}
        label="Available FX Inventory"
        value={formatMoney(summary.availableFxInventory, currency)}
        aside={
          <Select
            size="xs"
            w={72}
            data={currencies}
            value={currency}
            onChange={(v) => v && onCurrencyChange(v)}
            allowDeselect={false}
            aria-label="Inventory currency"
          />
        }
      />
      <InventoryCard icon={BankIcon} label="NGN Cash Available" value={formatMoney(summary.ngnCashAvailable, "NGN")} />
      <InventoryCard
        icon={Clock01Icon}
        label="Pending Settlements"
        value={`${pending} ${pending === 1 ? "Transaction" : "Transactions"}`}
      />
      <InventoryCard icon={Wallet01Icon} label="Cash Lodgement" value={formatMoney(summary.cashLodgement, "NGN")} />
    </div>
  );
}
