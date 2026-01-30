import StatCard from "../../_components/StatCard";
import CustomerTable from "./_customerComponents/CustomerTable";
import { HiMiniUserGroup } from "react-icons/hi2";

export default function CustomerPage() {
  const TotalCustomersIcon = (
    <HiMiniUserGroup className="h-5 w-5 text-orange-500" />
  );
  const ActiveCustomersIcon = (
    <HiMiniUserGroup className="h-5 w-5 text-green-600" />
  );
  const DeactivatedCustomersIcon = (
    <HiMiniUserGroup className="h-5 w-5 text-pink-600" />
  );

  return (
    <>
      <div className="w-full rounded-xl bg-white p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard
            title="No of Customers"
            value="2,902"
            icon={TotalCustomersIcon}
            iconBg="bg-orange-100"
          />

          <StatCard
            title="Active Customer"
            value="2,702"
            icon={ActiveCustomersIcon}
            iconBg="bg-green-100"
          />

          <StatCard
            title="Deactivated Customer"
            value="200"
            icon={DeactivatedCustomersIcon}
            iconBg="bg-[#FFE4E8]"
          />
        </div>
      </div>

      <CustomerTable />
    </>
  );
}