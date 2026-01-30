import Image from "next/image";
import StatCard from "../../_components/StatCard";
import gold from "../../_components/assets/icons/Goldmoneys.png"
import pink from "../../_components/assets/icons/pinkmoneys.png"
import blue from "../../_components/assets/icons/bluemoneys.png"
import green from "../../_components/assets/icons/greenmoneys.png"
import TransactionsTable from "./_transactionsComponents/TransactionTable";

export default function TransactionPage () {
    const Icon1 = <div><Image src={gold} alt="icon"/></div>;
    const Icon2 = <div><Image src={pink} alt="icon"/></div>;
    const Icon3 = <div><Image src={blue} alt="icon"/></div>;
    const Icon4 = <div><Image src={green} alt="icon"/></div>;
    return(
        <>
        <div className="w-full rounded-xl bg-white p-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard
                    title="Under Review"
                    value={10}
                    icon={Icon1}
                    iconBg="bg-orange-100"
                  />
        
                  <StatCard
                    title="Rejected"
                    value={4}
                    icon={Icon2}
                    iconBg="bg-[#FFE4E8]"
                  />
        
                  <StatCard
                    title="Request Information"
                    value={4}
                    icon={Icon3}
                    iconBg="bg-[#EBE9FE]"
                  />
        
                  <StatCard
                    title="Approved"
                    value={22}
                    icon={Icon4}
                    iconBg="bg-[#D1FADF]"
                  />
                </div>
              </div>
              
              
              <TransactionsTable />
              </>
    );
}