"use client";

import { useMemo } from "react";
import StatCard from "@/app/admin/_components/StatCard";
import { Workflow, CheckCircle, XCircle } from "lucide-react";
import WorkflowManagementTable, { WORKFLOW_DATA } from "./WorkflowManagementTable";

export default function WorkflowManagementSection() {
  const stats = useMemo(() => {
    const total = WORKFLOW_DATA.length;
    const active = WORKFLOW_DATA.filter((w) => w.status === "Active").length;
    const deactivated = WORKFLOW_DATA.filter((w) => w.status === "Deactivated").length;
    return { total, active, deactivated };
  }, []);

  return (
    <>
      {/* Stats Cards */}
      <div className="w-full rounded-xl bg-white p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="No. of Workflows"
            value={stats.total}
            icon={<Workflow className="h-5 w-5 text-orange-600" />}
            iconBg="bg-orange-100"
          />
          <StatCard
            title="Active Workflows"
            value={stats.active}
            icon={<CheckCircle className="h-5 w-5 text-green-600" />}
            iconBg="bg-green-100"
          />
          <StatCard
            title="Deactivated Workflows"
            value={stats.deactivated}
            icon={<XCircle className="h-5 w-5 text-red-600" />}
            iconBg="bg-red-100"
          />
        </div>
      </div>

      <WorkflowManagementTable />
    </>
  );
}
