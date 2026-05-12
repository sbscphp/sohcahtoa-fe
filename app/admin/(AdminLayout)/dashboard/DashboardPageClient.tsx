"use client";

import StatCard from "@/app/admin/_components/StatCard";
import { Database } from "lucide-react";
import { HiMiniUserGroup } from "react-icons/hi2";
import { FaMoneyBillTransfer } from "react-icons/fa6";
import { SimpleGrid, Skeleton, Alert } from "@mantine/core";
import { TransactionSummary } from "./_dashboardComponents/TransactionSummary";
import { TransactionsByType } from "./_dashboardComponents/TransactionsByType";
import { RecentTransactionsTable } from "./_dashboardComponents/RecentTransactionsTable";
import { TaskAndNotificationList } from "./_dashboardComponents/TaskAndNotificationList";
import { useAdminDashboard } from "./hooks/useAdminDashboard";
import { formatCurrency } from "@/app/utils/helper/formatCurrency";

export default function DashboardPageClient() {
  const {
    counters,
    transactionSummary,
    transactionsByType,
    recentTransactions,
    taskNotificationFeed,
    barChartData,
    donutData,
    isLoading,
    isError,
    error,
  } = useAdminDashboard();

  const showStats = !isLoading && counters != null;
  const settlementLabel =
    counters != null
      ? formatCurrency(counters.settlementBalance)
      : undefined;

  return (
    <>
      {isError && (
        <Alert title="Dashboard could not be loaded" color="red" mb="md">
          {error?.message ?? "Something went wrong. Try refreshing the page."}
        </Alert>
      )}

      <div className="w-full rounded-xl bg-white p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            <>
              <Skeleton height={88} radius="xl" />
              <Skeleton height={88} radius="xl" />
              <Skeleton height={88} radius="xl" />
              <Skeleton height={88} radius="xl" />
            </>
          ) : (
            showStats && (
              <>
                <StatCard
                  title="Settlement Balance"
                  value={settlementLabel}
                  icon={<Database className="h-5 w-5 text-orange-600" />}
                  iconBg="bg-orange-100"
                />
                <StatCard
                  title="Total Transactions"
                  value={counters.totalTransactions.toLocaleString()}
                  icon={
                    <FaMoneyBillTransfer className="h-5 w-5 text-purple-600" />
                  }
                  iconBg="bg-purple-100"
                />
                <StatCard
                  title="Total Customers"
                  value={counters.totalCustomers.toLocaleString()}
                  icon={<HiMiniUserGroup className="h-5 w-5 text-green-600" />}
                  iconBg="bg-green-100"
                />
                <StatCard
                  title="Total Users"
                  value={counters.totalUsers.toLocaleString()}
                  icon={<HiMiniUserGroup className="h-5 w-5 text-pink-600" />}
                  iconBg="bg-pink-100"
                />
              </>
            )
          )}
        </div>
      </div>

      <div className="my-5">
        <SimpleGrid cols={{ base: 1, lg: 2 }}>
          <TransactionSummary
            year={transactionSummary?.year ?? null}
            chartData={barChartData}
            loading={isLoading}
          />
          <TransactionsByType
            transactionsByType={transactionsByType}
            donutData={donutData}
            loading={isLoading}
          />
        </SimpleGrid>
      </div>

      <div className="my-5">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <RecentTransactionsTable
              data={recentTransactions}
              loading={isLoading}
            />
          </div>
          <div className="lg:col-span-2">
            <TaskAndNotificationList
              data={taskNotificationFeed}
              loading={isLoading}
            />
          </div>
        </div>
      </div>
    </>
  );
}
