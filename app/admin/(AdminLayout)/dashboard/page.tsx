import StatCard from "../../_components/StatCard";
import { Database } from "lucide-react";
import { HiMiniUserGroup } from "react-icons/hi2";
import { FaMoneyBillTransfer } from "react-icons/fa6";
import { SimpleGrid } from "@mantine/core";
import { TransactionSummary } from "./_dashboardComponents/TransactionSummary";
import { TransactionsByType } from "./_dashboardComponents/TransactionsByType";
import { RecentTransactionsTable } from "./_dashboardComponents/RecentTransactionsTable";
import { TaskAndNotificationList } from "./_dashboardComponents/TaskAndNotificationList";
import { Transaction, TransactionStatus } from "../../_types/dashboard";
// import { RecentTransactionsTable } from "../RecentTransactionsTable";
// import { TaskAndNotificationList } from "@/components/TaskAndNotificationList";

const transactions: Transaction[] = [
  {
    id: "GHA67AGHA",
    date: "Nov 16 2025",
    time: "11:00 am",
    status: "Pending",
  },
  {
    id: "GHA67AGHA",
    date: "Nov 21 2025",
    time: "4:30 pm",
    status: "Completed",
  },
  {
    id: "GHA67AGHA",
    date: "Nov 17 2025",
    time: "12:30 pm",
    status: "Pending",
  },
  {
    id: "GHA67AGHA",
    date: "Nov 20 2025",
    time: "9:00 am",
    status: "Request More Info",
  },
  {
    id: "GHA67AGHA",
    date: "Nov 22 2025",
    time: "10:00 am",
    status: "Rejected",
  },
];

const notifications = [
  {
    id: "1",
    title: "Notification Title",
    description: "One line Short context Text",
    date: "Nov 18 2025",
    time: "11:00 am",
    unread: true,
    status: "Pending" as TransactionStatus,
    type: "Transaction",
  },
  {
    id: "2",
    title: "Notification Title",
    description: "One line Short context Text",
    date: "Nov 18 2025",
    time: "11:00 am",
    unread: true,
    status: "Pending" as TransactionStatus,
    type: "Transaction",
  },
];

export default function DashboardPage() {
  return (
    <>
      <div className="w-full rounded-xl bg-white p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Settlement Balance"
            value={100}
            icon={<Database className="h-5 w-5 text-orange-600" />}
            iconBg="bg-orange-100"
          />

          <StatCard
            title="Total Transactions"
            value={100}
            icon={<FaMoneyBillTransfer className="h-5 w-5 text-purple-600" />}
            iconBg="bg-purple-100"
          />

          <StatCard
            title="Total Customers"
            value={100}
            icon={<HiMiniUserGroup className="h-5 w-5 text-green-600" />}
            iconBg="bg-green-100"
          />

          <StatCard
            title="Total Users"
            value={11}
            icon={<HiMiniUserGroup className="h-5 w-5 text-pink-600" />}
            iconBg="bg-pink-100"
          />
        </div>
      </div>

      <div className="my-5">
        <SimpleGrid cols={{ base: 1, lg: 2 }}>
          <TransactionSummary />
          <TransactionsByType />
        </SimpleGrid>
      </div>
      <div className="my-5">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <RecentTransactionsTable data={transactions as Transaction[]} />
          </div>
          <div className="lg:col-span-2">
            <TaskAndNotificationList data={notifications} />
          </div>
        </div>
      </div>
    </>
  );
}
