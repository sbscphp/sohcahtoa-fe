"use client";

import StatCard from "@/app/admin/_components/StatCard";
import { Users, UserCheck, Repeat, FileCheck } from "lucide-react";

interface CustomerStatCardsProps {
  totalCustomers?: number;
  verifiedCustomers?: number;
  repeatCustomers?: number;
  pendingKYC?: number;
}

export function CustomerStatCards({
  totalCustomers = 0,
  verifiedCustomers = 0,
  repeatCustomers = 0,
  pendingKYC = 0,
}: CustomerStatCardsProps) {
  return (
    <div className="w-full rounded-xl bg-white p-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Customers"
          value={totalCustomers.toString()}
          icon={<Users className="h-5 w-5 text-orange-500" />}
          iconBg="bg-orange-100"
        />

        <StatCard
          title="Verified Customers"
          value={verifiedCustomers.toString()}
          icon={<UserCheck className="h-5 w-5 text-green-600" />}
          iconBg="bg-green-100"
        />

        <StatCard
          title="Repeat Customers"
          value={repeatCustomers.toString()}
          icon={<Repeat className="h-5 w-5 text-pink-600" />}
          iconBg="bg-pink-100"
        />

        <StatCard
          title="Pending KYC"
          value={pendingKYC.toString()}
          icon={<FileCheck className="h-5 w-5 text-yellow-600" />}
          iconBg="bg-yellow-100"
        />
      </div>
    </div>
  );
}
