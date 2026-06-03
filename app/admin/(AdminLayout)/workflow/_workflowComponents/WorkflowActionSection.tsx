"use client";

import { Skeleton } from "@mantine/core";
import StatCard from "@/app/admin/_components/StatCard";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import WorkflowActionTable from "./WorkflowActionTable";
import { useWorkflowActionStats } from "../hooks/useWorkflowActionStats";

export default function WorkflowActionSection() {
  const { stats, isLoading: isStatsLoading } = useWorkflowActionStats();
  const isStatsEmpty = !isStatsLoading && !stats;

  return (
    <>
      <div className="w-full rounded-xl bg-white p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isStatsLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} height={90} radius="md" />
            ))
          ) : (
            <>
              <StatCard
                title="Pending Actions"
                value={stats?.pending ?? 0}
                icon={<AlertCircle className="h-5 w-5 text-orange-600" />}
                iconBg="bg-orange-100"
                isEmpty={isStatsEmpty}
              />
              <StatCard
                title="Completed Actions"
                value={stats?.completed ?? 0}
                icon={<CheckCircle className="h-5 w-5 text-green-600" />}
                iconBg="bg-green-100"
                isEmpty={isStatsEmpty}
              />
              <StatCard
                title="Rejected Actions"
                value={stats?.rejected ?? 0}
                icon={<XCircle className="h-5 w-5 text-red-600" />}
                iconBg="bg-red-100"
                isEmpty={isStatsEmpty}
              />
            </>
          )}
        </div>
      </div>

      <WorkflowActionTable />
    </>
  );
}
