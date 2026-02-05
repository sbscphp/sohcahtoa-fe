"use client";
import { Tabs } from "@mantine/core";
import  UserManagement  from "./UserManagement";
import DepartmentPage from "./_departments/page";
import UserRoles from "./role/UserRoles";

export default function UserManagementPage() {
  return (
    <>
      <Tabs color="orange" defaultValue="users">
        <Tabs.List className="mb-3">
          <Tabs.Tab value="users">Users</Tabs.Tab>
          <Tabs.Tab value="roles">Roles</Tabs.Tab>
          <Tabs.Tab value="departments">Departments</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="users">
          <UserManagement />
        </Tabs.Panel>

        <Tabs.Panel value="roles"><UserRoles /></Tabs.Panel>

        <Tabs.Panel value="departments"><DepartmentPage /></Tabs.Panel>
      </Tabs>
    </>
  );
}
