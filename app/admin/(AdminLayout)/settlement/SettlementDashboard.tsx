"use client";

import { Grid } from "@mantine/core";
import { Coins, ScrollText, Wallet } from "lucide-react";
import { StatCard } from "./_components/SettlementDashboardShared";
import { DiscrepancyReportsSection } from "./_components/DiscrepancyReportsSection";
import { PendingReconciliationSection } from "./_components/PendingReconciliationSection";
import { EscrowAccountsSection } from "./_components/EscrowAccountsSection";
import { RecentFundingTransactionsSection } from "./_components/RecentFundingTransactionsSection";

export default function SettlementDashboard() {
  return (
    <div className="m-5 space-y-6">

      <div className="w-full p-4 bg-white shadow-sm rounded-xl">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            title="Current Balance"
            value="₦54,768,000.07"
            icon={<Coins className="w-5 h-5 text-orange-600" />}
            iconBg="bg-orange-100"
          />

          <StatCard
            title="Pending Reconciliation"
            value="8"
            icon={<ScrollText className="w-5 h-5 text-yellow-600" />}
            iconBg="bg-yellow-100"
          />

          <StatCard
            title="Total Escrow Accounts"
            value="24"
            icon={<Wallet className="w-5 h-5 text-blue-600" />}
            iconBg="bg-blue-100"
          />
        </div>
      </div>

      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <DiscrepancyReportsSection />
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 4 }}>
          <PendingReconciliationSection />
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 4 }}>
          <EscrowAccountsSection />
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 8 }}>
          <RecentFundingTransactionsSection />
        </Grid.Col>
      </Grid>
    </div>
  );
}
