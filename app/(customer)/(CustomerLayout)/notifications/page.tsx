"use client";

import { useState, useMemo } from "react";
import { useFetchData, useCreateData } from "@/app/_lib/api/hooks";
import { customerApi } from "@/app/(customer)/_services/customer-api";
import { customerKeys } from "@/app/_lib/api/query-keys";
import Loader from "@/components/loader";
import NotificationItem from "@/app/(customer)/_components/notifications/NotificationItem";
import { groupNotificationsByDate } from "@/app/(customer)/_utils/notifications";
import { useQueryClient } from "@tanstack/react-query";

type TabKey = "all" | "unread" | "transactions";

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notificationsResponse, isLoading } = useFetchData(
    customerKeys.notifications.list({ limit: 50 }) as unknown as unknown[],
    () => customerApi.notifications.list({ limit: 50 })
  );

  // Fetch unread count
  const { data: unreadCountResponse } = useFetchData(
    customerKeys.notifications.unreadCount() as unknown as unknown[],
    () => customerApi.notifications.unreadCount()
  );

  // Mark all as read mutation
  const markAllAsReadMutation = useCreateData(customerApi.notifications.markAllAsRead, {
    onSuccess: () => {
      // Invalidate queries to refetch
      queryClient.invalidateQueries({ queryKey: customerKeys.notifications.all });
    },
  });

  // Transform and group notifications
  const allGroups = useMemo(() => {
    if (!notificationsResponse?.data?.notifications) return [];
    return groupNotificationsByDate(notificationsResponse.data.notifications);
  }, [notificationsResponse]);

  const allItems = useMemo(
    () => allGroups.flatMap((g) => g.items),
    [allGroups]
  );

  const unreadItems = useMemo(
    () => allItems.filter((i) => i.status === "unread"),
    [allItems]
  );

  const unreadCount = unreadCountResponse?.data?.count || 0;

  const filteredGroups = useMemo(() => {
    if (activeTab === "unread") {
      const unreadGroups = groupNotificationsByDate(
        notificationsResponse?.data?.notifications?.filter((n) => !n.read) || []
      );
      return unreadGroups;
    }
    if (activeTab === "transactions") {
      // Filter by transaction-related notifications (you can customize this)
      const transactionGroups = groupNotificationsByDate(
        notificationsResponse?.data?.notifications?.filter((n) =>
          n.type?.toLowerCase().includes("transaction")
        ) || []
      );
      return transactionGroups;
    }
    return allGroups;
  }, [activeTab, allGroups, notificationsResponse]);

  const TABS: { key: TabKey; label: string; count?: number }[] = [
    { key: "all", label: "All", count: allItems.length },
    { key: "unread", label: "Unread", count: unreadCount },
    { key: "transactions", label: "Transactions" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100">
        <div className="flex flex-wrap gap-4">
          {TABS.map(({ key, label, count }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`border-b-2 pb-2 text-sm font-medium transition-colors ${
                activeTab === key
                  ? "border-primary-400 text-primary-400"
                  : "border-transparent text-[#6C6969] hover:text-[#4D4B4B]"
              }`}
            >
              {label}
              {count != null ? ` (${count})` : ""}
            </button>
          ))}
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => markAllAsReadMutation.mutate(undefined)}
            disabled={markAllAsReadMutation.isPending}
            className="text-sm font-medium text-primary-400 hover:text-primary-500 disabled:opacity-50"
          >
            {markAllAsReadMutation.isPending ? "Marking..." : "Mark all as read"}
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-4 md:p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader />
          </div>
        ) : filteredGroups.length === 0 ? (
          <p className="py-8 text-center text-sm text-[#6C6969]">
            No notifications yet.
          </p>
        ) : (
          <div className="flex flex-col gap-6">
            {filteredGroups.map((group) => (
              <div key={group.label}>
                <h3 className="mb-3 text-sm font-semibold text-[#4D4B4B]">
                  {group.label}
                </h3>
                <div className="flex flex-col gap-3">
                  {group.items.map((item, i) => (
                    <NotificationItem
                      key={i}
                      title={item.title}
                      context={item.context}
                      date={item.date}
                      time={item.time}
                      status={item.status}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
