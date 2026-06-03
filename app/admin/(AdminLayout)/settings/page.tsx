"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAtomValue } from "jotai";
import { useSetHeaderContent } from "../../_hooks/useSetHeaderContent";
import { HeaderTabs } from "../../_components/HeaderTabs";
import PasswordTab from "./PasswordTab";
import AccountInformationTab from "./AccountInformationTab";
import NotificationSettingsTab from "./NotificationSettingsTab";
import { adminRoutes } from "@/lib/adminRoutes";
import PickUpStations from "./PickUpStations";
import RateManagementTab from "./RateManagementTab";
import WorkflowConfigurationTab from "./WorkflowConfigurationTab";
import { adminUserAtom } from "@/app/admin/_lib/atoms/admin-auth-atom";
import { hasModuleAccess } from "@/app/admin/_lib/permissions";
import type { UserPermission } from "@/app/admin/_lib/atoms/admin-auth-atom";

const BASE_SETTING_TABS = [
  { value: "account", label: "Account Information" },
  { value: "password", label: "Password" },
  { value: "notifications", label: "Notifications" },
  { value: "pickup-stations", label: "Pick-Up Stations" },
] as const;

const RATE_TAB = { value: "rates", label: "Rate Management" } as const;
const WORKFLOW_CONFIGURATION_TAB = {
  value: "workflow-configuration",
  label: "Workflow Configuration",
} as const;

export type TabId =
  | (typeof BASE_SETTING_TABS)[number]["value"]
  | "rates"
  | "workflow-configuration";

const EMPTY_USER_PERMISSIONS: UserPermission[] = [];

function resolveTab(param: string | null, validValues: string[]): TabId {
  if (param && validValues.includes(param)) return param as TabId;
  return "account";
}

export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const adminUser = useAtomValue(adminUserAtom);

  const userPermissions = adminUser?.userPermissions ?? EMPTY_USER_PERMISSIONS;
  const hasRateAccess = hasModuleAccess(userPermissions, "RATE");
  const hasWorkflowAccess = hasModuleAccess(userPermissions, "WORKFLOW");

  const visibleTabs = useMemo(
    () => [
      ...BASE_SETTING_TABS,
      ...(hasRateAccess ? [RATE_TAB] : []),
      ...(hasWorkflowAccess ? [WORKFLOW_CONFIGURATION_TAB] : []),
    ],
    [hasRateAccess, hasWorkflowAccess]
  );

  const validTabValues = useMemo(
    () => visibleTabs.map((t) => t.value) as string[],
    [visibleTabs]
  );

  const activeTab = resolveTab(searchParams.get("tab"), validTabValues);

  const lastPushedTab = useRef<string | null>(null);

  /* ── Sync URL → tab (handles external navigation / back-forward) ────── */
  useEffect(() => {
    const tabParam = searchParams.get("tab");

    if (tabParam === "workflow") {
      router.replace(adminRoutes.adminSettingsWorkflowConfiguration());
      return;
    }

    const resolved = resolveTab(tabParam, validTabValues);

    if (!tabParam) {
      router.replace(`?tab=${resolved}`);
      lastPushedTab.current = resolved;
    }
  }, [searchParams, router, validTabValues]);

  /* ── Tab click handler: tab → URL ──────────────────────────────────── */
  const handleTabChange = (value: string) => {
    const tab = value as TabId;

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
        tabs={visibleTabs}
      />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeTab, visibleTabs]
  );

  useSetHeaderContent(headerContent);

  /* ── Render ─────────────────────────────────────────────────────────── */
  return (
    <div className="space-y-4 my-5">
      {activeTab === "account" && <AccountInformationTab />}
      {activeTab === "password" && <PasswordTab />}
      {activeTab === "notifications" && <NotificationSettingsTab />}
      {activeTab === "pickup-stations" && <PickUpStations />}
      {activeTab === "rates" && hasRateAccess && <RateManagementTab />}
      {activeTab === "workflow-configuration" && hasWorkflowAccess && (
        <WorkflowConfigurationTab />
      )}
    </div>
  );
}
