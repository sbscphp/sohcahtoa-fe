import Image from "next/image";
import StatCard from "../../_components/StatCard";
import gold from "../../_components/assets/icons/users-orange.png"
import green from "../../_components/assets/icons/users-green.png"
import pink from "../../_components/assets/icons/users-pink.png"
import UsersTable from "./UsersTable";

export default function UserManagement() {
    const Icon1 = <div><Image src={gold} alt="icon"/></div>;
        const Icon2 = <div><Image src={green} alt="icon"/></div>;
        const Icon3 = <div><Image src={pink} alt="icon"/></div>;return(
        <>
        <div className="w-full rounded-xl bg-white p-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <StatCard
                    title="No. of Users"
                    value={15}
                    icon={Icon1}
                    iconBg="bg-orange-100"
                  />
        
                  <StatCard
                    title="Active Users"
                    value={10}
                    icon={Icon2}
                    iconBg="bg-[#FFE4E8]"
                  />
        
                  <StatCard
                    title="Deactivated Users"
                    value={5}
                    icon={Icon3}
                    iconBg="bg-[#EBE9FE]"
                  />
        
                  
                </div>
              </div>
              <UsersTable />
              
        </>
    )
}