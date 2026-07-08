"use client";

import { collapsed_logo, logo } from "@/app/assets/asset";
import { adminRoutes } from "@/lib/adminRoutes";
import { Avatar, Menu } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
  LayoutGrid,
  BanknoteIcon,
  Database,
  Store,
  Users,
  Ticket,
  UserStar,
  Wallet,
  ChevronDown,
  ChevronUp,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useAtomValue } from "jotai";
import { adminUserAtom } from "@/app/admin/_lib/atoms/admin-auth-atom";
import type { UserPermission } from "@/app/admin/_lib/atoms/admin-auth-atom";
import { hasModuleAccess } from "@/app/admin/_lib/permissions";

type SidebarProps = {
  collapsed: boolean;
  closeMobile?: () => void;
};

type SidebarLink = {
  label: string;
  href: string;
  module: string | null;
};

type FlatMenuItem = SidebarLink & {
  icon: LucideIcon;
};

const USER_MANAGEMENT_ACCORDION_ID = "sidebar-user-management-children";
const EMPTY_USER_PERMISSIONS: UserPermission[] = [];

const menuItems: FlatMenuItem[] = [
  { icon: LayoutGrid, label: "Dashboard", href: "/admin/dashboard", module: "DASHBOARD" },
  { icon: BanknoteIcon, label: "Transactions", href: "/admin/transactions", module: "TRANSACTION" },
  { icon: Wallet, label: "Transient Wallets", href: adminRoutes.adminTransientWallets(), module: "TRANSIENT_WALLET" },
  { icon: Database, label: "Settlement", href: "/admin/settlement", module: "SETTLEMENT" },
  { icon: Store, label: "Outlet", href: "/admin/outlet", module: "OUTLET" },
  { icon: Ticket, label: "Customer Support", href: "/admin/tickets", module: "INCIDENCE" },
];

const userManagementAccordion = {
  label: "User Management",
  icon: Users,
  children: [
    {
      label: "Admins",
      href: adminRoutes.adminUserManagement(),
      module: "USER_MANAGEMENT",
    },
    {
      label: "Customer List",
      href: adminRoutes.adminCustomer(),
      module: "CUSTOMER",
    },
    {
      label: "Agents",
      href: adminRoutes.adminAgent(),
      module: "AGENT",
    },
  ] satisfies SidebarLink[],
};

const menuItems2: FlatMenuItem[] = [
  { icon: BanknoteIcon, label: "Regulatory & Compliance", href: "/admin/regulatory", module: "REGULATORY" },
  { icon: Database, label: "Report and Analytics", href: "/admin/report", module: "REPORTS" },
  { icon: UserStar, label: "Audit Trail", href: "/admin/audit-trail", module: "AUDIT_TRAIL" },
];

function isRouteActive(pathname: string | null, href: string): boolean {
  return pathname === href || (pathname?.startsWith(href + "/") ?? false);
}

function filterVisibleLinks(
  links: SidebarLink[],
  userPermissions: UserPermission[]
): SidebarLink[] {
  return links.filter(
    (item) => !item.module || hasModuleAccess(userPermissions, item.module)
  );
}

