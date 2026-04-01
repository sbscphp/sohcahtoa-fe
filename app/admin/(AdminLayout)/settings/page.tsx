"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSetHeaderContent } from "../../_hooks/useSetHeaderContent";
import { HeaderTabs } from "../../_components/HeaderTabs";
// import EmptyState from "../../_components/EmptyState";
import PasswordTab from "./PasswordTab";
import AccountInformationTab from "./AccountInformationTab";
import NotificationSettingsTab from "./NotificationSettingsTab";
import { adminRoutes } from "@/lib/adminRoutes";
import PickUpStations from "./PickUpStations";

const SETTING_TABS = [
  { value: "account", label: "Account Information" },
  { value: "password", label: "Password" },
  // { value: "workflow", label: "Workflow Configuration" },
  { value: "notifications", label: "Notifications" },
  { value: "pickup-stations", label: "Pick-Up Stations" },
] as const;

export type TabId = (typeof SETTING_TABS)[number]["value"];

export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabId>(() => {
    const tabParam = searchParams.get("tab");

    if (!tabParam) return "account";

    const isValidTab = SETTING_TABS.some((t) => t.value === tabParam);
    if (!isValidTab) return "account";

    return tabParam as TabId;
  });

  const didInitRedirectRef = useRef(false);

  useEffect(() => {
    // Only check on first load; subsequent query param changes should not override user state.
    if (didInitRedirectRef.current) return;
    didInitRedirectRef.current = true;

    const tabParam = searchParams.get("tab");
    if (tabParam === "workflow") {
      router.push(adminRoutes.adminWorkflowDetails("item.id"));
    }
  }, [searchParams, router]);

  const headerContent = useMemo(
    () => (
      <HeaderTabs
        value={activeTab}
        onChange={(v) => {
          const tab = v as TabId;

          // if (tab === "workflow") {
          //   router.push(adminRoutes.adminWorkflowDetails("item.id"));
          //   return; // ❗ prevent tab switch
          // }

          setActiveTab(tab);
        }}
        tabs={[...SETTING_TABS]}
      />
    ),
    [activeTab]
  );

  useSetHeaderContent(headerContent);

  return (
    <div className="space-y-4 my-5">
      {activeTab === "account" && <AccountInformationTab />}
      {activeTab === "password" && <PasswordTab />}
      {/* {activeTab === "workflow" && (
        <EmptyState
          title="Workflow Configuration"
          description="Redirecting you to workflow configuration."
          buttonText="Open workflow"
          onClick={() => router.push(adminRoutes.adminWorkflowDetails("item.id"))}
        />
      )} */}
      {activeTab === "notifications" && <NotificationSettingsTab />}
      {activeTab === "pickup-stations" && <PickUpStations />}
    </div>
  );
}
