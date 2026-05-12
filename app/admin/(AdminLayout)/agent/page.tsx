"use client";

import { Skeleton } from "@mantine/core";
import StatCard from "../../_components/StatCard";
import AgentTable from "./_agentComponents/AgentTable";
import { Users, UserCheck2, UserX2, Clock3 } from "lucide-react";
import { useAgentStats } from "./hooks/useAgentStats";

export default function AgentPage() {
  const { stats, isLoading } = useAgentStats();

  const totalAgentsIcon = <Users className="h-5 w-5 text-orange-600" />;
  const activeAgentsIcon = <UserCheck2 className="h-5 w-5 text-green-600" />;
  const deactivatedAgentsIcon = <UserX2 className="h-5 w-5 text-pink-600" />;
  const pendingApprovalIcon = <Clock3 className="h-5 w-5 text-purple-600" />;
  const isStatsEmpty = !isLoading && !stats;

  return (
    <>
      <div className="w-full rounded-xl bg-white p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            <>
              <Skeleton height={100} radius="md" />
              <Skeleton height={100} radius="md" />
              <Skeleton height={100} radius="md" />
              <Skeleton height={100} radius="md" />
            </>
          ) : (
            <>
              <StatCard
                title="No. of Agents"
                value={stats?.total ?? 0}
                icon={totalAgentsIcon}
                iconBg="bg-orange-100"
                isEmpty={isStatsEmpty}
              />

              <StatCard
                title="Active Agents"
                value={stats?.activeAgents ?? 0}
                icon={activeAgentsIcon}
                iconBg="bg-green-100"
                isEmpty={isStatsEmpty}
              />

              <StatCard
                title="Deactivated Agents"
                value={stats?.deactivatedAgents ?? 0}
                icon={deactivatedAgentsIcon}
                iconBg="bg-[#FFE4E8]"
                isEmpty={isStatsEmpty}
              />

              <StatCard
                title="Pending Approval"
                value={stats?.pendingApproval ?? 0}
                icon={pendingApprovalIcon}
                iconBg="bg-[#EBE9FE]"
                isEmpty={isStatsEmpty}
              />
            </>
          )}
        </div>
      </div>

      <AgentTable />
    </>
  );
}