const linkClassName = (isActive: boolean) =>
  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
    isActive
      ? "bg-primary-00 text-primary-400"
      : "text-body-text-300 hover:bg-white hover:text-body-heading-300"
  }`;

export default function Sidebar({ collapsed, closeMobile }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const adminUser = useAtomValue(adminUserAtom);

  const displayName = adminUser?.fullName?.trim() || "Admin User";
  const displayEmail = adminUser?.email?.trim() || "No email available";
  const userPermissions = adminUser?.userPermissions ?? EMPTY_USER_PERMISSIONS;

  const visibleMenuItems = menuItems.filter(
    (item) => !item.module || hasModuleAccess(userPermissions, item.module)
  );
  const visibleMenuItems2 = menuItems2.filter(
    (item) => !item.module || hasModuleAccess(userPermissions, item.module)
  );
  const visibleUserManagementChildren = useMemo(
    () => filterVisibleLinks(userManagementAccordion.children, userPermissions),
    [userPermissions]
  );

  const activeUserManagementHref = useMemo(
    () =>
      visibleUserManagementChildren.find((child) =>
        isRouteActive(pathname, child.href)
      )?.href ?? null,
    [pathname, visibleUserManagementChildren]
  );

  const isUserManagementChildActive = activeUserManagementHref !== null;

  const [openOverride, setOpenOverride] = useState<boolean | null>(null);
  const [syncedActiveHref, setSyncedActiveHref] = useState(activeUserManagementHref);

  if (activeUserManagementHref !== syncedActiveHref) {
    setSyncedActiveHref(activeUserManagementHref);
    setOpenOverride(null);
  }

  const isUserManagementAccordionOpen =
    openOverride ?? activeUserManagementHref !== null;

  const showOthersSection =
    visibleUserManagementChildren.length > 0 || visibleMenuItems2.length > 0;

  const handleLinkClick = () => {
    if (isMobile && closeMobile) {
      closeMobile();
    }
  };

  const AccordionIcon = userManagementAccordion.icon;

  const renderUserManagementChildren = (className?: string) =>
    visibleUserManagementChildren.map(({ label, href }) => {
      const isActive = isRouteActive(pathname, href);
      return (
        <Link
          key={href}
          href={href}
          onClick={handleLinkClick}
          className={`${linkClassName(isActive)} ${className ?? "pl-9"}`}
        >
          <span className="whitespace-nowrap">{label}</span>
        </Link>
      );
    });

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

      <div className="flex-1 overflow-y-auto overflow-x-hidden px-3">
        <nav className="mt-2 space-y-1">
          {!collapsed && visibleMenuItems.length > 0 && (
            <div>
              <h5 className="px-3 mb-3 text-xs text-body-text-100 uppercase tracking-wider">
                MAIN MENU
              </h5>
            </div>
          )}

          {visibleMenuItems.map(({ icon: Icon, label, href }) => {
            const isActive = isRouteActive(pathname, href);

            return (
              <Link
                key={href}
                href={href}
                onClick={handleLinkClick}
                className={linkClassName(isActive)}
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
          {!collapsed && showOthersSection && (
            <div>
              <h5 className="px-3 mb-3 text-xs text-body-text-100 uppercase tracking-wider">
                OTHERS
              </h5>
            </div>
          )}

          {visibleUserManagementChildren.length > 0 &&
            (collapsed ? (
              <Menu position="right-start" width={200} closeOnItemClick>
                <Menu.Target>
                  <button
                    type="button"
                    aria-label={userManagementAccordion.label}
                    className={`flex w-full cursor-pointer! items-center justify-center rounded-lg px-3 py-2.5 transition-colors ${linkClassName(isUserManagementChildActive)}`}
                  >
                    <AccordionIcon className="h-5 w-5 shrink-0" />
                  </button>
                </Menu.Target>
                <Menu.Dropdown>
                  {visibleUserManagementChildren.map(({ label, href }) => (
                    <Menu.Item
                      key={href}
                      component={Link}
                      href={href}
                      onClick={handleLinkClick}
                      className={
                        isRouteActive(pathname, href) ? "bg-primary-25" : undefined
                      }
                    >
                      {label}
                    </Menu.Item>
                  ))}
                </Menu.Dropdown>
              </Menu>
            ) : (
              <div>
                <button
                  type="button"
                  aria-expanded={isUserManagementAccordionOpen}
                  aria-controls={USER_MANAGEMENT_ACCORDION_ID}
                  onClick={() =>
                    setOpenOverride(!isUserManagementAccordionOpen)
                  }
                  className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${linkClassName(isUserManagementChildActive)}`}
                >
                  <AccordionIcon className="h-5 w-5 shrink-0" />
                  <span className="flex-1 whitespace-nowrap text-left cursor-pointer! font-medium text-sm">
                    {userManagementAccordion.label}
                  </span>
                  {isUserManagementAccordionOpen ? (
                    <ChevronUp className="h-4 w-4 shrink-0" aria-hidden />
                  ) : (
                    <ChevronDown className="h-4 w-4 shrink-0" aria-hidden />
                  )}
                </button>
                {isUserManagementAccordionOpen && (
                  <div
                    id={USER_MANAGEMENT_ACCORDION_ID}
                    className="mt-1 space-y-1"
                  >
                    {renderUserManagementChildren()}
                  </div>
                )}
              </div>
            ))}

          {visibleMenuItems2.map(({ icon: Icon, label, href }) => {
            const isActive = isRouteActive(pathname, href);

            return (
              <Link
                key={href}
                href={href}
                onClick={handleLinkClick}
                className={linkClassName(isActive)}
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

      {!collapsed && (
        <div
          className="p-4 space-y-4 cursor-pointer hover:bg-gray-50/50! rounded-lg transition-colors mx-1 my-2"
          onClick={() => router.push(adminRoutes.adminSettings())}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-50 flex items-center justify-center overflow-hidden shrink-0">
              <Avatar name={displayName} color="initials" />
            </div>
            <div className="overflow-hidden flex-1">
              <p className="font-medium text-xs text-body-heading-300 truncate">
                {displayName}
              </p>
              <p className="text-body-text-100 text-xs truncate">
                {displayEmail}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
