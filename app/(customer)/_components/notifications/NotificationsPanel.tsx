"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useFetchData } from "@/app/_lib/api/hooks";
import { customerApi } from "@/app/(customer)/_services/customer-api";
import { customerKeys } from "@/app/_lib/api/query-keys";
import Loader from "@/components/loader";
import type { NotificationItemProps } from "./NotificationItem";
import NotificationItem from "./NotificationItem";
import { transformNotificationToItem } from "@/app/(customer)/_utils/notifications";

type NotificationsPanelProps = {
  items?: NotificationItemProps[];
  viewAllHref?: string;
  onViewAllClick?: () => void;
};

export default function NotificationsPanel({
  items: propItems,
  viewAllHref = "/notifications",
  onViewAllClick,
}: NotificationsPanelProps) {
  // Fetch notifications from API
  const { data: notificationsResponse, isLoading } = useFetchData(
    [...customerKeys.notifications.list({ limit: 5 })],
    () => customerApi.notifications.list({ limit: 5 })
  );

  // Use prop items if provided (for testing), otherwise use API data
  const items = propItems
    ? propItems
    : notificationsResponse?.data?.notifications?.map(transformNotificationToItem) || [];
  return (
    <div className="flex w-[408px] max-w-[calc(100vw-2rem)] flex-col gap-4 px-4 py-3">
      <div className="flex flex-row items-center justify-between">
        <h2 className="text-lg font-semibold leading-[26px] text-[#4D4B4B]">
          Notifications
        </h2>
        <Link
          href={viewAllHref}
          onClick={onViewAllClick}
          className="flex items-center gap-1 text-sm font-medium leading-5 text-primary-400 transition-opacity hover:opacity-80"
        >
          View all
          <ArrowUpRight className="size-4 shrink-0" />
        </Link>
      </div>
      <div className="flex max-h-[360px] flex-col gap-4 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader />
          </div>
        ) : items.length === 0 ? (
          <div className="py-4 text-center text-sm text-[#6C6969]">
            No notifications yet.
          </div>
        ) : (
          items.map((item, i) => (
            <NotificationItem
              key={i}
              title={item.title}
              context={item.context}
              date={item.date}
              time={item.time}
              status={item.status}
              href={item.href}
              onClick={item.onClick}
            />
          ))
        )}
      </div>
    </div>
  );
}
