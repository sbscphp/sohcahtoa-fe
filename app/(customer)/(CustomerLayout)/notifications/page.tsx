"use client";

import { useState, useMemo } from "react";
import { useFetchData, useCreateData } from "@/app/_lib/api/hooks";
import { customerApi } from "@/app/(customer)/_services/customer-api";
import { customerKeys } from "@/app/_lib/api/query-keys";
import Loader from "@/components/loader";
import NotificationItem from "@/app/(customer)/_components/notifications/NotificationItem";
import {
  formatNotificationDate,
  formatNotificationTime,
} from "@/app/(customer)/_utils/notifications";
import { useQueryClient } from "@tanstack/react-query";
import type { NotificationsListResponse, UnreadCountResponse } from "@/app/_lib/api/types";

type TabKey = "all" | "unread" | "transactions";

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [expandedNotificationId, setExpandedNotificationId] = useState<string | null>(null);
  const [markingNotificationId, setMarkingNotificationId] = useState<string | null>(null);
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

  const markAsReadMutation = useCreateData(customerApi.notifications.markAsRead, {
    onMutate: (id: string) => {
      setMarkingNotificationId(id);
      const listKey = customerKeys.notifications.list({ limit: 50 }) as unknown as unknown[];
      const unreadKey = customerKeys.notifications.unreadCount() as unknown as unknown[];

      queryClient.setQueryData<NotificationsListResponse>(listKey, (prev) => {
        if (!prev?.data?.notifications) return prev;
        return {
          ...prev,
          data: {
            ...prev.data,
            notifications: prev.data.notifications.map((n) =>
              n.id === id ? { ...n, read: true, isRead: true } : n
            ),
          },
        };
      });

      queryClient.setQueryData<UnreadCountResponse>(unreadKey, (prev) => {
        if (!prev?.data) return prev;
        return {
          ...prev,
          data: { ...prev.data, count: Math.max((prev.data.count ?? 1) - 1, 0) },
        };
      });
    },
    onSettled: () => {
      setMarkingNotificationId(null);
      queryClient.invalidateQueries({ queryKey: customerKeys.notifications.all });
    },
  });

  const allItems = useMemo(() => {
    const notifications = notificationsResponse?.data?.notifications ?? [];
    return notifications.map((n) => {
      const isRead = n.read ?? n.isRead ?? false;
      const body = n.message ?? n.body ?? "";
      const actionUrl = n.actionUrl ?? n.data?.actionUrl ?? undefined;

      return {
        id: n.id,
        title: n.title,
        context: body,
        date: formatNotificationDate(n.createdAt),
        time: formatNotificationTime(n.createdAt),
        status: isRead ? ("read" as const) : ("unread" as const),
        type: n.type,
        href: actionUrl || undefined,
      };
    });
  }, [notificationsResponse?.data?.notifications]);

  const unreadItems = useMemo(
    () => allItems.filter((i) => i.status === "unread"),
    [allItems]
  );

  const unreadCount = unreadCountResponse?.data?.count || 0;

  const groupedItems = useMemo(() => {
    const groups = new Map<string, typeof allItems>();
    for (const item of allItems) {
      const label = item.date;
      if (!groups.has(label)) groups.set(label, []);
      groups.get(label)!.push(item);
    }
    return Array.from(groups.entries()).map(([label, items]) => ({ label, items }));
  }, [allItems]);

  const filteredGroups = useMemo(() => {
    if (activeTab === "unread") {
      const groups = new Map<string, typeof unreadItems>();
      for (const item of unreadItems) {
        const label = item.date;
        if (!groups.has(label)) groups.set(label, []);
        groups.get(label)!.push(item);
      }
      return Array.from(groups.entries()).map(([label, items]) => ({ label, items }));
    }
    if (activeTab === "transactions") {
      const transactionItems = allItems.filter((i) => {
        const typeText = i.type?.toLowerCase() ?? "";
        const titleText = i.title.toLowerCase();
        return typeText.includes("transaction") || titleText.includes("transaction");
      });
      const groups = new Map<string, typeof transactionItems>();
      for (const item of transactionItems) {
        const label = item.date;
        if (!groups.has(label)) groups.set(label, []);
        groups.get(label)!.push(item);
      }
      return Array.from(groups.entries()).map(([label, items]) => ({ label, items }));
    }
    return groupedItems;
  }, [activeTab, groupedItems, unreadItems, allItems]);

  const handleNotificationClick = (item: { id: string; status: "read" | "unread"; href?: string }) => {
    if (item.status === "unread") {
      markAsReadMutation.mutate(item.id);
    }

    if (!item.href) {
      setExpandedNotificationId((current) => (current === item.id ? null : item.id));
    }
  };

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
                  {group.items.map((item) => (
                    <NotificationItem
                      key={item.id}
                      title={item.title}
                      context={item.context}
                      date={item.date}
                      time={item.time}
                      status={item.status}
                      href={item.href}
                      expanded={expandedNotificationId === item.id}
                      isMarkingAsRead={markingNotificationId === item.id}
                      onClick={() => handleNotificationClick(item)}
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
