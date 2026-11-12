"use client";

import { Skeleton } from "@mantine/core";
import { Coins, CreditCard } from "lucide-react";
import StatCard from "@/app/admin/_components/StatCard";
import { useFxInventoryStats } from "../hooks/useFxInventoryStats";
import FxInventoryHistory from "./FxInventoryHistory";

export default function FxInventoryView() {
  const { stats, isLoading, isError } = useFxInventoryStats();
  const value = (amount: number | undefined) => (isError ? "—" : (amount ?? 0));

  return (
    <div className="space-y-4 m-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading ? (
          <>
            <Skeleton height={72} radius="md" />
            <Skeleton height={72} radius="md" />
            <Skeleton height={72} radius="md" />
            <Skeleton height={72} radius="md" />
          </>
        ) : (
          <>
            <StatCard
              title="Total Disbursement"
              value={value(stats?.totalDisbursements)}
              icon={<Coins className="h-5 w-5 text-primary-400" />}
              iconBg="bg-primary-00"
            />
            <StatCard
              title="Total Lodgments"
              value={value(stats?.totalLodgments)}
              icon={<Coins className="h-5 w-5 text-primary-300" />}
              iconBg="bg-primary-00"
            />
            <StatCard
              title="Pending Approvals"
              value={value(stats?.pendingApprovals)}
              icon={<Coins className="h-5 w-5 text-yellow-600" />}
              iconBg="bg-yellow-100"
            />
            <StatCard
              title="Approved Disbursement"
              value={value(stats?.approvedDisbursements)}
              icon={<CreditCard className="h-5 w-5 text-blue-600" />}
              iconBg="bg-blue-100"
            />
          </>
        )}
      </div>

      <FxInventoryHistory />
    </div>
  );
}
