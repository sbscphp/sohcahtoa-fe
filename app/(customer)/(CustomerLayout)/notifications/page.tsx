"use client";

import { useState } from "react";
import NotificationItem from "@/app/(customer)/_components/notifications/NotificationItem";
import type { NotificationItemProps } from "@/app/(customer)/_components/notifications/NotificationItem";

const MOCK_BY_DATE: { label: string; items: NotificationItemProps[] }[] = [
  {
    label: "Today",
    items: [
      {
        title: "Notification Title",
        context: "One line Short context Text",
        date: "Nov 18 2025",
        time: "11:00 am",
        status: "unread",
      },
      {
        title: "Notification Title",
        context: "One line Short context Text",
        date: "Nov 18 2025",
        time: "11:00 am",
        status: "unread",
      },
      {
        title: "Notification Title",
        context: "One line Short context Text",
        date: "Nov 18 2025",
        time: "11:00 am",
        status: "unread",
      },
    ],
  },
  {
    label: "Yesterday",
    items: [
      {
        title: "Notification Title",
        context: "One line Short context Text",
        date: "Nov 18 2025",
        time: "11:00 am",
        status: "read",
      },
    ],
  },
];

type TabKey = "all" | "unread" | "transactions";

const TABS: { key: TabKey; label: string; count?: number }[] = [
  { key: "all", label: "All", count: 4 },
  { key: "unread", label: "Unread", count: 3 },
  { key: "transactions", label: "Transactions" },
];

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("all");

  const allItems = MOCK_BY_DATE.flatMap((g) => g.items);
  const unreadItems = allItems.filter((i) => i.status === "unread");
  const filteredGroups =
    activeTab === "unread"
      ? [{ label: "Today", items: unreadItems }]
      : activeTab === "transactions"
        ? []
        : MOCK_BY_DATE;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 border-b border-gray-100">
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
            {count != null ? ` ${count}` : ""}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-4 md:p-6">
        {filteredGroups.length === 0 ? (
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
