"use client";

import { Text } from "@mantine/core";
import { DetailItem } from "@/app/admin/_components/DetailItem";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import type { AgentFxInventoryDetail } from "../../_data/agentFxInventoryMock";

export default function OverviewTab({ detail }: { detail: AgentFxInventoryDetail }) {
  return (
    <section className="rounded-xl bg-white p-6">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-xl font-semibold text-gray-900">{detail.agentName}</h2>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <Text size="sm" c="dimmed">
          Date Created: {detail.dateCreated} | {detail.timeCreated}
        </Text>
        <StatusBadge status={detail.status} />
      </div>
      <div className="my-5 border-t border-gray-100" />
      <p className="mb-4 text-sm font-semibold text-primary-400">Agent Details</p>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <DetailItem label="Agent ID" value={detail.agentId} />
        <DetailItem label="Email Address" value={detail.email} />
        <DetailItem label="Phone Number" value={detail.phone} />
        <DetailItem label="Branch" value={detail.branch} />
      </div>
    </section>
  );
}
