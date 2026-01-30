"use client";

import { useState } from "react";
import { Tabs } from "@mantine/core";
import { formatCurrency } from "../../_lib/formatCurrency";
import SectionCard from "./SectionCard";
import SectionHeader from "./SectionHeader";
import SeeAllButton from "./SeeAllButton";
import { FilterTabs } from "../common";
import TransactionListItem from "./TransactionListItem";
import { useRouter } from "next/navigation";
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
  { id: "GHA67AGHA", date: "April 11, 2025 • 04:00 PM", amount: 2000, category: "fx" },
  { id: "PTA8821K", date: "April 10, 2025 • 11:20 AM", amount: 500, category: "pta" },
  { id: "GHA67AGHA", date: "April 9, 2025 • 03:15 PM", amount: 1500, category: "fx" },
  { id: "BTA0012M", date: "April 8, 2025 • 09:45 AM", amount: 800, category: "bta" },
  { id: "MED3345L", date: "April 7, 2025 • 02:00 PM", amount: 320, category: "medicals" },
];

export default function FxTransactionsCard() {
  const [activeFilter, setActiveFilter] = useState("all");
  const router = useRouter();
  return (
    <SectionCard>
      <SectionHeader title="FX transactions" action={<SeeAllButton onClick={() => router.push("/transactions")} />} />
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
              <div className="">
                {filtered.length === 0 ? (
                  <p className="py-8 text-center text-sm text-gray-500">
                    {tab.value === "all" ? "No transactions" : `No ${tab.label.toLowerCase()} transactions`}
                  </p>
                ) : (
                  filtered.map((tx, i) => (
                    <TransactionListItem
                      key={`${tx.id}-${i}`}
                      primaryText={tx.id}
                      secondaryText={tx.date}
                      amount={formatCurrency(tx.amount, "USD").formatted}
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
