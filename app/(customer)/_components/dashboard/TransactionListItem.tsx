"use client";

import { LucideIcon, RotateCw } from "lucide-react";

type TransactionListItemProps = {
  icon?: LucideIcon;
  iconVariant?: "grey" | "orange" | "green";
  primaryText: string;
  secondaryText: string;
  amount: string;
  amountVariant?: "normal" | "debit" | "credit";
};

const iconVariantStyles = {
  grey: "border-gray-200 bg-gray-50 text-[#6C6969]",
  orange: "border-primary-100 bg-primary-25 text-primary-400",
  green: "border-green-200 bg-green-50 text-green-600",
};

const amountVariantStyles = {
  normal: "text-[#4D4B4B]",
  debit: "text-red-600",
  credit: "text-green-600",
};

export default function TransactionListItem({
  icon: Icon = RotateCw,
  iconVariant = "grey",
  primaryText,
  secondaryText,
  amount,
  amountVariant = "normal",
}: TransactionListItemProps) {
  return (
    <div className="flex items-center gap-4 border-b border-gray-100 py-4 last:border-0">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${iconVariantStyles[iconVariant]}`}
      >
        <Icon size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[#4D4B4B]">{primaryText}</p>
        <p className="text-xs text-[#6C6969]">{secondaryText}</p>
      </div>
      <p className={`shrink-0 text-sm font-semibold ${amountVariantStyles[amountVariant]}`}>
        {amount}
      </p>
    </div>
  );
}
