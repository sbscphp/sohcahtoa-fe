"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { NotificationItemProps } from "./NotificationItem";
import NotificationItem from "./NotificationItem";

const MOCK_NOTIFICATIONS: NotificationItemProps[] = [
  {
    title: "Transfer completed",
    context: "Your transfer to Ruth has been successful.",
    date: "Nov 18 2025",
    time: "11:00 am",
    status: "unread",
  },
  {
    title: "Payment received",
    context: "You received $850.89 from Tochukwu.",
    date: "Nov 18 2025",
    time: "09:30 am",
    status: "unread",
  },
  {
    title: "Wallet to wallet",
    context: "Your wallet transfer was processed.",
    date: "Nov 17 2025",
    time: "03:15 pm",
    status: "read",
  },
  {
    title: "Rate alert",
    context: "USD/NGN rate has been updated.",
    date: "Nov 17 2025",
    time: "10:00 am",
    status: "read",
  },
];

type NotificationsPanelProps = {
  items?: NotificationItemProps[];
  viewAllHref?: string;
};

export default function NotificationsPanel({
  items = MOCK_NOTIFICATIONS,
  viewAllHref = "#",
}: NotificationsPanelProps) {
  return (
    <div className="flex w-[408px] max-w-[calc(100vw-2rem)] flex-col gap-4 px-4 py-3">
      <div className="flex flex-row items-center justify-between">
        <h2 className="text-lg font-semibold leading-[26px] text-[#4D4B4B]">
          Notifications
        </h2>
        <Link
          href={viewAllHref}
          className="flex items-center gap-1 text-sm font-medium leading-5 text-primary-400 transition-opacity hover:opacity-80"
        >
          View all
          <ArrowUpRight className="size-4 shrink-0" />
        </Link>
      </div>
      <div className="flex max-h-[360px] flex-col gap-4 overflow-y-auto">
        {items.map((item, i) => (
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
        ))}
      </div>
    </div>
  );
}
