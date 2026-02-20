"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, ChevronLeft, Menu, ChevronDown } from "lucide-react";
import { useMediaQuery } from "@mantine/hooks";
import { Avatar, Popover } from "@mantine/core";
import { useAtomValue } from "jotai";
import { userProfileAtom } from "@/app/_lib/atoms/auth-atom";
import { NotificationsPanel } from "../notifications";
import TransactionHeader from "../transactions/TransactionHeader";
import type { BreadcrumbItem } from "@/app/(customer)/_utils/transaction-flow";

type CustomerHeaderProps = {
  title?: string;
  collapsed: boolean;
  setCollapsed: () => void;
  toggleMobile?: () => void;
  breadcrumbs?: BreadcrumbItem[];
  transactionTitle?: string;
};

export default function CustomerHeader({
  title,
  collapsed,
  setCollapsed,
  toggleMobile,
  breadcrumbs,
  transactionTitle,
}: CustomerHeaderProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const userProfile = useAtomValue(userProfileAtom);

  // Get user display info from profile
  const displayName = userProfile?.profile?.fullName || 
    [userProfile?.profile?.firstName, userProfile?.profile?.lastName].filter(Boolean).join(' ') ||
    userProfile?.email?.split('@')[0] ||
    'User';
  const avatarUrl = userProfile?.profile?.avatar || undefined;
  const initials = userProfile?.profile?.firstName?.[0] || userProfile?.profile?.lastName?.[0] || userProfile?.email?.[0]?.toUpperCase() || 'U';

  return (
    <header className="h-16 bg-white border-b border-gray-50 px-6 flex items-center justify-between w-full relative">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {isMobile && toggleMobile
          ? <button
              onClick={toggleMobile}
              className="rounded-full w-8 h-8 border border-gray-50 flex items-center justify-center hover:bg-gray-50 transition-colors shrink-0"
            >
              <Menu size={20} className="text-body-text-300" />
            </button>
          : <button
              onClick={setCollapsed}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full w-8 h-8 border border-gray-50 flex items-center justify-center hover:bg-gray-50 drop-shadow shadow-sm transition-colors z-50 bg-white shrink-0"
            >
              <ChevronLeft
                className={`w-5 h-5 transition-transform duration-300 ease-in-out text-body-text-300 ${collapsed
                  ? "rotate-180"
                  : ""}`}
              />
            </button>}
        {/* Transaction Header with Breadcrumbs or Regular Title */}
        {breadcrumbs && transactionTitle ? (
          <div className="flex items-center gap-2 ml-4 min-w-0 flex-1 overflow-hidden">
            <TransactionHeader title={transactionTitle} breadcrumbs={breadcrumbs} />
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
              onClick={() => setNotificationsOpen((v) => !v)}
              className="relative flex h-8 w-8 items-center justify-center rounded-full border border-gray-50 transition-colors hover:bg-gray-50"
            >
              <Bell size={16} className="text-body-text-300" />
              <span className="absolute -right-0.5 -top-0.5 min-w-[14px] rounded-full bg-red-500 px-1 py-px text-center text-[10px] font-medium leading-tight text-white">
                2
              </span>
            </button>
          </Popover.Target>
          <Popover.Dropdown className="rounded-2xl border border-gray-100 p-0" p={0} m={0}>
            <NotificationsPanel
              viewAllHref="/notifications"
              onViewAllClick={() => setNotificationsOpen(false)}
            />
          </Popover.Dropdown>
        </Popover>

        {/* User Avatar - click goes to Settings */}
        <Link
          href="/settings"
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-gray-50"
        >
          <Avatar src={avatarUrl} name={displayName} color="initials" size={40} radius="xl">
            {initials}
          </Avatar>
          {!collapsed &&
            !isMobile &&
            <ChevronDown size={16} className="text-primary-400" />}
        </Link>
      </div>
    </header>
  );
}
