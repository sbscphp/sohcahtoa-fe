"use client";

import { IconRecieve, IconRepeat, IconTransfer } from "@/components/icons";
import { LucideIcon } from "lucide-react";
import { formatCurrency } from "../../_lib/formatCurrency";
import SectionHeader from "./SectionHeader";
import SeeAllButton from "./SeeAllButton";
import TransactionListItem from "./TransactionListItem";

type IconVariant = "orange" | "grey" | "green";

const MOCK_CARD_TRANSACTIONS = [
  {
    icon: (IconTransfer as unknown as LucideIcon),
    iconVariant: "orange" as IconVariant,
    primaryText: "Transfer to Ruth",
    secondaryText: "Fri, Apr 18, 2025 • 7:32PM",
    amount: 7.64,
    amountVariant: "debit" as const,
  },
  {
    icon: (IconRepeat as unknown as LucideIcon),
    iconVariant: "grey" as IconVariant,
    primaryText: "Wallet to wallet",
    secondaryText: "Sat, Mar 2, 2025 • 8:12AM",
    amount: 14,
    amountVariant: "debit" as const,
  },
  {
    icon: (IconRecieve as unknown as LucideIcon),
    iconVariant: "green" as IconVariant,
    primaryText: "Transfer from Tochukwu",
    secondaryText: "Tue, Feb 7, 2025 • 11:50PM",
    amount: 850.89,
    amountVariant: "credit" as const,
  },
];

export default function CardTransactionsCard() {
  return (
    <div className="flex flex-col rounded-2xl bg-[#FAFAFA] p-2 shadow-sm">
      <SectionHeader title="Card transactions" action={<SeeAllButton />} />
      <div className="">
        {MOCK_CARD_TRANSACTIONS.map((tx, i) => (
          <TransactionListItem
            key={i}
            icon={tx.icon}
            iconVariant={tx.iconVariant}
            primaryText={tx.primaryText}
            secondaryText={tx.secondaryText}
            amount={
              tx.amountVariant === "debit"
                ? `-${formatCurrency(Math.abs(tx.amount), "USD").formatted}`
                : formatCurrency(tx.amount, "USD").formatted
            }
            amountVariant={tx.amountVariant}
          />
        ))}
      </div>
    </div>
  );
}
