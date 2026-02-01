"use client";

import { Landmark } from "lucide-react";

export interface SelectableBankCardProps {
  bankName: string;
  accountNumber: string;
  accountName: string;
  isSelected: boolean;
  onClick: () => void;
}

export default function SelectableBankCard({
  bankName,
  accountNumber,
  accountName,
  isSelected,
  onClick,
}: SelectableBankCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left flex flex-row items-start p-4 gap-4 min-h-[72px] rounded-lg border transition-all ${
        isSelected
          ? "border border-primary-400 bg-[#FFF6F1]"
          : "border-[1.5px] border-gray-100 bg-white hover:border-gray-200"
      }`}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-text-300">
        <Landmark className="size-5" />
      </div>
      <div className="flex flex-col items-start gap-1 flex-1 min-w-0">
        <span className="text-sm font-medium leading-5 text-[#4D4B4B]">
          {bankName}
        </span>
        <span className="text-sm font-normal leading-5 text-[#8F8B8B]">
          {accountNumber} | {accountName}
        </span>
      </div>
    </button>
  );
}
