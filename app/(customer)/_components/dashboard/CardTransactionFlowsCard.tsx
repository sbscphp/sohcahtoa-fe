"use client";

import { formatCurrency } from "../../_lib/formatCurrency";
import SectionCard from "./SectionCard";
import SectionHeader from "./SectionHeader";

type FlowRowProps = {
  label: string;
  value: string;
  barFillPercent: number;
  barColor: "green" | "orange";
};

function FlowRow({ label, value, barFillPercent, barColor }: FlowRowProps) {
  const barBg = barColor === "green" ? "bg-green-500" : "bg-primary-400";
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-[#6C6969]">{label}</span>
        <span className="font-semibold text-[#4D4B4B]">{value}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full ${barBg} transition-all`}
          style={{ width: `${Math.min(100, Math.max(0, barFillPercent))}%` }}
        />
      </div>
    </div>
  );
}

export default function CardTransactionFlowsCard() {
  const moneyIn = 4046;
  const moneyOut = 1046;
  const total = 3048;
  const max = Math.max(moneyIn, moneyOut);
  const inPercent = max > 0 ? (moneyIn / max) * 100 : 0;
  const outPercent = max > 0 ? (moneyOut / max) * 100 : 0;

  return (
    <SectionCard>
      <SectionHeader
        title="Card transaction flows"
        action={
          <span className="text-lg font-semibold text-[#4D4B4B]">
            +{formatCurrency(total, "USD").formatted}
          </span>
        }
      />
      <div className="space-y-5">
        <FlowRow
          label="Money in"
          value={formatCurrency(moneyIn, "USD").formatted}
          barFillPercent={inPercent}
          barColor="green"
        />
        <FlowRow
          label="Money out"
          value={formatCurrency(moneyOut, "USD").formatted}
          barFillPercent={outPercent}
          barColor="orange"
        />
      </div>
    </SectionCard>
  );
}
