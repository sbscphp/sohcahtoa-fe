 "use client";

import { useMemo, useState } from "react";
import { Tabs, Text } from "@mantine/core";
import SectionCard from "@/app/(customer)/_components/dashboard/SectionCard";
import SearchInput from "@/app/admin/_components/SearchInput";
import { useFetchData, useCreateData } from "@/app/_lib/api/hooks";
import { agentApi } from "@/app/agent/_services/agent-api";
import { agentKeys } from "@/app/_lib/api/query-keys";
import { groupNotificationsByDate } from "@/app/(customer)/_utils/notifications";
import NotificationItem from "@/app/(customer)/_components/notifications/NotificationItem";
import Loader from "@/components/loader";

type NotificationTabValue = "all" | "unread" | "transactions";

const NOTIFICATION_TABS: { value: NotificationTabValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "transactions", label: "Transactions" },
];

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<NotificationTabValue>("all");
  const [search, setSearch] = useState("");

  // Fetch notifications for the agent (mirror customer view-all logic)
  const { data: notificationsResponse, isLoading } = useFetchData(
    agentKeys.notifications.list({ limit: 50 }) as unknown as unknown[],
    () => agentApi.notifications.list({ limit: 50 }),
    true,
  );

  // Fetch unread count
  const { data: unreadCountResponse } = useFetchData(
    agentKeys.notifications.unreadCount() as unknown as unknown[],
    () => agentApi.notifications.unreadCount(),
    true,
  );

  // Mark all as read – reuse customer pattern
  const markAllAsReadMutation = useCreateData(agentApi.notifications.markAllAsRead);

  const allGroups = useMemo(() => {
    if (!notificationsResponse?.data?.notifications) return [];
    return groupNotificationsByDate(notificationsResponse.data.notifications);
  }, [notificationsResponse]);

  const allItems = useMemo(
    () => allGroups.flatMap((g) => g.items),
    [allGroups],
  );

  const filteredGroups = useMemo(() => {
    const source = notificationsResponse?.data?.notifications || [];

    // Base filter by tab (status / type)
    let filtered = source;
    if (activeTab === "unread") {
      filtered = filtered.filter((n: any) => !n.read);
    } else if (activeTab === "transactions") {
      filtered = filtered.filter((n: any) =>
        n.type?.toLowerCase().includes("transaction"),
      );
    }

    // Text search on title/context
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter((n: any) => {
        const title = (n.title || "").toLowerCase();
        const context = (n.context || "").toLowerCase();
        return title.includes(q) || context.includes(q);
      });
    }

    return groupNotificationsByDate(filtered);
  }, [activeTab, search, notificationsResponse]);

  const unreadCount = unreadCountResponse?.data?.count || 0;

  return (
    <SectionCard className="rounded-2xl p-4 md:p-6 max-w-[800px] mx-auto">
      <div className="space-y-6">
        {/* Tabs */}
        <div className="mb-4 flex items-center justify-between gap-4">
          <Tabs
            value={activeTab}
            onChange={(v) => {
              if (v != null) setActiveTab(v as NotificationTabValue);
            }}
          >
            <Tabs.List className="w-full flex flex-1 flex-wrap items-start gap-3 border-0 bg-transparent pb-3">
              {NOTIFICATION_TABS.map((tab) => {
                const isActive = activeTab === tab.value;
                const label =
                  tab.value === "unread" && unreadCount > 0
                    ? `${tab.label} (${unreadCount})`
                    : tab.label;
                return (
                  <Tabs.Tab
                    key={tab.value}
                    value={tab.value}
                    className={`shrink-0 cursor-pointer rounded-full! border px-2.5 py-1.5 text-sm font-normal leading-[120%] transition-colors mx-2 ${
                      isActive
                        ? "border! border-primary-100! bg-[#FFF6F1]! text-primary-400!"
                        : "border! border-[#E4E4E7]! bg-white! text-gray-900! hover:border-gray-300!"
                    }`}
                  >
                    {label}
                  </Tabs.Tab>
                );
              })}
            </Tabs.List>
          </Tabs>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllAsReadMutation.mutate(undefined)}
              disabled={markAllAsReadMutation.isPending}
              className="text-xs md:text-sm font-medium text-primary-400 hover:text-primary-500 disabled:opacity-50"
            >
              {markAllAsReadMutation.isPending ? "Marking..." : "Mark all as read"}
            </button>
          )}
        </div>

        {/* Search */}
        <SearchInput
          placeholder="Search Notification"
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          className="w-full"
        />

        {/* Notification Groups */}
        <div className="flex flex-col gap-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader />
            </div>
          ) : filteredGroups.length > 0 ? (
            filteredGroups.map((group) => (
              <div key={group.label} className="flex flex-col gap-3">
                <div className="flex items-center flex-row gap-4">
                  <span className="shrink-0 text-sm font-medium text-[#4D4B4B]">
                    {group.label}
                  </span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
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
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Text size="sm" c="dimmed" fw={500}>
                No notifications
              </Text>
              <Text size="xs" c="dimmed" mt={4}>
                You have no notifications in this category
              </Text>
            </div>
          )}
        </div>
      </div>
    </SectionCard>
  );
}
