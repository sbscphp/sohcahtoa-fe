

import StatCard from "@/app/admin/_components/StatCard";
import { SiDocusaurus } from "react-icons/si";
import SubmissionTable from "./SubmissionTable";

export default function SubmissionPage() {
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

  return (
    <>
      <div className="w-full rounded-xl bg-white p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <StatCard
            title="Submitted Reports"
            value="162"
            icon={SubmittedIcon}
            iconBg="bg-success-100"
          />

          <StatCard
            title="Pending Submissions"
            value="24"
            icon={PendingIcon}
            iconBg="bg-warning-100"
          />

          <StatCard
            title="Failed Submissions"
            value="4"
            icon={FailedIcon}
            iconBg="bg-rose-100"
          />

          <StatCard
            title="Rejected Reports"
            value="7"
            icon={RejectedIcon}
            iconBg="bg-error-100"
          />
        </div>
      </div>
      <SubmissionTable />
      
    </>
  );
}