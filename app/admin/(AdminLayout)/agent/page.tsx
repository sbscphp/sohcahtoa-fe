import StatCard from "../../_components/StatCard";
import AgentTable from "./_agentComponents/AgentTable";
import { Users, UserCheck2, UserX2, Clock3 } from "lucide-react";

export default function AgentPage() {
  const totalAgentsIcon = <Users className="h-5 w-5 text-orange-600" />;
  const activeAgentsIcon = <UserCheck2 className="h-5 w-5 text-green-600" />;
  const deactivatedAgentsIcon = <UserX2 className="h-5 w-5 text-pink-600" />;
  const pendingApprovalIcon = <Clock3 className="h-5 w-5 text-purple-600" />;

  return (
    <>
      <div className="w-full rounded-xl bg-white p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="No. of Agents"
            value={15}
            icon={totalAgentsIcon}
            iconBg="bg-orange-100"
          />

          <StatCard
            title="Active Agents"
            value={10}
            icon={activeAgentsIcon}
            iconBg="bg-green-100"
          />

          <StatCard
            title="Deactivated Agents"
            value={5}
            icon={deactivatedAgentsIcon}
            iconBg="bg-[#FFE4E8]"
          />

          <StatCard
            title="Pending Approval"
            value={5}
            icon={pendingApprovalIcon}
            iconBg="bg-[#EBE9FE]"
          />
        </div>
      </div>

      <AgentTable />
    </>
  );
}