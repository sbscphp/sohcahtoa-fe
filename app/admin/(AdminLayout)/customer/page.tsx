import StatCard from "../../_components/StatCard";
import CustomerTable from "./_customerComponents/CustomerTable";
import { HiMiniUserGroup } from "react-icons/hi2";

export default function CustomerPage() {
  const ActiveUsersIcon = (
    <HiMiniUserGroup className="h-5 w-5 text-green-600" />
  );
  const DeactivatedUsersIcon = (
    <HiMiniUserGroup className="h-5 w-5 text-pink-600" />
  );

  return (
    <>
      <div className="w-full rounded-xl bg-white p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatCard
            title="Active Users"
            value={100}
            icon={ActiveUsersIcon}
            iconBg="bg-green-100"
          />

          <StatCard
            title="Deactivated Users"
            value={11}
            icon={DeactivatedUsersIcon}
            iconBg="bg-[#FFE4E8]"
          />
        </div>
      </div>

      <CustomerTable />
    </>
  );
}