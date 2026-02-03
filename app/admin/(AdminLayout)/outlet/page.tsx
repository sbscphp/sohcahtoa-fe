"use client";

import { useState, useMemo } from "react";
import { useSetHeaderContent } from "../../_hooks/useSetHeaderContent";
import { HeaderTabs } from "../../_components/HeaderTabs";
import FranchiseSection from "./_outletComponents/FranchiseSection";
import BranchSection from "./_outletComponents/BranchSection";

const OUTLET_TABS = [
  { value: "franchise", label: "Franchise" },
  { value: "branches", label: "Branches" },
] as const;

export default function OutletPage() {
  const [activeTab, setActiveTab] = useState<"franchise" | "branches">("franchise");

  const headerContent = useMemo(
    () => (
      <HeaderTabs
        value={activeTab}
        onChange={(v) => setActiveTab(v as "franchise" | "branches")}
        tabs={[...OUTLET_TABS]}
      />
    ),
    [activeTab]
  );

  useSetHeaderContent(headerContent);

  return (
    <div className="space-y-4">
      {activeTab === "franchise" ? <FranchiseSection /> : <BranchSection />}
    </div>
  );
}
