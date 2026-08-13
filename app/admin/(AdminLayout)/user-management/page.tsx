"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSetHeaderContent } from "../../_hooks/useSetHeaderContent";
import { HeaderTabs } from "../../_components/HeaderTabs";
import UserManagement from "./_userManagementComponents/users/UserManagement";
import Departments from "./_userManagementComponents/departments/Departments";
import UserRoles from "./_userManagementComponents/roles/UserRoles";

const USER_TABS = [
  { value: "user", label: "Users" },
  { value: "roles", label: "Roles" },
  { value: "department", label: "Departments" },
] as const;

export type UserTabValue = (typeof USER_TABS)[number]["value"];

const VALID_TAB_VALUES = USER_TABS.map((t) => t.value) as string[];

function resolveTab(param: string | null): UserTabValue {
  if (param && VALID_TAB_VALUES.includes(param)) return param as UserTabValue;
  return "user";
}

export default function UserManagementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = resolveTab(searchParams.get("tab"));
  const lastPushedTab = useRef<string | null>(null);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    const resolved = resolveTab(tabParam);

    if (!tabParam) {
      router.replace(`?tab=${resolved}`);
      lastPushedTab.current = resolved;
    }
  }, [searchParams, router]);

  const handleTabChange = useCallback(
    (value: string) => {
      const tab = value as UserTabValue;
      if (tab === activeTab) return;
      lastPushedTab.current = tab;
      router.push(`?tab=${tab}`);
    },
    [activeTab, router]
  );

  const headerContent = useMemo(
    () => (
      <HeaderTabs
        value={activeTab}
        onChange={handleTabChange}
        tabs={[...USER_TABS]}
      />
    ),
    [activeTab, handleTabChange]
  );

  useSetHeaderContent(headerContent);

  return (
    <div className="space-y-4">
      {activeTab === "user" && <UserManagement />}
      {activeTab === "roles" && <UserRoles />}
      {activeTab === "department" && <Departments />}
    </div>
  );
}
