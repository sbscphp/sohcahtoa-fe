"use client";

import { Skeleton, Text } from "@mantine/core";
import { DetailItem } from "@/app/admin/_components/DetailItem";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { useAgentDetails } from "../../../agent/hooks/useAgentDetails";

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatTime(iso?: string | null) {
  if (!iso) return "—";
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export default function OverviewTab({ agentId }: { agentId: string }) {
  const { agent, isLoading } = useAgentDetails(agentId);
  const createdAt = agent?.createdAt;

  return (
    <section className="rounded-xl bg-white p-6">
      <div className="flex flex-wrap items-center gap-3">
        {isLoading ? (
          <Skeleton height={28} width={220} />
        ) : (
          <h2 className="text-xl font-semibold text-gray-900">{agent?.name?.trim() || "—"}</h2>
        )}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        {isLoading ? (
          <Skeleton height={16} width={260} />
        ) : (
          <>
            <Text size="sm" c="dimmed">
              Date Created: {formatDate(createdAt)} | {formatTime(createdAt)}
            </Text>
            <StatusBadge status={agent?.status?.trim() || "—"} />
          </>
        )}
      </div>
      <div className="my-5 border-t border-gray-100" />
      <p className="mb-4 text-sm font-semibold text-primary-400">Agent Details</p>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <DetailItem label="Agent ID" value={agent?.id || "—"} loading={isLoading} />
        <DetailItem label="Email Address" value={agent?.email?.trim() || "—"} loading={isLoading} />
        <DetailItem
          label="Phone Number"
          value={agent?.phoneNumber?.trim() || "—"}
          loading={isLoading}
        />
        <DetailItem label="Branch" value={agent?.branch?.name?.trim() || "—"} loading={isLoading} />
      </div>
    </section>
  );
}
