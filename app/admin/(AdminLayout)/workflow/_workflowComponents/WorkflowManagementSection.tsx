"use client";

import StatCard from "@/app/admin/_components/StatCard";
import { Workflow, CheckCircle, XCircle } from "lucide-react";
import WorkflowManagementTable from "./WorkflowManagementTable";
import { useWorkflowManagementStats } from "../hooks/useWorkflowManagementStats";

export default function WorkflowManagementSection() {
  const { stats, isLoading, isError } = useWorkflowManagementStats();

  const total = stats?.totalWorkflows ?? 0;
  const active = stats?.activeWorkflows ?? 0;
  const deactivated = stats?.deactivatedWorkflows ?? 0;

  return (
    <>
      {/* Stats Cards */}
      <div className="w-full rounded-xl bg-white p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="No. of Workflows"
            value={isLoading ? "--" : total}
            icon={<Workflow className="h-5 w-5 text-orange-600" />}
            iconBg="bg-orange-100"
          />
          <StatCard
            title="Active Workflows"
            value={isLoading ? "--" : active}
            icon={<CheckCircle className="h-5 w-5 text-green-600" />}
            iconBg="bg-green-100"
          />
          <StatCard
            title="Deactivated Workflows"
            value={isLoading ? "--" : deactivated}
            icon={<XCircle className="h-5 w-5 text-red-600" />}
            iconBg="bg-red-100"
          />
        </div>
        {isError ? (
          <p className="mt-3 text-xs text-red-600">
            Unable to load workflow management counters. Showing default values.
          </p>
        ) : null}
      </div>

      <WorkflowManagementTable />
    </>
  );
}
