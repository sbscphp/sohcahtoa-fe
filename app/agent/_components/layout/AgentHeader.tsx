"use client";

import Link from "next/link";
import { Bell, ChevronLeft, Menu, ChevronDown } from "lucide-react";
import { useMediaQuery } from "@mantine/hooks";
import { Avatar, Popover, Text } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useFetchData } from "@/app/_lib/api/hooks";
import { agentApi } from "@/app/agent/_services/agent-api";
import { agentKeys } from "@/app/_lib/api/query-keys";
import NotificationsPanel from "@/app/(customer)/_components/notifications/NotificationsPanel";
import TransactionHeader from "@/app/(customer)/_components/transactions/TransactionHeader";
import AgentHeaderMenu from "../auth/HeaderMenu";
import { useState } from 'react';

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type AgentHeaderProps = {
  title?: string;
  collapsed: boolean;
  setCollapsed: () => void;
  toggleMobile?: () => void;
  breadcrumbs?: BreadcrumbItem[];
  transactionTitle?: string;
};

export default function AgentHeader({
  title,
  collapsed,
  setCollapsed,
  toggleMobile,
  breadcrumbs,
  transactionTitle,
}: AgentHeaderProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const { data: unreadCountResponse } = useFetchData(
    agentKeys.notifications.unreadCount() as unknown as unknown[],
    () => agentApi.notifications.unreadCount()
  );

  const unreadCount = unreadCountResponse?.data?.count || 0;

  return (
    <header className="h-16 bg-white border-b border-gray-50 px-6 flex items-center justify-between w-full relative">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {isMobile && toggleMobile ? (
          <button
            onClick={toggleMobile}
            className="rounded-full w-8 h-8 border border-gray-50 flex items-center justify-center hover:bg-gray-50 transition-colors shrink-0"
          >
            <Menu size={20} className="text-body-text-300" />
          </button>
        ) : (
          <button
            onClick={setCollapsed}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full w-8 h-8 border border-gray-50 flex items-center justify-center hover:bg-gray-50 drop-shadow shadow-sm transition-colors z-50 bg-white shrink-0"
          >
            <ChevronLeft
              className={`w-5 h-5 transition-transform duration-300 ease-in-out text-body-text-300 ${
                collapsed ? "rotate-180" : ""
              }`}
            />
          </button>
        )}
        {breadcrumbs && transactionTitle ? (
          <div className="flex items-center gap-2 ml-4 min-w-0 flex-1 overflow-hidden">
            <TransactionHeader
              title={transactionTitle}
              breadcrumbs={breadcrumbs}
            />
          </div>
        ) : title ? (
          <div className="flex items-center gap-2 ml-4">
            <h1 className="text-body-heading-300 text-lg font-semibold">
              {title}
            </h1>
          </div>
        ) : null}
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <Popover
          position="bottom-end"
          shadow="md"
          withArrow
          opened={notificationsOpen}
          onClose={() => setNotificationsOpen(false)}
        >
          <Popover.Target>
            <button
              type="button"
              onClick={() => setNotificationsOpen((v: boolean) => !v)}
              className="relative flex h-8 w-8 items-center justify-center rounded-full border border-gray-50 transition-colors hover:bg-gray-50"
            >
              <Bell size={16} className="text-body-text-300" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 min-w-[14px] rounded-full bg-red-500 px-1 py-px text-center text-[10px] font-medium leading-tight text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
          </Popover.Target>
          <Popover.Dropdown className="rounded-2xl border border-gray-100 p-0" p={0} m={0}>
            <NotificationsPanel
              viewAllHref="/agent/settings/notifications"
              onViewAllClick={() => setNotificationsOpen(false)}
            />
          </Popover.Dropdown>
        </Popover>

        {/* User Avatar - click goes to Settings */}
        <AgentHeaderMenu />
      </div>
    </header>
  );
}
