/**
 * Notification utility functions
 * Transform API notification data to component format
 */

import type { Notification } from "@/app/_lib/api/types";
import type { NotificationItemProps } from "@/app/(customer)/_components/notifications/NotificationItem";

/**
 * Ensures in-app notification links are absolute paths so Next.js Link does not
 * resolve them relative to the current route (e.g. /dashboard + transactions/1).
 */
export function normalizeNotificationHref(href?: string | null): string | undefined {
  if (!href?.trim()) return undefined;

  const trimmed = href.trim();

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  return `/${trimmed.replace(/^\.?\//, "")}`;
}

export function resolveNotificationHref(notification: Notification): string | undefined {
  const raw = notification.actionUrl ?? notification.data?.actionUrl ?? undefined;
  return normalizeNotificationHref(raw);
}

/**
 * Format date to "Nov 18 2025" format
 */
export function formatNotificationDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format time to "11:00 am" format
 */
export function formatNotificationTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Transform API notification to component format
 */
export function transformNotificationToItem(
  notification: Notification
): NotificationItemProps {
  const context = notification.message ?? notification.body ?? "";
  const status = (notification.read ?? notification.isRead ?? false) ? "read" : "unread";
  const href = resolveNotificationHref(notification);

  return {
    title: notification.title,
    context,
    date: formatNotificationDate(notification.createdAt),
    time: formatNotificationTime(notification.createdAt),
    status,
    href,
  };
}

/**
 * Group notifications by date (Today, Yesterday, etc.)
 */
export function groupNotificationsByDate(
  notifications: Notification[]
): { label: string; items: NotificationItemProps[] }[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const groups: { label: string; items: NotificationItemProps[] }[] = [];
  const todayItems: NotificationItemProps[] = [];
  const yesterdayItems: NotificationItemProps[] = [];
  const olderItems: NotificationItemProps[] = [];

  notifications.forEach((notification) => {
    const item = transformNotificationToItem(notification);
    const notificationDate = new Date(notification.createdAt);
    const notificationDay = new Date(
      notificationDate.getFullYear(),
      notificationDate.getMonth(),
      notificationDate.getDate()
    );

    if (notificationDay.getTime() === today.getTime()) {
      todayItems.push(item);
    } else if (notificationDay.getTime() === yesterday.getTime()) {
      yesterdayItems.push(item);
    } else {
      olderItems.push(item);
    }
  });

  if (todayItems.length > 0) {
    groups.push({ label: "Today", items: todayItems });
  }
  if (yesterdayItems.length > 0) {
    groups.push({ label: "Yesterday", items: yesterdayItems });
  }
  if (olderItems.length > 0) {
    // Group older items by date
    const olderGroups = new Map<string, NotificationItemProps[]>();
    olderItems.forEach((item) => {
      const dateKey = item.date;
      if (!olderGroups.has(dateKey)) {
        olderGroups.set(dateKey, []);
      }
      olderGroups.get(dateKey)!.push(item);
    });

    olderGroups.forEach((items, dateKey) => {
      groups.push({ label: dateKey, items });
    });
  }

  return groups;
}
