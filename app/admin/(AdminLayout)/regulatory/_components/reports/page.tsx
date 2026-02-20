

import StatCard from "@/app/admin/_components/StatCard";
import { SiDocusaurus } from "react-icons/si";
import ReportsTable from "./ReportsTable";

export default function CBNReportsPage() {
  const SubmittedIcon = (
    <SiDocusaurus className="h-5 w-5 text-success-500" />
  );
  const PendingIcon = (
    <SiDocusaurus className="h-5 w-5 text-yellow-500" />
  );
  const FailedIcon = (
    <SiDocusaurus className="h-5 w-5 text-success-500" />
  );
  const RejectedIcon = (
    <SiDocusaurus className="h-5 w-5 text-yellow-500" />
  );

  return (
    <>
      <div className="w-full rounded-xl bg-white p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="border-[1.5px] border-gray-100 rounded-2xl shadow-xs shadow-[#1018280D] p-4">
            <h3 className="text-base text-[#6C6969] mb-4">Daily FX sales and alloctions</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <StatCard
            title="Successful Reports"
            value="7"
            icon={SubmittedIcon}
            iconBg="bg-success-100"
          />

          <StatCard
            title="Pending Reports"
            value="24"
            icon={PendingIcon}
            iconBg="bg-warning-100"
          />
          </div>
          </div>
          <div className="border-[1.5px] border-gray-100 rounded-2xl shadow-xs shadow-[#1018280D] p-4">
            <h3 className="text-base text-[#6C6969] mb-4">Reports generated this month</h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <StatCard
            title="Successful Reports"
            value="4"
            icon={FailedIcon}
            iconBg="bg-success-100"
          />

          <StatCard
            title="Pending Reports"
            value="7"
            icon={RejectedIcon}
            iconBg="bg-warning-100"
          /></div>
          </div>
        </div>
      </div>
      <ReportsTable />
      
    </>
  );
}