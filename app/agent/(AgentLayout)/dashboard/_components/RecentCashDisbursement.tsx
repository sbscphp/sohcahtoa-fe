"use client";

import { useRouter } from "next/navigation";
import { IconRecieve } from "@/components/icons";
import { LucideIcon } from "lucide-react";
import SectionHeader from "@/app/(customer)/_components/dashboard/SectionHeader";
import SeeAllButton from "@/app/(customer)/_components/dashboard/SeeAllButton";
import TransactionListItem from "@/app/(customer)/_components/dashboard/TransactionListItem";

const MOCK_DISBURSEMENTS = [
  { id: "1", primaryText: "CW-78451290", secondaryText: "Fri, Apr 18, 2025 • 7:32PM", amount: "-$7.64" },
  { id: "2", primaryText: "CW-78451291", secondaryText: "Fri, Apr 18, 2025 • 7:32PM", amount: "-$7.64" },
  { id: "3", primaryText: "CW-78451292", secondaryText: "Fri, Apr 18, 2025 • 7:32PM", amount: "-$7.64" },
  { id: "4", primaryText: "CW-78451293", secondaryText: "Fri, Apr 18, 2025 • 7:32PM", amount: "-$7.64" },
];

export function RecentCashDisbursement() {
  const router = useRouter();

  return (
    <div className="flex flex-col rounded-2xl bg-[#FAFAFA] p-2 shadow-sm">
      <SectionHeader
        title="Recent cash disbursement"
        action={
          <SeeAllButton onClick={() => router.push("/agent/fx-inventory")} />
        }
      />
      <div>
        {MOCK_DISBURSEMENTS.map((item) => (
          <TransactionListItem
            key={item.id}
            icon={(IconRecieve as unknown) as LucideIcon}
            iconVariant="orange"
            primaryText={item.primaryText}
            secondaryText={item.secondaryText}
            amount={item.amount}
            amountVariant="debit"
          />
        ))}
      </div>
    </div>
  );
}
