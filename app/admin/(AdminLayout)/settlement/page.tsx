"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HeaderTabs } from "../../_components/HeaderTabs";
import { useSetHeaderContent } from "../../_hooks/useSetHeaderContent";
import FxInventoryView from "./_components/FxInventoryView";
import SettlementDashboard from "./SettlementDashboard";

const SETTLEMENT_TABS = [
  { value: "overview", label: "Settlement Overview" },
  { value: "fx-inventory", label: "FX Inventory" },
] as const;

export type SettlementTabId = (typeof SETTLEMENT_TABS)[number]["value"];

const VALID_TAB_VALUES = SETTLEMENT_TABS.map((tab) => tab.value) as string[];

function resolveTab(param: string | null): SettlementTabId {
  if (param && VALID_TAB_VALUES.includes(param)) return param as SettlementTabId;
  return "overview";
}

export default function SettlementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = resolveTab(searchParams.get("tab"));

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    const resolved = resolveTab(tabParam);

    if (tabParam !== resolved) {
      router.replace(`?tab=${resolved}`);
    }
  }, [searchParams, router]);

  const handleTabChange = useCallback(
    (value: string) => {
      const tab = value as SettlementTabId;
      if (tab === activeTab) return;
      router.push(`?tab=${tab}`);
    },
    [activeTab, router]
  );

  const headerContent = useMemo(
    () => (
      <HeaderTabs
        value={activeTab}
        onChange={handleTabChange}
        tabs={[...SETTLEMENT_TABS]}
      />
    ),
    [activeTab, handleTabChange]
  );

  useSetHeaderContent(headerContent);

  return (
    <div className="space-y-4">
      {activeTab === "overview" && <SettlementDashboard />}
      {activeTab === "fx-inventory" && <FxInventoryView />}
    </div>
  );
}
