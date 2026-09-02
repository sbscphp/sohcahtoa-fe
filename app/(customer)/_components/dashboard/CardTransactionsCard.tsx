"use client";

import { LucideIcon } from "lucide-react";
import { formatCurrency } from "../../_lib/formatCurrency";
import SectionHeader from "./SectionHeader";
import SeeAllButton from "./SeeAllButton";
import TransactionListItem from "./TransactionListItem";
import { useRouter } from "next/navigation";

type IconVariant = "orange" | "grey" | "green";

type CardTransactionItem = {
  id: string;
  icon: LucideIcon;
  iconVariant: IconVariant;
  primaryText: string;
  secondaryText: string;
  amount: number;
  amountVariant: "debit" | "credit";
  currency?: string;
};

/** Wire to card transactions API when available. */
const CARD_TRANSACTIONS: CardTransactionItem[] = [];

export default function CardTransactionsCard() {
  const router = useRouter();

  return (
    <div className="flex flex-col rounded-2xl bg-[#FAFAFA] p-2 shadow-sm">
      <SectionHeader
        title="Card transactions"
        action={<SeeAllButton onClick={() => router.push("/transactions")} />}
      />
      <div>
        {CARD_TRANSACTIONS.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">No card transactions yet.</p>
        ) : (
          CARD_TRANSACTIONS.map((tx) => (
            <TransactionListItem
              key={tx.id}
              icon={tx.icon}
              iconVariant={tx.iconVariant}
              primaryText={tx.primaryText}
              secondaryText={tx.secondaryText}
              amount={
                tx.amountVariant === "debit"
                  ? `-${formatCurrency(Math.abs(tx.amount), tx.currency || "USD").formatted}`
                  : formatCurrency(tx.amount, tx.currency || "USD").formatted
              }
              amountVariant={tx.amountVariant}
            />
          ))
        )}
      </div>
    </div>
  );
}
