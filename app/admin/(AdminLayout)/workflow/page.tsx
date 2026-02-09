"use client";

import { useState, useMemo } from "react";
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
  const [activeTab, setActiveTab] = useState<WorkflowTabValue>("workflow-action");

  const headerContent = useMemo(
    () => (
      <HeaderTabs
        value={activeTab}
        onChange={(v) => setActiveTab(v as WorkflowTabValue)}
        tabs={[...WORKFLOW_TABS]}
      />
    ),
    [activeTab]
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
