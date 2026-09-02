"use client";

import type { ReactNode } from "react";
import StatCard from "@/app/admin/_components/StatCard";
import type { AgentCustomerSegment } from "@/app/_lib/api/types";
import { Users, UserCheck, Repeat, FileCheck } from "lucide-react";

interface CustomerStatCardsProps {
  totalCustomers?: number;
  verifiedCustomers?: number;
  repeatCustomers?: number;
  pendingKYC?: number;
  activeSegment?: AgentCustomerSegment | string;
  onSegmentChange?: (segment: AgentCustomerSegment) => void;
}

export function CustomerStatCards({
  totalCustomers = 0,
  verifiedCustomers = 0,
  repeatCustomers = 0,
  pendingKYC = 0,
  activeSegment = "ALL",
  onSegmentChange,
}: CustomerStatCardsProps) {
  const cards: Array<{
    title: string;
    value: number;
    segment: AgentCustomerSegment;
    icon: ReactNode;
    iconBg: string;
  }> = [
    {
      title: "Total Customers",
      value: totalCustomers,
      segment: "ALL",
      icon: <Users className="h-5 w-5 text-orange-500" />,
      iconBg: "bg-orange-100",
    },
    {
      title: "Verified Customers",
      value: verifiedCustomers,
      segment: "VERIFIED",
      icon: <UserCheck className="h-5 w-5 text-green-600" />,
      iconBg: "bg-green-100",
    },
    {
      title: "Returning Customers",
      value: repeatCustomers,
      segment: "RETURNING",
      icon: <Repeat className="h-5 w-5 text-pink-600" />,
      iconBg: "bg-pink-100",
    },
    {
      title: "Pending KYC",
      value: pendingKYC,
      segment: "PENDING_KYC",
      icon: <FileCheck className="h-5 w-5 text-yellow-600" />,
      iconBg: "bg-yellow-100",
    },
  ];

  return (
    <div className="w-full rounded-xl bg-white p-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const isActive = activeSegment === card.segment;
          const content = (
            <StatCard
              title={card.title}
              value={card.value.toString()}
              icon={card.icon}
              iconBg={card.iconBg}
              className={
                isActive
                  ? "border-primary-200 ring-1 ring-primary-100"
                  : undefined
              }
            />
          );

          if (!onSegmentChange) {
            return <div key={card.segment}>{content}</div>;
          }

          return (
            <button
              key={card.segment}
              type="button"
              onClick={() => onSegmentChange(card.segment)}
              className="rounded-xl text-left transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200"
              aria-pressed={isActive}
            >
              {content}
            </button>
          );
        })}
      </div>
    </div>
  );
}
