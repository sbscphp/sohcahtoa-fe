"use client";

import { Coins, CreditCard } from "lucide-react";
import StatCard from "@/app/admin/_components/StatCard";
import { FX_INVENTORY_STATS } from "../_data/fxInventoryMock";
import FxInventoryHistory from "./FxInventoryHistory";

export default function FxInventoryView() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Disbursement"
          value={FX_INVENTORY_STATS.totalDisbursement}
          icon={<Coins className="h-5 w-5 text-primary-400" />}
          iconBg="bg-primary-00"
        />
        <StatCard
          title="Total Lodgments"
          value={FX_INVENTORY_STATS.totalLodgments}
          icon={<Coins className="h-5 w-5 text-primary-300" />}
          iconBg="bg-primary-00"
        />
        <StatCard
          title="Pending Approvals"
          value={FX_INVENTORY_STATS.pendingApprovals}
          icon={<Coins className="h-5 w-5 text-yellow-600" />}
          iconBg="bg-yellow-100"
        />
        <StatCard
          title="Approved Disbursement"
          value={FX_INVENTORY_STATS.approvedDisbursement}
          icon={<CreditCard className="h-5 w-5 text-blue-600" />}
          iconBg="bg-blue-100"
        />
      </div>

      <FxInventoryHistory />
    </div>
  );
}
