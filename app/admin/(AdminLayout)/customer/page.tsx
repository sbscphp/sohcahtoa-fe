"use client";

import { Skeleton } from "@mantine/core";
import { HiMiniUserGroup } from "react-icons/hi2";
import StatCard from "../../_components/StatCard";
import CustomerTable from "./_customerComponents/CustomerTable";
import { useCustomerCounts } from "./hooks/useCustomerCounts";

export default function CustomerPage() {
  const { counts, isLoading } = useCustomerCounts();
  const TotalCustomersIcon = (
    <HiMiniUserGroup className="h-5 w-5 text-orange-500" />
  );
  const ActiveCustomersIcon = (
    <HiMiniUserGroup className="h-5 w-5 text-green-600" />
  );
  const DeactivatedCustomersIcon = (
    <HiMiniUserGroup className="h-5 w-5 text-pink-600" />
  );
  const isEmpty = !isLoading && !counts;

  return (
    <>
      <div className="w-full rounded-xl bg-white p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {isLoading ? (
            <>
              <Skeleton height={100} radius="md" />
              <Skeleton height={100} radius="md" />
              <Skeleton height={100} radius="md" />
            </>
          ) : (
            <>
              <StatCard
                title="No of Customers"
                value={(counts?.totalCustomer ?? 0).toLocaleString()}
                icon={TotalCustomersIcon}
                iconBg="bg-orange-100"
                isEmpty={isEmpty}
              />

              <StatCard
                title="Active Customer"
                value={(counts?.activeCustomer ?? 0).toLocaleString()}
                icon={ActiveCustomersIcon}
                iconBg="bg-green-100"
                isEmpty={isEmpty}
              />

              <StatCard
                title="Deactivated Customer"
                value={(counts?.deactivatedCustomer ?? 0).toLocaleString()}
                icon={DeactivatedCustomersIcon}
                iconBg="bg-[#FFE4E8]"
                isEmpty={isEmpty}
              />
            </>
          )}
        </div>
      </div>

      <CustomerTable />
    </>
  );
}