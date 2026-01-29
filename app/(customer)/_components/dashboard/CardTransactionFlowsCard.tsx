"use client";

import { formatCurrency } from "../../_lib/formatCurrency";
import SectionHeader from "./SectionHeader";

type FlowRowProps = {
  label: string;
  value: string;
  barFillPercent: number;
  barColor: "green" | "orange";
};

function FlowRow({ label, value, barFillPercent, barColor }: FlowRowProps) {
  const fillColor = barColor === "green" ? "#2F7D01" : "#DD4F05";
  const pct = Math.min(100, Math.max(0, barFillPercent));
  return (
    <div className="flex min-h-[80px] w-full flex-col justify-center gap-2.5 self-stretch rounded-[10px] bg-white px-5 py-[25px]">
      <div className="flex w-full flex-row items-center justify-between gap-5">
        <span className="text-xs font-normal leading-[120%] text-[#232323]">{label}</span>
        <span className="text-xs font-normal leading-[120%] text-[#232323]">{value}</span>
      </div>
      <div className="isolate flex w-full flex-col items-start">
        <div className="relative h-1.5 w-full overflow-hidden rounded-[8px] bg-[#E7EBE5]">
          <div
            className="absolute inset-y-0 left-0 rounded-[8px] transition-all"
            style={{ width: `${pct}%`, background: fillColor }}
          />
        </div>
      </div>
    </div>
  );
}

export default function CardTransactionFlowsCard() {
  const moneyIn = 4046;
  const moneyOut = 1046;
  const total = 3048;
  const max = Math.max(moneyIn, moneyOut);
  const inPercent = max > 0 ? moneyIn / max * 100 : 0;
  const outPercent = max > 0 ? moneyOut / max * 100 : 0;
  const { symbol, value } = formatCurrency(total, "USD");
  const actualValue = value.split(".")[0];
  return (
    <div className="flex flex-col rounded-2xl bg-[#FAFAFA] p-2 shadow-sm">
      <SectionHeader
        title="Card transaction flows"
        action={
          <span className="text-lg font-semibold text-black">
            +{symbol}
            {actualValue}
            <span className="text-xs text-black">
              .{value.split(".")[1]}
            </span>
          </span>
        }
      />
      <div className="flex flex-col gap-2.5">
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
    </div>
  );
}
