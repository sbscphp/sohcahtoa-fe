"use client";

import Image from "next/image";
import { Skeleton } from "@mantine/core";
import StatCard from "../../../../_components/StatCard";
import gold from "../../../../_components/assets/icons/users-orange.png";
import green from "../../../../_components/assets/icons/users-green.png";
import pink from "../../../../_components/assets/icons/users-pink.png";
import RolesTable from "./RolesTable";
import { useRoleStats } from "../../hooks/useRoleStats";

export default function UserRoles() {
  const { stats, isLoading } = useRoleStats();

  const Icon1 = (
    <div>
      <Image src={gold} alt="icon" />
    </div>
  );
  const Icon2 = (
    <div>
      <Image src={green} alt="icon" />
    </div>
  );
  const Icon3 = (
    <div>
      <Image src={pink} alt="icon" />
    </div>
  );

  return (
    <>
      <div className="w-full rounded-xl bg-white p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <>
              <Skeleton height={100} radius="md" />
              <Skeleton height={100} radius="md" />
              <Skeleton height={100} radius="md" />
            </>
          ) : (
            <>
              <StatCard
                title="No. of Roles"
                value={stats?.totalRoles ?? 0}
                icon={Icon1}
                iconBg="bg-orange-100"
              />
              <StatCard
                title="Active Roles"
                value={stats?.activeRoles ?? 0}
                icon={Icon2}
                iconBg="bg-[#FFE4E8]"
              />
              <StatCard
                title="Deactivated Roles"
                value={stats?.inactiveRoles ?? 0}
                icon={Icon3}
                iconBg="bg-[#EBE9FE]"
              />
            </>
          )}
        </div>
      </div>
      <div className="mt-6">
        <RolesTable />
      </div>
    </>
  );
}
