"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import StatCard from "../../_components/StatCard";
import gold from "../../_components/assets/icons/Goldmoneys.png";
import pink from "../../_components/assets/icons/pinkmoneys.png";
import blue from "../../_components/assets/icons/bluemoneys.png";
import green from "../../_components/assets/icons/greenmoneys.png";
import TransactionsTable from "@/app/admin/(AdminLayout)/transactions/_transactionsComponents/TransactionTable";
import WorkflowActionSection from "@/app/admin/(AdminLayout)/workflow/_workflowComponents/WorkflowActionSection";
import { useSetHeaderContent } from "../../_hooks/useSetHeaderContent";
import { HeaderTabs } from "../../_components/HeaderTabs";
import { useTransactionStats } from "./hooks/useTransactionStats";

const TRANSACTION_TABS = [
  { value: "transactions", label: "Transactions" },
  { value: "transaction-workflows", label: "Transaction Workflows" },
] as const;

export type TransactionTabId = (typeof TRANSACTION_TABS)[number]["value"];

const VALID_TAB_VALUES = TRANSACTION_TABS.map((t) => t.value) as string[];

function resolveTab(param: string | null): TransactionTabId {
  if (param && VALID_TAB_VALUES.includes(param)) return param as TransactionTabId;
  return "transactions";
}

function TransactionsTabContent() {
  const { stats } = useTransactionStats();
  const Icon1 = (
    <div>
      <Image src={gold} alt="icon" />
    </div>
  );
  const Icon2 = (
    <div>
      <Image src={pink} alt="icon" />
    </div>
  );
  const Icon3 = (
    <div>
      <Image src={blue} alt="icon" />
    </div>
  );
  const Icon4 = (
    <div>
      <Image src={green} alt="icon" />
    </div>
  );

  return (
    <>
      <div className="w-full rounded-xl bg-white p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Under Review"
            value={stats?.underReview ?? 0}
            icon={Icon1}
            iconBg="bg-orange-100"
          />
          <StatCard
            title="Rejected"
            value={stats?.rejected ?? 0}
            icon={Icon2}
            iconBg="bg-[#FFE4E8]"
          />
          <StatCard
            title="Request Information"
            value={stats?.requestInformation ?? 0}
            icon={Icon3}
            iconBg="bg-[#EBE9FE]"
          />
          <StatCard
            title="Approved"
            value={stats?.approved ?? 0}
            icon={Icon4}
            iconBg="bg-[#D1FADF]"
          />
        </div>
      </div>

      <TransactionsTable />
    </>
  );
}

export default function TransactionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = resolveTab(searchParams.get("tab"));
  const lastPushedTab = useRef<string | null>(null);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    const resolved = resolveTab(tabParam);

    if (!tabParam) {
      router.replace(`?tab=${resolved}`);
      lastPushedTab.current = resolved;
    }
  }, [searchParams, router]);

  const handleTabChange = useCallback(
    (value: string) => {
      const tab = value as TransactionTabId;
      if (tab === activeTab) return;
      lastPushedTab.current = tab;
      router.push(`?tab=${tab}`);
    },
    [activeTab, router]
  );

  const headerContent = useMemo(
    () => (
      <HeaderTabs
        value={activeTab}
        onChange={handleTabChange}
        tabs={[...TRANSACTION_TABS]}
      />
    ),
    [activeTab, handleTabChange]
  );

  useSetHeaderContent(headerContent);

  return (
    <div className="space-y-4">
      {activeTab === "transactions" && <TransactionsTabContent />}
      {activeTab === "transaction-workflows" && <WorkflowActionSection />}
    </div>
  );
}
