"use client";

import StatCard from "@/app/admin/_components/StatCard";
import { SiDocusaurus } from "react-icons/si";
import ReportsTable from "./ReportsTable";
import { useCbnFnStats } from "../../hooks/useCbnFnStats";

export default function CBNReportsPage() {
  const { stats, isLoading, isError } = useCbnFnStats();

  const DailyFxIcon = (
    <SiDocusaurus className="h-5 w-5 text-success-500" />
  );
  const FnWindowIcon = (
    <SiDocusaurus className="h-5 w-5 text-yellow-500" />
  );
  const ComplianceIcon = (
    <SiDocusaurus className="h-5 w-5 text-primary-500" />
  );

  return (
    <>
      <div className="w-full rounded-xl bg-white p-4">
        <div className="mb-4">
          <h3 className="text-base text-[#6C6969]">CBN FN Window reporting counters</h3>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`cbn-fn-stat-skeleton-${index}`}
                className="h-[86px] animate-pulse rounded-xl border border-gray-100 bg-gray-100"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <StatCard
              title="Daily FX Sales and Allocations"
              value={stats.dailyFxSalesAllocations.toLocaleString("en-US")}
              icon={DailyFxIcon}
              iconBg="bg-success-100"
            />
            <StatCard
              title="FN Window Daily Reports"
              value={stats.fnWindowDailyReports.toLocaleString("en-US")}
              icon={FnWindowIcon}
              iconBg="bg-warning-100"
            />
            <StatCard
              title="Active Compliance Reports"
              value={stats.activeComplianceReports.toLocaleString("en-US")}
              icon={ComplianceIcon}
              iconBg="bg-primary-100"
            />
          </div>
        )}
        {!isLoading && isError && (
          <p className="mt-3 text-sm text-red-600">
            Unable to load CBN FN report stats right now. Please refresh and try again.
          </p>
        )}
      </div>
      <ReportsTable />
    </>
  );
}