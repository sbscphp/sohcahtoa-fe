"use client";

import {
  IconRecieve,
  IconRecurring,
  IconRepeat,
  IconTransfer
} from "@/components/icons";
import { LucideIcon } from "lucide-react";
import { SVGProps } from "react";

type TransactionListItemProps = {
  icon?: LucideIcon;
  iconVariant?: "grey" | "orange" | "green";
  primaryText: string;
  secondaryText: string;
  amount: string;
  amountVariant?: "normal" | "debit" | "credit";
};

const iconVariantStyles = {
  grey: "border-gray-200 bg-[#F3F3F3] text-[#6C6969]",
  orange: "border-primary-100 bg-primary-25 text-primary-400",
  green: "border-green-200 bg-green-50 text-green-600"
};

const amountVariantStyles = {
  normal: "text-body-text-300",
  debit: "text-red-600",
  credit: "text-green-600"
};

const iconTypes: Record<
  string,
  React.ComponentType<SVGProps<SVGSVGElement>>
> = {
  recurring: IconRecurring,
  recieve: IconRecieve,
  repeat: IconRepeat,
  transfer: IconTransfer
};

export default function TransactionListItem({
  icon: Icon = (iconTypes.recurring as unknown) as LucideIcon,
  iconVariant = "grey",
  primaryText,
  secondaryText,
  amount,
  amountVariant = "normal"
}: TransactionListItemProps) {
  return (
    <div className="flex items-center gap-4 border-b border-gray-100 py-4 last:border-0">
      <div
        className={`flex w-10 h-10 shrink-0 items-center justify-center rounded-full shadow-xs ${iconVariantStyles[
          iconVariant
        ]}`}
      >
        <Icon className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-heading-100">
          {primaryText}
        </p>
        <p className="text-xs text-body-text-100">
          {secondaryText}
        </p>
      </div>
      <p
        className={`shrink-0 text-sm font-semibold ${amountVariantStyles[
          amountVariant
        ]}`}
      >
        {amount}
      </p>
    </div>
  );
}
