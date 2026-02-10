"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSetHeaderContent } from "../../_hooks/useSetHeaderContent";
import { HeaderTabs } from "../../_components/HeaderTabs";
import PasswordTab from "./PasswordTab";
import AccountInformationTab from "./AccountInformationTab";
import NotificationSettingsTab from "./NotificationSettingsTab";
import { adminRoutes } from "@/lib/adminRoutes";

const SETTING_TABS = [
  { value: "account", label: "Account Information" },
  { value: "password", label: "Password" },
  { value: "workflow", label: "Workflow Configuration" },
  { value: "notifications", label: "Notification Settings" },
] as const;

export type TabId = (typeof SETTING_TABS)[number]["value"];

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("account");

  const headerContent = useMemo(
    () => (
      <HeaderTabs
        value={activeTab}
        onChange={(v) => {
          const tab = v as TabId;

          if (tab === "workflow") {
            router.push(adminRoutes.adminWorkflowDetails("item.id"));
            return; // ❗ prevent tab switch
          }

          setActiveTab(tab);
        }}
        tabs={[...SETTING_TABS]}
      />
    ),
    [activeTab, router]
  );

  useSetHeaderContent(headerContent);

  return (
    <div className="space-y-4">
      {activeTab === "account" && <AccountInformationTab />}
      {activeTab === "password" && <PasswordTab />}
      {activeTab === "notifications" && <NotificationSettingsTab />}
    </div>
  );
}
