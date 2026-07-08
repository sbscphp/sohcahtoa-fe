"use client"

import { useEffect, useMemo, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Calendar, Clock, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button, Divider } from "@mantine/core"
import { useCreateData, useFetchData } from "@/app/_lib/api/hooks"
import { adminKeys } from "@/app/_lib/api/query-keys"
import { useRouter } from "next/navigation"
import {
  adminApi,
  type AdminNotificationItem,
} from "@/app/admin/_services/admin-api"
import type { ApiResponse } from "@/app/_lib/api/client"
import TablePaginator from "@/app/admin/_components/TablePaginator"
import { adminRoutes } from "@/lib/adminRoutes"

// --- Types ---
type Notification = {
  id: string
  title: string
  description: string
  date: string
  updatedDate?: string
  time: string
  status: "unread" | "read"
  transactionId?: string
}

type PaginationMetadata = {
  page: number
  totalPages: number
}

const PAGE_SIZE = 20

function formatDate(value: string) {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value

  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function formatTime(value: string) {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "--:--"

  return parsed.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })
}

function getTransactionId(data: AdminNotificationItem["data"]): string | undefined {
  if (!data || typeof data !== "object") return undefined

  const transactionId = (data as { transactionId?: unknown }).transactionId
  return typeof transactionId === "string" && transactionId.length > 0
    ? transactionId
    : undefined
}

function getPaginationMetadata(
  response?: ApiResponse<AdminNotificationItem[]>
): PaginationMetadata {
  const metadata = response?.metadata as { pagination?: unknown } | null | undefined
  const pagination = metadata?.pagination as
    | { page?: unknown; totalPages?: unknown }
    | undefined

  return {
    page: typeof pagination?.page === "number" ? pagination.page : 1,
    totalPages: typeof pagination?.totalPages === "number" ? pagination.totalPages : 1,
  }
}

function mapNotification(item: AdminNotificationItem): Notification {
  return {
    id: item.id,
    title: item.title,
    description: item.body,
    date: formatDate(item.createdAt),
    updatedDate:
      item.updatedAt && item.updatedAt !== item.createdAt
        ? formatDate(item.updatedAt)
        : undefined,
    time: formatTime(item.createdAt),
    status: item.isRead ? "read" : "unread",
    transactionId: getTransactionId(item.data),
  }
}

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
  onNavigate,
  isMarkingRead,
}: {
  notification: Notification
  onMarkRead: (id: string) => void
  onNavigate: (id: string) => void
  isMarkingRead: boolean
}) {
  const isUnread = notification.status === "unread"
  const isClickable = Boolean(notification.transactionId);
  
  const handleClick = () => {
    if (!notification.transactionId) return
    onNavigate(notification.transactionId)
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-lg border-x-[1.5px] border-gray-100 bg-card px-5 py-4 transition-colors hover:bg-muted/30",
        isClickable && "cursor-pointer"
      )}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={handleClick}
      onKeyDown={(event) => {
        if (!isClickable) return
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          handleClick()
        }
      }}
    >
      <div className="flex flex-col gap-1.5 grow">
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
        </div>{isUnread && (
          <Button
            variant="light"
            loading={isMarkingRead}
            disabled={isMarkingRead}
            size="sm"
            onClick={(event) => {
              event.stopPropagation()
              onMarkRead(notification.id)
            }}
            className="rounded-md border border-[#E8533F]/30 px-2.5 py-1 text-xs font-medium text-[#E8533F] transition-colors hover:bg-[#E8533F]/5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isMarkingRead ? "Marking..." : "Mark as read"}
          </Button>
        )}
      </div>

      {isClickable && <div className="flex items-center gap-3">

        <ChevronRight className="h-4 w-4 text-foreground/30" />
      </div>}
    </div>
  )
}

// --- Date Group Section ---
function DateGroup({
  label,
  notifications,
  onMarkRead,
  onNavigate,
  markingId,
}: {
  label: string
  notifications: Notification[]
  onMarkRead: (id: string) => void
  onNavigate: (id: string) => void
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
            onNavigate={onNavigate}
            isMarkingRead={markingId === n.id}
          />
        ))}
      </div>
    </div>
  )
}

// --- Main Component ---
export default function NotificationSettingsTab() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<NotificationTabValue>("all")
  const [allPage, setAllPage] = useState(1)
  const [unreadPage, setUnreadPage] = useState(1)
  const [allTotalPages, setAllTotalPages] = useState(1)
  const [unreadTotalPages, setUnreadTotalPages] = useState(1)
  const [allNotifications, setAllNotifications] = useState<Notification[]>([])
  const [unreadNotifications, setUnreadNotifications] = useState<Notification[]>([])
  const [markingId, setMarkingId] = useState<string | null>(null)
  const activePage = activeTab === "all" ? allPage : unreadPage
  const activeTotalPages = activeTab === "all" ? allTotalPages : unreadTotalPages

  const allQuery = useFetchData<ApiResponse<AdminNotificationItem[]>>(
    [...adminKeys.all, "notifications", "all", { page: allPage, limit: PAGE_SIZE }],
    () => adminApi.notifications.getAllNotifications({ page: allPage, limit: PAGE_SIZE }),
    true
  )

  const unreadQuery = useFetchData<ApiResponse<AdminNotificationItem[]>>(
    [...adminKeys.all, "notifications", "unread", { page: unreadPage, limit: PAGE_SIZE }],
    () =>
      adminApi.notifications.getUnreadNotifications({ page: unreadPage, limit: PAGE_SIZE }),
    true
  )

  useEffect(() => {
    if (allQuery.data?.data) {
      setAllNotifications(allQuery.data.data.map(mapNotification))
      setAllTotalPages(getPaginationMetadata(allQuery.data).totalPages)
    }
  }, [allQuery.data])

  useEffect(() => {
    if (unreadQuery.data?.data) {
      setUnreadNotifications(unreadQuery.data.data.map(mapNotification))
      setUnreadTotalPages(getPaginationMetadata(unreadQuery.data).totalPages)
    }
  }, [unreadQuery.data])

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
      await queryClient.invalidateQueries({ queryKey: adminKeys.notifications.unreadCount() })
    } finally {
      setMarkingId(null)
    }
  }

  const handleNavigate = (transactionId: string) => {
    router.push(adminRoutes.adminTransactionDetails(transactionId))
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
                onNavigate={handleNavigate}
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
        {!isLoading && !hasError && activeTotalPages > 1 && (
          <TablePaginator
            page={activePage}
            totalPages={activeTotalPages}
            onNext={() => {
              if (activeTab === "all") {
                setAllPage((current) => Math.min(current + 1, allTotalPages))
                return
              }
              setUnreadPage((current) => Math.min(current + 1, unreadTotalPages))
            }}
            onPrevious={() => {
              if (activeTab === "all") {
                setAllPage((current) => Math.max(current - 1, 1))
                return
              }
              setUnreadPage((current) => Math.max(current - 1, 1))
            }}
            onPageChange={(page) => {
              if (activeTab === "all") {
                setAllPage(page)
                return
              }
              setUnreadPage(page)
            }}
          />
        )}
      </div>
    </>
  )
}
