"use client";

import { useCallback, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import EmptySection from "@/app/admin/_components/EmptySection";
import { HeaderTabs } from "@/app/admin/_components/HeaderTabs";
import { useSetHeaderContent } from "@/app/admin/_hooks/useSetHeaderContent";
import { getAgentFxInventoryDetail } from "../../_data/agentFxInventoryMock";
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
  const detail = getAgentFxInventoryDetail(params?.id ?? "");

  if (!detail) {
    return (
      <EmptySection
        format="secondary"
        title="Agent not found"
        description="This agent is not in the current FX inventory list."
      />
    );
  }

  return <AgentFxInventoryDetailScreen key={detail.id} detailId={detail.id} />;
}

function AgentFxInventoryDetailScreen({ detailId }: { detailId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const detail = getAgentFxInventoryDetail(detailId);
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

  if (!detail) return null;

  return <div className="mt-5">
    <AgentFxInventoryDetail detail={detail} tab={activeTab} />
  </div>;
}
