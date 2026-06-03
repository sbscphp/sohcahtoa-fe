"use client";

import { Skeleton } from "@mantine/core";
import { Wallet, AlertCircle, CheckCircle, Coins } from "lucide-react";
import StatCard from "@/app/admin/_components/StatCard";
import { useTransientWalletStats } from "./hooks/useTransientWalletStats";
import { formatCurrency } from "@/app/utils/helper/formatCurrency";
import TransientWalletsTable from "./_transientWalletComponents/TransientWalletsTable";

export default function TransientWalletsPage() {
  const { stats, isLoading } = useTransientWalletStats();
  const isStatsEmpty = !isLoading && !stats;

  return (
    <div className="space-y-4">
      <div className="w-full rounded-xl bg-white p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} height={90} radius="md" />
            ))
          ) : (
            <>
              <StatCard
                title="Total Wallets"
                value={stats?.totalWallets ?? 0}
                icon={<Wallet className="h-5 w-5 text-orange-600" />}
                iconBg="bg-orange-100"
                isEmpty={isStatsEmpty}
              />
              <StatCard
                title="Matched Entries"
                value={stats?.matchedEntries ?? 0}
                icon={<CheckCircle className="h-5 w-5 text-green-600" />}
                iconBg="bg-green-100"
                isEmpty={isStatsEmpty}
              />
              <StatCard
                title="Unmatched Entries"
                value={stats?.unmatchedEntries ?? 0}
                icon={<AlertCircle className="h-5 w-5 text-orange-600" />}
                iconBg="bg-orange-100"
                isEmpty={isStatsEmpty}
              />
              <StatCard
                title="Total Volume"
                value={formatCurrency(stats?.totalVolume ?? 0)}
                icon={<Coins className="h-5 w-5 text-blue-600" />}
                iconBg="bg-blue-100"
                isEmpty={isStatsEmpty}
              />
            </>
          )}
        </div>
      </div>

      <TransientWalletsTable />
    </div>
  );
}
