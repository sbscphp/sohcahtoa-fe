"use client";

import { useCallback, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import EmptySection from "@/app/admin/_components/EmptySection";
import { HeaderTabs } from "@/app/admin/_components/HeaderTabs";
import LoadingState from "@/app/admin/_components/LoadingState";
import { useSetHeaderContent } from "@/app/admin/_hooks/useSetHeaderContent";
import { useAgentDetails } from "../../../agent/hooks/useAgentDetails";
import AgentFxInventoryDetail from "../../_outletComponents/AgentFxInventoryDetail";

const DETAIL_TABS = [
  { value: "overview", label: "Overview" },
  { value: "inventory-position", label: "Inventory Position" },
  { value: "transactions", label: "Transactions" },
  { value: "disbursement", label: "Disbursement" },
  { value: "lodgment", label: "Cash Lodgment" },
] as const;

type DetailTabId = (typeof DETAIL_TABS)[number]["value"];

const VALID_TABS = DETAIL_TABS.map((tab) => tab.value) as string[];

function resolveTab(param: string | null): DetailTabId {
  if (param && VALID_TABS.includes(param)) return param as DetailTabId;
  return "overview";
}

export default function AgentFxInventoryDetailPage() {
  const params = useParams<{ id: string }>();
  const agentId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { agent, isLoading, isNotFound } = useAgentDetails(agentId);
  const activeTab = resolveTab(searchParams.get("tab"));

  const handleTabChange = useCallback(
    (value: string) => {
      const tab = value as DetailTabId;
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
        tabs={[...DETAIL_TABS]}
      />
    ),
    [activeTab, handleTabChange]
  );

  useSetHeaderContent(headerContent);

  if (isLoading) {
    return <LoadingState />;
  }

  if (!agentId || !agent || isNotFound) {
    return (
      <EmptySection
        title="Agent Not Found"
        description="The requested agent could not be found or may have been removed."
      />
    );
  }

  return (
    <div className="mt-5">
      <AgentFxInventoryDetail agentId={agentId} tab={activeTab} />
    </div>
  );
}
