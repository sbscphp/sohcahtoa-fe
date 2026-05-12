"use client";
import { Tabs } from "@mantine/core";
import AdminTabButton from "@/app/admin/_components/AdminTabButton";
import RegulatoryLogTable from "./RegulatoryTable";
import AuditLogTable from "./AuditTable";


export default function AuditRegulatoryPage() {
  return (
    <div className="my-5 p-5 rounded-lg bg-white">
      <Tabs color="orange" defaultValue="audit">
        <Tabs.List className="mb-4 border-0! before:content-none!">
          <AdminTabButton value="audit">Audit Logs</AdminTabButton>
          <AdminTabButton value="regulatory">Regulatory Logs</AdminTabButton>
        </Tabs.List>

        <Tabs.Panel value="audit">
          <AuditLogTable />
        </Tabs.Panel>

        <Tabs.Panel value="regulatory"><RegulatoryLogTable /></Tabs.Panel>
      </Tabs>
    </div>
  );
}

