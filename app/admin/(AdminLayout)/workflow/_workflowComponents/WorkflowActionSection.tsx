"use client";

import StatCard from "@/app/admin/_components/StatCard";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import WorkflowActionTable from "./WorkflowActionTable";
import { useWorkflowActionStats } from "../hooks/useWorkflowActionStats";

export default function WorkflowActionSection() {
  const { stats, isLoading, isError } = useWorkflowActionStats();

  const pending = stats?.pending ?? 0;
  const completed = stats?.completed ?? 0;
  const rejected = stats?.rejected ?? 0;

  return (
    <>
      {/* Stats Cards */}
      <div className="w-full rounded-xl bg-white p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Pending Actions"
            value={isLoading ? "--" : pending}
            icon={<AlertCircle className="h-5 w-5 text-orange-600" />}
            iconBg="bg-orange-100"
          />
          <StatCard
            title="Completed Actions"
            value={isLoading ? "--" : completed}
            icon={<CheckCircle className="h-5 w-5 text-green-600" />}
            iconBg="bg-green-100"
          />
          <StatCard
            title="Rejected Actions"
            value={isLoading ? "--" : rejected}
            icon={<XCircle className="h-5 w-5 text-red-600" />}
            iconBg="bg-red-100"
          />
        </div>
        {isError ? (
          <p className="mt-3 text-xs text-red-600">
            Unable to load workflow overview counters. Showing default values.
          </p>
        ) : null}
      </div>

      <WorkflowActionTable />
    </>
  );
}
