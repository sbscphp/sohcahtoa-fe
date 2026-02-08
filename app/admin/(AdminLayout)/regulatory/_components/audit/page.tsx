"use client";
import { Tabs } from "@mantine/core";
import RegulatoryLogTable from "./RegulatoryTable";
import AuditLogTable from "./AuditTable";


export default function AuditRegulatoryPage() {
  return (
    <>
      <Tabs color="orange" defaultValue="audit">
        <Tabs.List className="mb-3">
          <Tabs.Tab value="audit">Audit Logs</Tabs.Tab>
          <Tabs.Tab value="regulatory">Regulatory Logs</Tabs.Tab>
          
        </Tabs.List>

        <Tabs.Panel value="audit">
          <AuditLogTable />
        </Tabs.Panel>

        <Tabs.Panel value="regulatory"><RegulatoryLogTable /></Tabs.Panel>
      </Tabs>
    </>
  );
}

