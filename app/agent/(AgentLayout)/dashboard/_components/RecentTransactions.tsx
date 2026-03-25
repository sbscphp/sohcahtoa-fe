"use client";

import { useMemo, useState } from "react";
import { Tabs } from "@mantine/core";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/app/(customer)/_lib/formatCurrency";
import SectionCard from "@/app/(customer)/_components/dashboard/SectionCard";
import SectionHeader from "@/app/(customer)/_components/dashboard/SectionHeader";
import SeeAllButton from "@/app/(customer)/_components/dashboard/SeeAllButton";
import { FilterTabs } from "@/app/(customer)/_components/common";
import TransactionListItem from "@/app/(customer)/_components/dashboard/TransactionListItem";
import { useFetchData } from "@/app/_lib/api/hooks";
import { agentApi } from "@/app/agent/_services/agent-api";
import type {
  AgentDashboardRecentTransaction,
  AgentDashboardRecentTransactionsResponse,
} from "@/app/_lib/api/types";
import { IconRecurring } from "@/components/icons";
import { LucideIcon } from "lucide-react";

const FILTER_TABS = [
  { value: "all", label: "All" },
  { value: "PTA", label: "PTA" },
  { value: "BTA", label: "BTA" },
  { value: "SCHOOL_FEES", label: "School Fees" },
  { value: "MEDICAL", label: "Medical" },
] as const;

function formatTxDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function RecentTransactions() {
  const [activeFilter, setActiveFilter] = useState("all");
  const router = useRouter();
  const filterType = activeFilter === "all" ? undefined : activeFilter;

  const { data, isLoading } = useFetchData<AgentDashboardRecentTransactionsResponse>(
    ["agent", "dashboard", "recent-transactions", { type: filterType }],
    () => agentApi.dashboard.recentTransactions({ page: 1, limit: 20, type: filterType }),
    true
  );

  const transactions = useMemo(
    () => data?.data ?? [],
    [data]
  );
  const activeTabLabel =
    FILTER_TABS.find((tab) => tab.value === activeFilter)?.label ?? activeFilter;

  return (
    <SectionCard>
      <SectionHeader
        // if activeFilter is all, return "Recent transactions"
        title={
          activeFilter === "all"
            ? "Recent transactions"
            : `${activeTabLabel} transactions`
        }
        action={
          <SeeAllButton
            onClick={() => router.push("/agent/transactions")}
            isViewAll
          />
        }
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
          return (
            <Tabs.Panel
              key={tab.value}
              value={tab.value}
              className="min-h-[300px]"
            >
              <div>
                {!isLoading && transactions.length === 0 ? (
                  <p className="py-8 text-center text-sm text-gray-500">
                    {tab.value === "all"
                      ? "No transactions"
                      : `No ${tab.label.toLowerCase()} transactions`}
                  </p>
                ) : (
                  transactions.map((tx: AgentDashboardRecentTransaction, i) => (
                    <TransactionListItem
                      key={`${tx.transactionId}-${i}`}
                      icon={IconRecurring as unknown as LucideIcon}
                      primaryText={tx.transactionId}
                      secondaryText={formatTxDate(tx.timestamp)}
                      amount={formatCurrency(tx.amount, tx.currency).formatted}
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
