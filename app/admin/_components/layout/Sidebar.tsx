"use client";

import Link from "next/link";
import Image from "next/image";
import Profile from "../assets/profile.png";
import Logo from "../assets/logo.png";
import { usePathname } from "next/navigation";  
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

type SidebarProps = {
  collapsed: boolean;
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

export default function Sidebar({ collapsed }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="h-full bg-white shadow flex flex-col transition-all duration-300">
      {/* Logo */}
      <div className="flex items-center justify-center p-4 mt-4">
        {!collapsed && <Image src={Logo} alt="Company Logo" />}
      </div>

      {/* Menu - Scrollable */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <nav className="mt-6 space-y-1 px-3">
          {!collapsed && (
            <div>
              <h5 className="px-3 mb-3 text-xs text-[#B2AFAF] uppercase tracking-wider">
                MAIN MENU
              </h5>
            </div>
          )}

          {menuItems.map(({ icon: Icon, label, href }) => {
            const isActive = pathname === href;

            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                transition-colors
                ${
                  isActive
                    ? "bg-[#FFF6F1] text-primary-orange"
                    : "text-gray-600 hover:bg-gray-100"
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

        <nav className="mt-6 space-y-1 px-3">
          {!collapsed && (
            <div>
              <h5 className="px-3 mb-3 text-xs text-[#B2AFAF] uppercase tracking-wider">
                OTHERS
              </h5>
            </div>
          )}

          {menuItems2.map(({ icon: Icon, label, href }) => {
            const isActive = pathname === href;

            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                transition-colors
                ${
                  isActive
                    ? "bg-[#FFF6F1] text-primary-orange"
                    : "text-gray-600 hover:bg-gray-100"
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

      {/* Profile Section - Fixed at bottom */}
      <div className="flex items-center gap-3 p-4 border-t border-gray-100">
        <div className="w-10 h-10 rounded-full border border-[#6C6969] shrink-0">
          <Image src={Profile} alt="profile picture" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="font-medium text-xs text-[#323131] truncate">
              Micheal Smith
            </p>
            <p className="text-[#6C6969] text-xs truncate">
              michaelsmith12@gmail.com
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
