"use client";

import Link from "next/link";
import Image from "next/image";
import Profile from "../assets/profile.png";
import Logo from "../assets/logo.png";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
  ChevronLeft,
} from "lucide-react";

type SidebarProps = {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
};

const menuItems = [
  { icon: LayoutGrid, label: "Dashboard", href: "/dashboard" },
  { icon: BanknoteIcon, label: "Transactions", href: "/transactions" },
  { icon: Database, label: "Settlement", href: "/settlement" },
  { icon: UserStar, label: "Agent", href: "/agent" },
  { icon: Store, label: "Outlet", href: "/outlet" },
  { icon: Users, label: "Customer", href: "/customer" },
  { icon: UserRoundCog, label: "Workflow", href: "/workflow" },
  { icon: Ticket, label: "Tickets", href: "/tickets" },
  { icon: Coins, label: "Rate Management", href: "/rate-management" },
];
const menuItems2 = [
  { icon: LayoutGrid, label: "User Management", href: "/user-management" },
  { icon: BanknoteIcon, label: "Regulatory & Compliance", href: "/regulatory" },
  { icon: Database, label: "Report and Analytics", href: "/report" },
  { icon: UserStar, label: "Audit Trail", href: "/audit-trial" },
];

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`
    fixed left-0 top-0 h-screen
    bg-white shadow
    transition-all duration-300
    ${collapsed ? "w-20" : "w-64"}
  `}
    >
      {/* Logo + Collapse Button */}
      <div className="flex items-center justify-between p-4">
        {!collapsed && <Image src={Logo} alt="Company Logo" />}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className=" rounded-full w-8 h-8 border-[0.5px] border-[#F2F4F7] flex items-center justify-center hover:bg-gray-100 drop-shadow shadow-sm shadow-[#0002057A] relative left-7 "
        >
          <ChevronLeft
            className={`w-5 h-5 transition-transform ${
              collapsed ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Menu */}
      <div className="h-[80%] overflow-y-auto">
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
                    ? "bg-[#FFF6F1] text-[#DD4F05]"
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
                    ? "bg-[#FFF6F1] text-[#DD4F05]"
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
        <div className="flex items-center mt-[30%] gap-3 pl-3">
          <div className="w-10 h-10 rounded-full border border-[#6C6969] ">
            <Image src={Profile} alt="profile picture" />
          </div>
          {!collapsed && (
            <div>
              <p className="font-medium text-xs text-[#323131] ">
                Micheal Smith
              </p>
              <p className="text-[#6C6969] text-xs ">
                michaelsmith12@gmail.com
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
