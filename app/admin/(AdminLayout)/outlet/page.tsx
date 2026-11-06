"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSetHeaderContent } from "../../_hooks/useSetHeaderContent";
import { HeaderTabs } from "../../_components/HeaderTabs";
// import FranchiseSection from "./_outletComponents/FranchiseSection";
import BranchSection from "./_outletComponents/BranchSection";
import AgentFxInventorySection from "./_outletComponents/AgentFxInventorySection";

const OUTLET_TABS = [
  // { value: "franchise", label: "Franchise" },
  { value: "branches", label: "Branches" },
  { value: "agent-fx-inventory", label: "Agent FX Inventory" },
] as const;

export type OutletTabId = (typeof OUTLET_TABS)[number]["value"];

const VALID_TAB_VALUES = OUTLET_TABS.map((tab) => tab.value) as string[];

function resolveTab(param: string | null): OutletTabId {
  if (param && VALID_TAB_VALUES.includes(param)) return param as OutletTabId;
  return "branches";
}

export default function OutletPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = resolveTab(searchParams.get("tab"));

  const handleTabChange = useCallback(
    (value: string) => {
      const tab = value as OutletTabId;
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
        tabs={[...OUTLET_TABS]}
      />
    ),
    [activeTab, handleTabChange]
  );

  useSetHeaderContent(headerContent);

  return (
    <div className="space-y-4 mt-5">
      {/* {activeTab === "franchise" ? <FranchiseSection /> : <BranchSection />} */}
      {activeTab === "branches" && <BranchSection />}
      {activeTab === "agent-fx-inventory" && <AgentFxInventorySection />}
    </div>
  );
}
