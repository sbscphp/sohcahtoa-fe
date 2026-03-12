"use client";

import { Skeleton } from "@mantine/core";
import StatCard from "../../_components/StatCard";
import AllTicketsTable from "./_ticketsComponents/AllTicketsTable";
import { Send, MessageCircle, FileText, Clock } from "lucide-react";
import { useTicketStats } from "./hooks/useTicketStats";

export default function TicketManagementPage() {
  const { stats, totalTickets, isLoading } = useTicketStats();
  const isStatsEmpty = !isLoading && !stats;

  return (
    <div className="space-y-5">
      <div className="w-full rounded-xl bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} height={90} radius="md" />
            ))
          ) : (
            <>
              <StatCard
                title="No. of Tickets"
                value={totalTickets}
                icon={<Send className="h-5 w-5 text-orange-600" />}
                iconBg="bg-orange-100"
                isEmpty={isStatsEmpty}
              />
              <StatCard
                title="Resolved"
                value={stats?.resolved ?? 0}
                icon={<MessageCircle className="h-5 w-5 text-green-600" />}
                iconBg="bg-green-100"
                isEmpty={isStatsEmpty}
              />
              <StatCard
                title="Open"
                value={stats?.open ?? 0}
                icon={<FileText className="h-5 w-5 text-blue-600" />}
                iconBg="bg-blue-100"
                isEmpty={isStatsEmpty}
              />
              <StatCard
                title="Unassigned"
                value={stats?.unassigned ?? 0}
                icon={<Clock className="h-5 w-5 text-amber-600" />}
                iconBg="bg-amber-100"
                isEmpty={isStatsEmpty}
              />
            </>
          )}
        </div>
      </div>

      <AllTicketsTable />
    </div>
  );
}
