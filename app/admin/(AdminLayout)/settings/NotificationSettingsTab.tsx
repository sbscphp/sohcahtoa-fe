"use client"

import { useState, useMemo } from "react"
import { Calendar, Clock, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Divider } from "@mantine/core"

// --- Types ---
interface Notification {
  id: string
  title: string
  description: string
  date: string
  updatedDate?: string
  time: string
  status: "unread" | "read"
  category: "all" | "transactions"
}

// --- Mock Data ---
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    title: "Notification Title",
    description: "One line Short context Text",
    date: "Nov 18 2025",
    updatedDate: "Nov 18 2025",
    time: "11:00 am",
    status: "unread",
    category: "all",
  },
  {
    id: "2",
    title: "Notification Title",
    description: "One line Short context Text",
    date: "Nov 18 2025",
    updatedDate: "Nov 18 2025",
    time: "11:00 am",
    status: "unread",
    category: "transactions",
  },
  {
    id: "3",
    title: "Notification Title",
    description: "One line Short context Text",
    date: "Nov 18 2025",
    updatedDate: "Nov 18 2025",
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
]

// --- Tab definitions ---
const NOTIFICATION_TABS = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "transactions", label: "Transactions" },
] as const

type NotificationTabValue = (typeof NOTIFICATION_TABS)[number]["value"]

// --- Date grouping helper ---
function groupByDate(notifications: Notification[]) {
  const groups: { label: string; items: Notification[] }[] = []
  const groupMap = new Map<string, Notification[]>()

  for (const n of notifications) {
    const key = n.date
    if (!groupMap.has(key)) {
      groupMap.set(key, [])
    }
    groupMap.get(key)?.push(n)
  }

  // Convert to labeled groups
  const today = "Nov 18 2025"
  const yesterday = "Nov 17 2025"

  for (const [date, items] of groupMap) {
    let label = date
    if (date === today) label = "Today"
    else if (date === yesterday) label = "Yesterday"
    groups.push({ label, items })
  }

  return groups
}

// --- Notification Card ---
function NotificationCard({ notification }: { notification: Notification }) {
  const isUnread = notification.status === "unread"

  return (
    <div className="flex items-center justify-between rounded-lg border-x-[1.5px] border-gray-100  bg-card px-5 py-4 transition-colors hover:bg-muted/30">
      <div className="flex flex-col gap-1.5">
        <h4 className="text-sm font-semibold text-foreground">
          {notification.title}
        </h4>
        <p className="text-sm text-foreground/50">{notification.description}</p>
        <div className="flex items-center gap-4 pt-0.5">
          <span className="flex items-center gap-1.5 text-xs text-foreground/40">
            <Calendar className="h-3.5 w-3.5" />
            {notification.date}
          </span>
          {notification.updatedDate && (
            <span className="flex items-center gap-1.5 text-xs text-foreground/40">
              <Calendar className="h-3.5 w-3.5" />
              {notification.updatedDate}
            </span>
          )}
          <span className="flex items-center gap-1.5 text-xs text-foreground/40">
            <Clock className="h-3.5 w-3.5" />
            {notification.time}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={cn(
            "text-sm font-medium",
            isUnread ? "text-[#E8533F]" : "text-foreground/40"
          )}
        >
          {isUnread ? "Unread" : "Read"}
        </span>
        <ChevronRight className="h-4 w-4 text-foreground/30" />
      </div>
    </div>
  )
}

// --- Date Group Section ---
function DateGroup({
  label,
  notifications,
}: {
  label: string
  notifications: Notification[]
}) {
  return (
    <div className="flex flex-col gap-3">
      {/* Date Header with Line */}
      <div className="flex items-center flex-row gap-4">
        <span className="shrink-0 text-sm font-medium text-foreground/70">
          {label}
        </span>
        <Divider color="black" />
      </div>

      {/* Notification Cards */}
      <div className="flex flex-col gap-3">
        {notifications.map((n) => (
          <NotificationCard key={n.id} notification={n} />
        ))}
      </div>
    </div>
  )
}

// --- Main Component ---
export default function NotificationSettingsTab() {
  const [activeTab, setActiveTab] = useState<NotificationTabValue>("all")

  // Filter notifications based on active tab
  const filteredNotifications = useMemo(() => {
    if (activeTab === "all") return MOCK_NOTIFICATIONS
    if (activeTab === "unread")
      return MOCK_NOTIFICATIONS.filter((n) => n.status === "unread")
    if (activeTab === "transactions")
      return MOCK_NOTIFICATIONS.filter((n) => n.category === "transactions")
    return MOCK_NOTIFICATIONS
  }, [activeTab])

  // Compute counts
  const unreadCount = MOCK_NOTIFICATIONS.filter(
    (n) => n.status === "unread"
  ).length
  const allCount = unreadCount

  // Group by date
  const groups = useMemo(
    () => groupByDate(filteredNotifications),
    [filteredNotifications]
  )

  return (
    <>
    <nav className="mb-8 flex items-center gap-0 ">
        {NOTIFICATION_TABS.map((tab) => {
          const isActive = activeTab === tab.value
          let countBadge: number | null = null
          if (tab.value === "all") countBadge = allCount
          if (tab.value === "unread") countBadge = unreadCount

          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "relative flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "text-[#E8533F]"
                  : "text-foreground/50 hover:text-foreground/70"
              )}
            >
              {tab.label}
              {countBadge !== null && countBadge > 0 && (
                <span
                  className={cn(
                    "flex h-5 min-w-[20px] items-center justify-center rounded-md px-1.5 text-[11px] font-semibold",
                    isActive
                      ? "bg-[#E8533F] text-white"
                      : "bg-foreground/10 text-foreground/50"
                  )}
                >
                  {countBadge}
                </span>
              )}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[#E8533F]" />
              )}
            </button>
          )
        })}
      </nav>
    <div className="mx-auto w-full max-w-3xl bg-white rounded-lg p-6">
      {/* Tab Bar */}
      

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
            <p className="text-sm font-medium text-foreground/50">
              No notifications
            </p>
            <p className="mt-1 text-xs text-foreground/30">
              You have no notifications in this category
            </p>
          </div>
        )}
      </div>
    </div>
    </>
  )
}
