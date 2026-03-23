"use client";

import StatCard from "@/app/admin/_components/StatCard";
import { SiDocusaurus } from "react-icons/si";
import ComplianceInsights from "./ComplianceInsights";
import ComplianceTable from "./ComplianceTable";
import { useComplianceDashboard } from "../../hooks/useComplianceDashboard";

export default function OverviewPage() {
  const { dashboard, isLoading } = useComplianceDashboard();

  const SubmittedIcon = (
    <SiDocusaurus className="h-5 w-5 text-success-500" />
  );
  const PendingIcon = (
    <SiDocusaurus className="h-5 w-5 text-yellow-500" />
  );
  const FailedIcon = (
    <SiDocusaurus className="h-5 w-5 text-rose-500" />
  );
  const RejectedIcon = (
    <SiDocusaurus className="h-5 w-5 text-error-500" />
  );
  const overview = dashboard.overview;

  const statValue = (value: number) => (isLoading ? "--" : value.toLocaleString("en-US"));

  return (
    <>
      <div className="w-full rounded-xl bg-white p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <StatCard
            title="Submitted Reports"
            value={statValue(overview.submittedReports)}
            icon={SubmittedIcon}
            iconBg="bg-success-100"
          />

          <StatCard
            title="Pending Submissions"
            value={statValue(overview.pendingSubmissions)}
            icon={PendingIcon}
            iconBg="bg-warning-100"
          />

          <StatCard
            title="Failed Submissions"
            value={statValue(overview.failedSubmissions)}
            icon={FailedIcon}
            iconBg="bg-rose-100"
          />

          <StatCard
            title="Rejected Reports"
            value={statValue(overview.rejectedReports)}
            icon={RejectedIcon}
            iconBg="bg-error-100"
          />
        </div>
      </div>
      <ComplianceInsights insights={dashboard.insights} loading={isLoading} />
      <ComplianceTable />
      
    </>
  );
}