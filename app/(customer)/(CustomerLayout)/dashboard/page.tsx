"use client";

import FxTransactionsCard from "../../_components/dashboard/FxTransactionsCard";
import CardsSection from "../../_components/dashboard/CardsSection";
import CardTransactionsCard from "../../_components/dashboard/CardTransactionsCard";
import CardTransactionFlowsCard from "../../_components/dashboard/CardTransactionFlowsCard";
import FxOverviewCard from "../../_components/dashboard/FxOverviewCard";
import SectionCard from "../../_components/dashboard/SectionCard";

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[6fr_4fr]">
      {/* Left column: 60% */}
      <div className="flex flex-col gap-6">
        <FxOverviewCard />
        <FxTransactionsCard />
      </div>

      {/* Right column: 40% */}
      <SectionCard className="space-y-4">
        <CardsSection />
        <CardTransactionsCard />
        <CardTransactionFlowsCard />
      </SectionCard>
    </div>
  );
}
