"use client";

import { Bell, ChevronLeft, Menu, ChevronDown } from "lucide-react";
import { useMediaQuery } from "@mantine/hooks";
import { Avatar } from "@mantine/core";

type CustomerHeaderProps = {
  title?: string;
  collapsed: boolean;
  setCollapsed: () => void;
  toggleMobile?: () => void;
};

export default function CustomerHeader({
  title,
  collapsed,
  setCollapsed,
  toggleMobile
}: CustomerHeaderProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <header className="h-16 bg-white border-b border-gray-50 px-6 flex items-center justify-between w-full relative">
      <div className="flex items-center gap-4">
        {isMobile && toggleMobile
          ? <button
              onClick={toggleMobile}
              className="rounded-full w-8 h-8 border border-gray-50 flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <Menu size={20} className="text-body-text-300" />
            </button>
          : <button
              onClick={setCollapsed}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full w-8 h-8 border border-gray-50 flex items-center justify-center hover:bg-gray-50 drop-shadow shadow-sm transition-colors z-50 bg-white"
            >
              <ChevronLeft
                className={`w-5 h-5 transition-transform duration-300 ease-in-out text-body-text-300 ${collapsed
                  ? "rotate-180"
                  : ""}`}
              />
            </button>}
        {/* Page Title */}
        {title &&
          <div className="flex items-center gap-2 ml-4">
            {/* <ChevronLeft size={16} className="text-body-text-100" /> */}
            <h1 className="text-body-heading-300 text-lg font-semibold">
              {title}
            </h1>
          </div>}
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="relative flex items-center justify-center w-8 h-8 rounded-full border border-gray-50 hover:bg-gray-50 transition-colors">
          <Bell size={16} className="text-body-text-300" />
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-medium px-1 py-px rounded-full min-w-[14px] text-center leading-tight">
            2
          </span>
        </button>

        {/* User Avatar */}
        <button className="flex items-center gap-2 hover:bg-gray-50 rounded-lg px-2 py-1.5 transition-colors">
          <Avatar name="Michael Smith" color="initials" size={40} radius="xl" />
          {!collapsed &&
            !isMobile &&
            <ChevronDown size={16} className="text-primary-400" />}
        </button>
      </div>
    </header>
  );
}
