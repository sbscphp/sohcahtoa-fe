"use client";

import { collapsed_logo, logo } from "@/app/assets/asset";
import { Avatar } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
  LayoutGrid,
  BanknoteIcon,
  Database,
  UserStar,
  Store,
  Users,
  UserRoundCog,
  Ticket,
  Coins,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

type SidebarProps = {
  collapsed: boolean;
  closeMobile?: () => void;
};

const menuItems = [
  { icon: LayoutGrid, label: "Dashboard", href: "/admin/dashboard" },
  { icon: BanknoteIcon, label: "Transactions", href: "/admin/transactions" },
  { icon: Database, label: "Settlement", href: "/admin/settlement" },
  { icon: UserStar, label: "Agent", href: "/admin/agent" },
  { icon: Store, label: "Outlet", href: "/admin/outlet" },
  { icon: Users, label: "Customer", href: "/admin/customer" },
  { icon: UserRoundCog, label: "Workflow", href: "/admin/workflow" },
  { icon: Ticket, label: "Tickets", href: "/admin/tickets" },
  { icon: Coins, label: "Rate Management", href: "/admin/rate-management" },
];

const menuItems2 = [
  { icon: LayoutGrid, label: "User Management", href: "/admin/user-management" },
  { icon: BanknoteIcon, label: "Regulatory & Compliance", href: "/admin/regulatory" },
  { icon: Database, label: "Report and Analytics", href: "/admin/report" },
  { icon: UserStar, label: "Audit Trail", href: "/admin/audit-trial" },
];

export default function Sidebar({ collapsed, closeMobile }: SidebarProps) {
  const pathname = usePathname();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleLinkClick = () => {
    if (isMobile && closeMobile) {
      closeMobile();
    }
  };

  return (
    <aside className="h-full bg-bg-card flex flex-col transition-all duration-300">
     
      <div className={`flex ${collapsed ? "px-2 py-4" : "p-4"}`}>
        <div
          className={`overflow-hidden transition-[width,height] duration-300 ease-in-out ${
            collapsed ? "h-15 w-[64px]" : "h-12 w-[120px]"
          }`}
        >
          <div className="relative h-12 w-[120px]">
            <div
              className={`absolute left-0 top-0 z-10 transition-opacity duration-300 ease-in-out ${
                collapsed ? "opacity-0" : "opacity-100"
              }`}
              aria-hidden={collapsed}
            >
              <Image src={logo} alt="SohCahToa" width={120} height={50} />
            </div>
            <div
              className={`absolute left-0 top-0 z-20 transition-opacity duration-300 ease-in-out ${
                collapsed ? "opacity-100" : "opacity-0"
              }`}
              aria-hidden={!collapsed}
            >
              <Image src={collapsed_logo} alt="SohCahToa" width={50} height={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Menu - Scrollable */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-3">
        <nav className="mt-2 space-y-1">
          {!collapsed && (
            <div>
              <h5 className="px-3 mb-3 text-xs text-body-text-100 uppercase tracking-wider">
                MAIN MENU
              </h5>
            </div>
          )}

          {menuItems.map(({ icon: Icon, label, href }) => {
            // Check if current path matches the href
            const isActive = pathname === href || pathname?.startsWith(href + '/');

            return (
              <Link
                key={href}
                href={href}
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-colors
                  ${
                    isActive
                      ? "bg-primary-00 text-primary-400"
                      : "text-body-text-300 hover:bg-white hover:text-body-heading-300"
                  }
                `}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && (
                  <span className="whitespace-nowrap">{label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <nav className="mt-6 space-y-1">
          {!collapsed && (
            <div>
              <h5 className="px-3 mb-3 text-xs text-body-text-100 uppercase tracking-wider">
                OTHERS
              </h5>
            </div>
          )}

          {menuItems2.map(({ icon: Icon, label, href }) => {
            // Check if current path matches the href
            const isActive = pathname === href || pathname?.startsWith(href + '/');

            return (
              <Link
                key={href}
                href={href}
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-colors
                  ${
                    isActive
                      ? "bg-primary-00 text-primary-400"
                      : "text-body-text-300 hover:bg-white hover:text-body-heading-300"
                  }
                `}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && (
                  <span className="whitespace-nowrap">{label}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Profile - Fixed at bottom */}
      {!collapsed && (
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-50 flex items-center justify-center overflow-hidden shrink-0">
              <Avatar src={`https://placehold.co/600x400/?text=MS`} name="Michael Smith" color="initials" />
            </div>
            <div className="overflow-hidden flex-1">
              <p className="font-medium text-xs text-body-heading-300 truncate">
                Michael Smith
              </p>
              <p className="text-body-text-100 text-xs truncate">
                michaelsmith12@gmail.com
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
