"use client";
import { Tabs } from "@mantine/core";
import OverviewPage from "./_components/overview/page";
import SubmissionPage from "./_components/submission/page";
import CBNReportsPage from "./_components/reports/page";
import AuditRegulatoryPage from "./_components/audit/page";


export default function UserManagementPage() {
  return (
    <>
      <Tabs color="orange" defaultValue="users">
        <Tabs.List className="mb-3">
          <Tabs.Tab value="users">Overview</Tabs.Tab>
          <Tabs.Tab value="roles">TRMS Submissions</Tabs.Tab>
          <Tabs.Tab value="departments">FX winow and CBN reporting</Tabs.Tab>
          <Tabs.Tab value="audit">Audit and regulatory logs</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="users">
          <OverviewPage />
        </Tabs.Panel>

        <Tabs.Panel value="roles"><SubmissionPage /></Tabs.Panel>

        <Tabs.Panel value="departments"><CBNReportsPage /></Tabs.Panel>
        <Tabs.Panel value="audit"><AuditRegulatoryPage /></Tabs.Panel>
      </Tabs>
    </>
  );
}

