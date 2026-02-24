"use client";

import { useState, useMemo } from "react";
import { TextInput, Tabs, Text, Badge } from "@mantine/core";
import { Search, Calendar, Clock, ChevronRight } from "lucide-react";
import SectionCard from "@/app/(customer)/_components/dashboard/SectionCard";

interface Notification {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  status: "unread" | "read";
  category: "all" | "transactions";
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    title: "Notification Title",
    description: "One line Short context Text",
    date: "Nov 18 2025",
    time: "11:00 am",
    status: "unread",
    category: "all",
  },
  {
    id: "2",
    title: "Notification Title",
    description: "One line Short context Text",
    date: "Nov 18 2025",
    time: "11:00 am",
    status: "unread",
    category: "transactions",
  },
  {
    id: "3",
    title: "Notification Title",
    description: "One line Short context Text",
    date: "Nov 18 2025",
    time: "11:00 am",
    status: "unread",
    category: "all",
  },
  {
    id: "4",
    title: "Notification Title",
    description: "One line Short context Text",
    date: "Nov 17 2025",
    time: "11:00 am",
    status: "read",
    category: "all",
  },
];

const NOTIFICATION_TABS = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "transactions", label: "Transactions" },
] as const;

type NotificationTabValue = (typeof NOTIFICATION_TABS)[number]["value"];

function groupByDate(notifications: Notification[]) {
  const groups: { label: string; items: Notification[] }[] = [];
  const groupMap = new Map<string, Notification[]>();

  for (const n of notifications) {
    const key = n.date;
    if (!groupMap.has(key)) {
      groupMap.set(key, []);
    }
    groupMap.get(key)?.push(n);
  }

  const today = "Nov 18 2025";
  const yesterday = "Nov 17 2025";

  for (const [date, items] of groupMap) {
    let label = date;
    if (date === today) label = "Today";
    else if (date === yesterday) label = "Yesterday";
    groups.push({ label, items });
  }

  return groups;
}

function NotificationCard({ notification }: { notification: Notification }) {
  const isUnread = notification.status === "unread";

  return (
    <div className="flex items-center justify-between rounded-lg border-x-[1.5px] border-gray-100 bg-white px-5 py-4 transition-colors hover:bg-gray-50/50">
      <div className="flex flex-col gap-1.5">
        <h4 className="text-sm font-semibold text-[#4D4B4B]">
          {notification.title}
        </h4>
        <p className="text-sm text-[#6C6969]">{notification.description}</p>
        <div className="flex items-center gap-4 pt-0.5">
          <span className="flex items-center gap-1.5 text-xs text-[#8F8B8B]">
            <Calendar className="h-3.5 w-3.5" />
            {notification.date}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-[#8F8B8B]">
            <Clock className="h-3.5 w-3.5" />
            {notification.time}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge
          color={isUnread ? "orange" : "gray"}
          variant="light"
          size="sm"
        >
          {isUnread ? "Unread" : "Read"}
        </Badge>
        <ChevronRight className="h-4 w-4 text-[#B2AFAF]" />
      </div>
    </div>
  );
}

function DateGroup({
  label,
  notifications,
}: {
  label: string;
  notifications: Notification[];
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center flex-row gap-4">
        <span className="shrink-0 text-sm font-medium text-[#4D4B4B]">
          {label}
        </span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <div className="flex flex-col gap-3">
        {notifications.map((n) => (
          <NotificationCard key={n.id} notification={n} />
        ))}
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<NotificationTabValue>("all");
  const [search, setSearch] = useState("");

  const filteredNotifications = useMemo(() => {
    let filtered = MOCK_NOTIFICATIONS;

    if (activeTab === "unread") {
      filtered = filtered.filter((n) => n.status === "unread");
    } else if (activeTab === "transactions") {
      filtered = filtered.filter((n) => n.category === "transactions");
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.description.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [activeTab, search]);

  const unreadCount = MOCK_NOTIFICATIONS.filter(
    (n) => n.status === "unread"
  ).length;

  const groups = useMemo(
    () => groupByDate(filteredNotifications),
    [filteredNotifications]
  );

  return (
    <SectionCard className="rounded-2xl p-4 md:p-6">
      <div className="space-y-6">
        {/* Tabs */}
        <div className="mb-4">
          <Tabs
            value={activeTab}
            onChange={(v) => {
              if (v != null) setActiveTab(v as NotificationTabValue);
            }}
          >
            <Tabs.List className="w-full flex flex-1 flex-wrap items-start gap-3 border-0 bg-transparent">
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
                    className={`shrink-0 cursor-pointer rounded-full! border px-2.5 py-1.5 text-sm font-normal leading-[120%] transition-colors ${
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
        </div>

        {/* Search */}
        <TextInput
          placeholder="Search Notification"
          leftSection={<Search size={16} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          size="md"
        />

        {/* Notification Groups */}
        <div className="flex flex-col gap-8">
          {groups.length > 0 ? (
            groups.map((group) => (
              <DateGroup
                key={group.label}
                label={group.label}
                notifications={group.items}
              />
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
