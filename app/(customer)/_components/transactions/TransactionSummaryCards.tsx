"use client";

import { Money01Icon } from "@hugeicons/core-free-icons";
import { StatCard } from "../common";

interface TransactionSummaryCardsProps {
  totalTransactions: number;
  completed: number;
  rejected: number;
  pending: number;
}

export default function TransactionSummaryCards({
  totalTransactions,
  completed,
  rejected,
  pending,
}: TransactionSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={Money01Icon}
        label="No. of Transaction"
        value={totalTransactions}
        iconBgColor="bg-[#FFF6F1]"
        iconColor="text-[#DD4F05]"
      />
      <StatCard
        icon={Money01Icon}
        label="Completed"
        value={completed}
        iconBgColor="bg-green-50"
        iconColor="text-green-600"
      />
      <StatCard
        icon={Money01Icon}
        label="Rejected"
        value={rejected}
        iconBgColor="bg-red-50"
        iconColor="text-red-600"
      />
      <StatCard
        icon={Money01Icon}
        label="Pending"
        value={pending}
        iconBgColor="bg-yellow-50"
        iconColor="text-yellow-600"
      />
    </div>
  );
}
