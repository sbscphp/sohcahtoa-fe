"use client";

import { Skeleton } from "@mantine/core";
import { Coins } from "lucide-react";
import StatCard from "@/app/admin/_components/StatCard";
import RateTableSection from "./_components/RateTableSection";
import { useRateStats } from "./hooks/useRateStats";

export default function RateManagementPage() {
  const { stats, isLoading } = useRateStats();
  const isStatsEmpty = !isLoading && !stats;

  return (
    <div className="space-y-6">
      <div className="w-full rounded-xl bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} height={90} radius="md" />
            ))
          ) : (
            <>
              <StatCard
                title="All Rate"
                value={stats?.all ?? 0}
                icon={<Coins className="h-5 w-5 text-orange-600" />}
                iconBg="bg-orange-100"
                isEmpty={isStatsEmpty}
              />
              <StatCard
                title="Active Rate"
                value={stats?.active ?? 0}
                icon={<Coins className="h-5 w-5 text-green-600" />}
                iconBg="bg-green-100"
                isEmpty={isStatsEmpty}
              />
              <StatCard
                title="Schedule Rate"
                value={stats?.scheduled ?? 0}
                icon={<Coins className="h-5 w-5 text-pink-600" />}
                iconBg="bg-pink-100"
                isEmpty={isStatsEmpty}
              />
            </>
          )}
        </div>
      </div>

      <RateTableSection />
    </div>
  );
}
