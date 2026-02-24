"use client";

import { useState } from "react";
import { Tabs } from "@mantine/core";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/app/(customer)/_lib/formatCurrency";
import SectionCard from "@/app/(customer)/_components/dashboard/SectionCard";
import SectionHeader from "@/app/(customer)/_components/dashboard/SectionHeader";
import SeeAllButton from "@/app/(customer)/_components/dashboard/SeeAllButton";
import { FilterTabs } from "@/app/(customer)/_components/common";
import TransactionListItem from "@/app/(customer)/_components/dashboard/TransactionListItem";
import { IconRecurring } from "@/components/icons";
import { LucideIcon } from "lucide-react";

const FILTER_TABS = [
  { value: "all", label: "All" },
  { value: "fx", label: "FX" },
  { value: "pta", label: "PTA" },
  { value: "bta", label: "BTA" },
  { value: "medicals", label: "Medicals" },
] as const;

type TxCategory = (typeof FILTER_TABS)[number]["value"];

const MOCK_FX_TRANSACTIONS: {
  id: string;
  date: string;
  amount: number;
  category: Exclude<TxCategory, "all">;
}[] = [
  {
    id: "GHA67AGHA",
    date: "April 11, 2025 • 04:00 PM",
    amount: 2000,
    category: "fx",
  },
  {
    id: "PTA8821K",
    date: "April 10, 2025 • 11:20 AM",
    amount: 500,
    category: "pta",
  },
  {
    id: "GHA67AGHA",
    date: "April 9, 2025 • 03:15 PM",
    amount: 1500,
    category: "fx",
  },
  {
    id: "BTA0012M",
    date: "April 8, 2025 • 09:45 AM",
    amount: 800,
    category: "bta",
  },
  {
    id: "MED3345L",
    date: "April 7, 2025 • 02:00 PM",
    amount: 320,
    category: "medicals",
  },
];

export function RecentTransactions() {
  const [activeFilter, setActiveFilter] = useState("all");
  const router = useRouter();
  const currencyCode = "USD";

  return (
    <SectionCard>
      <SectionHeader
        title="FX transactions"
        action={<SeeAllButton onClick={() => router.push("/agent/transactions")} />}
      />
      <Tabs
        value={activeFilter}
        onChange={(v) => {
          if (v != null) setActiveFilter(v);
        }}
        variant="pills"
      >
        <div className="mb-4">
          <FilterTabs items={FILTER_TABS} value={activeFilter} />
        </div>
        {FILTER_TABS.map((tab) => {
          const filtered =
            tab.value === "all"
              ? MOCK_FX_TRANSACTIONS
              : MOCK_FX_TRANSACTIONS.filter((tx) => tx.category === tab.value);
          return (
            <Tabs.Panel key={tab.value} value={tab.value} className="min-h-[300px]">
              <div>
                {filtered.length === 0 ? (
                  <p className="py-8 text-center text-sm text-gray-500">
                    {tab.value === "all"
                      ? "No transactions"
                      : `No ${tab.label.toLowerCase()} transactions`}
                  </p>
                ) : (
                  filtered.map((tx, i) => (
                    <TransactionListItem
                      key={`${tx.id}-${i}`}
                      icon={(IconRecurring as unknown) as LucideIcon}
                      primaryText={tx.id}
                      secondaryText={tx.date}
                      amount={formatCurrency(tx.amount, currencyCode).formatted}
                    />
                  ))
                )}
              </div>
            </Tabs.Panel>
          );
        })}
      </Tabs>
    </SectionCard>
  );
}
