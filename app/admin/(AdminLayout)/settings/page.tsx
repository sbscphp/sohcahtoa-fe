"use client";

import { useState, useMemo } from "react";
import { useSetHeaderContent } from "../../_hooks/useSetHeaderContent";
import { HeaderTabs } from "../../_components/HeaderTabs";
import PasswordTab from "./PasswordTab"
import AccountInformationTab from "./AccountInformationTab"
import NotificationSettingsTab from "./NotificationSettingsTab";

const SETTING_TABS = [
  { value: "account", label: "Account Information" },
  { value: "password", label: "Password" },
  { value: "workflow", label: "Workflow Configuration" },
  { value: "notifications", label: "Notification Settings" },
] as const;

export type TabId = (typeof SETTING_TABS)[number]["value"];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("account")

  const headerContent = useMemo(
    () => (
      <HeaderTabs
        value={activeTab}
        onChange={(v) => setActiveTab(v as TabId)}
        tabs={[...SETTING_TABS]}
      />
    ),
    [activeTab]
  );

  useSetHeaderContent(headerContent);

  return (
    <div className="space-y-4">
     
      {activeTab === "account" && <AccountInformationTab />}
          {activeTab === "password" && <PasswordTab />}
          {activeTab === "workflow" && (
            <div className="mx-auto w-full max-w-3xl py-8">
              <h2 className="text-xl font-semibold text-foreground">Workflow Configuration</h2>
              <p className="mt-1 text-sm text-foreground/50">
                Configure your workflow approval settings
              </p>
            </div>
          )}
          {activeTab === "notifications" && <NotificationSettingsTab />}
    </div>
  );}

