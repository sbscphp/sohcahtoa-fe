"use client";

import { useState, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSetHeaderContent } from "../../_hooks/useSetHeaderContent";
import { HeaderTabs } from "../../_components/HeaderTabs";
import WorkflowActionSection from "./_workflowComponents/WorkflowActionSection";
import WorkflowManagementSection from "./_workflowComponents/WorkflowManagementSection";

const WORKFLOW_TABS = [
  { value: "workflow-action", label: "Workflow Action" },
  { value: "workflow-management", label: "Workflow Management" },
] as const;

type WorkflowTabValue = (typeof WORKFLOW_TABS)[number]["value"];

export default function WorkflowPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Initialize active tab from query param on mount only (lazy initialization)
  const [activeTab, setActiveTab] = useState<WorkflowTabValue>(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl && WORKFLOW_TABS.some((tab) => tab.value === tabFromUrl)) {
      return tabFromUrl as WorkflowTabValue;
    }
    return "workflow-action";
  });

  const handleTabChange = useCallback((value: string) => {
    const newTab = value as WorkflowTabValue;
    setActiveTab(newTab);
    
    // Update query param
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", newTab);
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [searchParams, router]);

  const headerContent = useMemo(
    () => (
      <HeaderTabs
        value={activeTab}
        onChange={handleTabChange}
        tabs={[...WORKFLOW_TABS]}
      />
    ),
    [activeTab, handleTabChange]
  );

  useSetHeaderContent(headerContent);

  return (
    <div className="space-y-4">
      {activeTab === "workflow-action" ? (
        <WorkflowActionSection />
      ) : (
        <WorkflowManagementSection />
      )}
    </div>
  );
}
