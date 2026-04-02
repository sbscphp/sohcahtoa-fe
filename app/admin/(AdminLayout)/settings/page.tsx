"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSetHeaderContent } from "../../_hooks/useSetHeaderContent";
import { HeaderTabs } from "../../_components/HeaderTabs";
import PasswordTab from "./PasswordTab";
import AccountInformationTab from "./AccountInformationTab";
import NotificationSettingsTab from "./NotificationSettingsTab";
import { adminRoutes } from "@/lib/adminRoutes";
import PickUpStations from "./PickUpStations";

const SETTING_TABS = [
  { value: "account", label: "Account Information" },
  { value: "password", label: "Password" },
  { value: "notifications", label: "Notifications" },
  { value: "pickup-stations", label: "Pick-Up Stations" },
] as const;

export type TabId = (typeof SETTING_TABS)[number]["value"];

const VALID_TAB_VALUES = SETTING_TABS.map((t) => t.value) as string[];

function resolveTab(param: string | null): TabId {
  if (param && VALID_TAB_VALUES.includes(param)) return param as TabId;
  return "account";
}

export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Derive the active tab directly from the URL — single source of truth.
  const activeTab = resolveTab(searchParams.get("tab"));

  // Track the last tab we pushed to the URL ourselves so we can
  // skip the redundant URL update when the effect re-runs after our own push.
  const lastPushedTab = useRef<string | null>(null);

  /* ── Sync URL → tab (handles external navigation / back-forward) ────── */
  useEffect(() => {
    const tabParam = searchParams.get("tab");

    // Special-case: redirect legacy "workflow" param.
    if (tabParam === "workflow") {
      router.replace(adminRoutes.adminWorkflowDetails("item.id"));
      return;
    }

    const resolved = resolveTab(tabParam);

    // If the URL has no tab param yet, initialise it (replace so it doesn't
    // create an extra history entry).
    if (!tabParam) {
      router.replace(`?tab=${resolved}`);
      lastPushedTab.current = resolved;
    }
  }, [searchParams, router]);

  /* ── Tab click handler: tab → URL ──────────────────────────────────── */
  const handleTabChange = (value: string) => {
    const tab = value as TabId;

    // Skip if we're already on this tab (prevents redundant history entries).
    if (tab === activeTab) return;

    lastPushedTab.current = tab;
    router.push(`?tab=${tab}`);
  };

  /* ── Header ─────────────────────────────────────────────────────────── */
  const headerContent = useMemo(
    () => (
      <HeaderTabs
        value={activeTab}
        onChange={handleTabChange}
        tabs={[...SETTING_TABS]}
      />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeTab]
  );

  useSetHeaderContent(headerContent);

  /* ── Render ─────────────────────────────────────────────────────────── */
  return (
    <div className="space-y-4 my-5">
      {activeTab === "account" && <AccountInformationTab />}
      {activeTab === "password" && <PasswordTab />}
      {activeTab === "notifications" && <NotificationSettingsTab />}
      {activeTab === "pickup-stations" && <PickUpStations />}
    </div>
  );
}