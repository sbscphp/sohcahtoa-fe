import StatCard from "../../_components/StatCard";
import AllTicketsTable from "./_ticketsComponents/AllTicketsTable";
import { Send, MessageCircle, FileText, Clock } from "lucide-react";

export default function TicketManagementPage() {
  return (
    <div className="space-y-5">
      <div className="w-full rounded-xl bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="No. of Tickets"
            value={15}
            icon={<Send className="h-5 w-5 text-orange-600" />}
            iconBg="bg-orange-100"
          />
          <StatCard
            title="Resolved"
            value={10}
            icon={<MessageCircle className="h-5 w-5 text-green-600" />}
            iconBg="bg-green-100"
          />
          <StatCard
            title="Open"
            value={5}
            icon={<FileText className="h-5 w-5 text-blue-600" />}
            iconBg="bg-blue-100"
          />
          <StatCard
            title="Avg Resolution Time"
            value="25%"
            icon={<Clock className="h-5 w-5 text-amber-600" />}
            iconBg="bg-amber-100"
          />
        </div>
      </div>

      <AllTicketsTable />
    </div>
  );
}
