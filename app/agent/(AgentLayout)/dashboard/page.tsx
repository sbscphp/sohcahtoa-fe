"use client";

import SectionCard from "@/app/(customer)/_components/dashboard/SectionCard";
import { CashOverview } from "./_components/CashOverview";
import { TransactionsByType } from "./_components/TransactionsByType";
import { RecentTransactions } from "./_components/RecentTransactions";
import { RecentCashDisbursement } from "./_components/RecentCashDisbursement";

export default function AgentDashboardPage() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[6fr_4fr]">
      {/* Left column: 60% */}
      <div className="flex flex-col gap-6">
        <CashOverview />
        <RecentTransactions />
      </div>

      {/* Right column: 40% */}
      <SectionCard className="space-y-4">
        <TransactionsByType />
        <RecentCashDisbursement />
      </SectionCard>
    </div>
  );
}
