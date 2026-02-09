

"use client";

import { useState, useMemo } from "react";
import { useSetHeaderContent } from "../../_hooks/useSetHeaderContent";
import { HeaderTabs } from "../../_components/HeaderTabs";
import  UserManagement  from "./UserManagement";
import DepartmentPage from "./_departments/page";
import UserRoles from "./role/UserRoles";

const USER_TABS = [
  { value: "user", label: "Users" },
  { value: "roles", label: "Roles" },
  { value: "department", label: "Departments" },
] as const;

export type UserTabValue = (typeof USER_TABS)[number]["value"];

export default function UserManagementPage() {
  const [activeTab, setActiveTab] = useState<UserTabValue>("user");

  const headerContent = useMemo(
    () => (
      <HeaderTabs
        value={activeTab}
        onChange={(v) => setActiveTab(v as UserTabValue)}
        tabs={[...USER_TABS]}
      />
    ),
    [activeTab]
  );

  useSetHeaderContent(headerContent);

  return (
    <div className="space-y-4">
     
      {activeTab === "user" && <UserManagement />}
      {activeTab === "roles" && <UserRoles />}
      {activeTab === "department" && <DepartmentPage />}
    </div>
  );}

