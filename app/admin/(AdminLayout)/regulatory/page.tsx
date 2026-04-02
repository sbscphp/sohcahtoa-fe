


"use client";

import { useState, useMemo } from "react"
import OverviewPage from "./_components/overview/page";
import SubmissionPage from "./_components/submission/page";
import CBNReportsPage from "./_components/reports/page";
import AuditRegulatoryPage from "./_components/audit/page";
import { HeaderTabs } from "../../_components/HeaderTabs";
import { useSetHeaderContent } from "../../_hooks/useSetHeaderContent";

export const REGULATORY_TABS = [
  { value: "overview", label: "Overview" },
  { value: "submission", label: "TRMS Submissions" },
  { value: "reporting", label: "FX window and CBN reporting" },
  { value: "audit", label: "Audit and regulatory logs" },
] as const;

export type RegulatoryTabValue = (typeof REGULATORY_TABS)[number]["value"];

export default function UserManagementPage() {
  const [activeTab, setActiveTab] = useState<RegulatoryTabValue>("overview");

  const headerContent = useMemo(
    () => (
      <HeaderTabs
        value={activeTab}
        onChange={(v) => setActiveTab(v as RegulatoryTabValue)}
        tabs={[...REGULATORY_TABS]}
      />
    ),
    [activeTab]
  );

  useSetHeaderContent(headerContent);

  return (
    <div>
      {activeTab === "overview" && <OverviewPage />}
      {activeTab === "submission" && <SubmissionPage />}
      {activeTab === "reporting" && <CBNReportsPage />}
      {activeTab === "audit" && <AuditRegulatoryPage />}
    </div>
  );
}

