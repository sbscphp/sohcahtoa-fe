"use client";

import { collapsed_logo, logo } from "@/app/assets/asset";
import { Avatar, UnstyledButton } from "@mantine/core";
import { ArrowUpRight, BanknoteIcon, Calculator, LayoutGrid } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

type CustomerSidebarProps = {
  collapsed: boolean;
  onCollapse?: () => void;
  onNavigate?: () => void;
};

const menuItems = [
  { icon: LayoutGrid, label: "Overview", href: "/dashboard" },
  { icon: BanknoteIcon, label: "Transactions", href: "/transactions" },
  { icon: Calculator, label: "Rate Calculator", href: "/rate-calculator" },
  // { icon: Settings, label: "Settings", href: "/settings" },
];

export default function CustomerSidebar({ collapsed, onCollapse, onNavigate }: CustomerSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
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
          {menuItems.map(({ icon: Icon, label, href }) => {
            // Check if current path matches the href
            const isActive = pathname === href || pathname?.startsWith(href + '/');

            return (
              <Link
                key={href}
                href={href}
                onClick={onNavigate}
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

      {/* Need Help Section - Fixed at bottom */}
      {!collapsed && (
        <div className="p-4 space-y-4 ">
          <div className="bg-primary-00 rounded-lg p-4 bg-bg-sidebar border-[0.3px] border-primary-400 space-y-1">
            <h2 className="capitalize text-body-heading-200 font-medium">Need help</h2>
            <p className="text-body-text-200 text-sm">
              For any questions or clarifications, kindly reach out to our support team.
            </p>
            <UnstyledButton
              className="w-full flex items-center gap-5 h-8 rounded-lg hover:bg-primary-25! transition-colors"
              onClick={() => {
                router.push('/support');
                onNavigate?.();
              }}
            >
              <span className="text-primary-400 text-sm">Contact Support</span>
              <ArrowUpRight size={16} className="text-primary-400" />
            </UnstyledButton>
          </div>

          {/* User Profile - click goes to Settings */}
          <UnstyledButton
            className="flex w-full items-center gap-3 rounded-lg py-1 cursor-pointer pr-2 transition-colors hover:bg-white/50"
            onClick={() => {
              router.push('/settings');
              onNavigate?.();
            }}
          >
            <div className="w-10 h-10 shrink-0 overflow-hidden rounded-full border border-gray-50 bg-gray-100">
              <Avatar src={`https://placehold.co/600x400/?text=MS`} name="Michael Smith" color="initials" />
            </div>
            <div className="min-w-0 flex-1 overflow-hidden text-left">
              <p className="truncate text-xs font-medium text-body-heading-300">
                Michael Smith
              </p>
              <p className="truncate text-xs text-body-text-100">
                michaelsmith12@gmail.com
              </p>
            </div>
          </UnstyledButton>
        </div>
      )}
    </aside>
  );
}
