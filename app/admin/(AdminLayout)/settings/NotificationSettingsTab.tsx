"use client"

import { useEffect, useMemo, useState } from "react"
import { Calendar, Clock, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Divider } from "@mantine/core"
import { useCreateData, useFetchData } from "@/app/_lib/api/hooks"
import { adminKeys } from "@/app/_lib/api/query-keys"
import {
  adminApi,
  type AdminNotificationItem,
} from "@/app/admin/_services/admin-api"
import type { ApiResponse } from "@/app/_lib/api/client"

// --- Types ---
type Notification = AdminNotificationItem

// --- Tab definitions ---
const NOTIFICATION_TABS = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
] as const

type NotificationTabValue = (typeof NOTIFICATION_TABS)[number]["value"]

// --- Date grouping helper ---
function groupByDate(notifications: Notification[]) {
  const groups: { label: string; items: Notification[]; sortDate: Date }[] = []
  const groupMap = new Map<string, Notification[]>()
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfYesterday = new Date(startOfToday)
  startOfYesterday.setDate(startOfYesterday.getDate() - 1)

  const parseDate = (value: string) => {
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return null
    return parsed
  }

  for (const n of notifications) {
    const key = n.date
    if (!groupMap.has(key)) {
      groupMap.set(key, [])
    }
    groupMap.get(key)?.push(n)
  }

  for (const [date, items] of groupMap) {
    const parsed = parseDate(date)
    let label = date

    if (parsed) {
      const startOfParsed = new Date(
        parsed.getFullYear(),
        parsed.getMonth(),
        parsed.getDate()
      )

      if (startOfParsed.getTime() === startOfToday.getTime()) label = "Today"
      else if (startOfParsed.getTime() === startOfYesterday.getTime()) {
        label = "Yesterday"
      }
    }

    groups.push({ label, items, sortDate: parsed ?? new Date(0) })
  }

  return groups.sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime())
}

// --- Notification Card ---
function NotificationCard({
  notification,
  onMarkRead,
  isMarkingRead,
}: {
  notification: Notification
  onMarkRead: (id: string) => void
  isMarkingRead: boolean
}) {
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

      <div className="flex items-center gap-3">
        {isUnread && (
          <button
            type="button"
            onClick={() => onMarkRead(notification.id)}
            disabled={isMarkingRead}
            className="rounded-md border border-[#E8533F]/30 px-2.5 py-1 text-xs font-medium text-[#E8533F] transition-colors hover:bg-[#E8533F]/5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isMarkingRead ? "Marking..." : "Mark read"}
          </button>
        )}
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
  onMarkRead,
  markingId,
}: {
  label: string
  notifications: Notification[]
  onMarkRead: (id: string) => void
  markingId: string | null
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
          <NotificationCard
            key={n.id}
            notification={n}
            onMarkRead={onMarkRead}
            isMarkingRead={markingId === n.id}
          />
        ))}
      </div>
    </div>
  )
}

// --- Main Component ---
export default function NotificationSettingsTab() {
  const [activeTab, setActiveTab] = useState<NotificationTabValue>("all")
  const [allNotifications, setAllNotifications] = useState<Notification[]>([])
  const [unreadNotifications, setUnreadNotifications] = useState<Notification[]>([])
  const [markingId, setMarkingId] = useState<string | null>(null)

  const allQuery = useFetchData<ApiResponse<Notification[]>>(
    [...adminKeys.all, "notifications", "all", { page: 1, limit: 20 }],
    () => adminApi.notifications.getAllNotifications({ page: 1, limit: 20 }),
    true
  )

  const unreadQuery = useFetchData<ApiResponse<Notification[]>>(
    [...adminKeys.all, "notifications", "unread", { page: 1, limit: 20 }],
    () => adminApi.notifications.getUnreadNotifications({ page: 1, limit: 20 }),
    true
  )

  useEffect(() => {
    if (allQuery.data?.data) {
      setAllNotifications(allQuery.data.data)
    }
  }, [allQuery.data?.data])

  useEffect(() => {
    if (unreadQuery.data?.data) {
      setUnreadNotifications(unreadQuery.data.data)
    }
  }, [unreadQuery.data?.data])

  const markReadMutation = useCreateData((id: string) =>
    adminApi.notifications.markNotificationAsRead(id)
  )

  const handleMarkRead = async (id: string) => {
    setMarkingId(id)
    try {
      await markReadMutation.mutateAsync(id)
      setUnreadNotifications((prev) => prev.filter((n) => n.id !== id))
      setAllNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, status: "read" } : n))
      )
    } finally {
      setMarkingId(null)
    }
  }

  const isLoading =
    allQuery.isLoading || unreadQuery.isLoading || allQuery.isFetching || unreadQuery.isFetching
  const hasError = allQuery.isError || unreadQuery.isError

  // Filter notifications based on active tab
  const filteredNotifications = useMemo(() => {
    if (activeTab === "all") return allNotifications
    if (activeTab === "unread") return unreadNotifications
    return allNotifications
  }, [activeTab, allNotifications, unreadNotifications])

  // Compute counts
  const unreadCount = unreadNotifications.length
  const allCount = allNotifications.length

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
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm font-medium text-foreground/50">
              Loading notifications...
            </p>
          </div>
        ) : hasError ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm font-medium text-foreground/50">
              Unable to load notifications
            </p>
            <p className="mt-1 text-xs text-foreground/30">
              Please refresh and try again
            </p>
          </div>
        ) : groups.length > 0 ? (
          groups.map((group) => (
            <DateGroup
              key={`${group.label}-${group.sortDate.getTime()}`}
              label={group.label}
              notifications={group.items}
              onMarkRead={handleMarkRead}
              markingId={markingId}
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
