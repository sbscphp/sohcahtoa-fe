"use client";

import { ArrowLeftRight, RotateCw } from "lucide-react";
import { formatCurrency } from "../../_lib/formatCurrency";
import SectionCard from "./SectionCard";
import SectionHeader from "./SectionHeader";
import SeeAllButton from "./SeeAllButton";
import TransactionListItem from "./TransactionListItem";

const MOCK_CARD_TRANSACTIONS = [
  {
    icon: RotateCw,
    iconVariant: "orange" as const,
    primaryText: "Transfer to Ruth",
    secondaryText: "Fri, Apr 18, 2025 • 7:32PM",
    amount: 7.64,
    amountVariant: "debit" as const,
  },
  {
    icon: ArrowLeftRight,
    iconVariant: "grey" as const,
    primaryText: "Wallet to wallet",
    secondaryText: "Sat, Mar 2, 2025 • 8:12AM",
    amount: 14,
    amountVariant: "debit" as const,
  },
  {
    icon: RotateCw,
    iconVariant: "green" as const,
    primaryText: "Transfer from Tochukwu",
    secondaryText: "Tue, Feb 7, 2025 • 11:50PM",
    amount: 850.89,
    amountVariant: "credit" as const,
  },
];

export default function CardTransactionsCard() {
  return (
    <SectionCard>
      <SectionHeader title="Card transactions" action={<SeeAllButton />} />
      <div className="-mx-2">
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
    </SectionCard>
  );
}
