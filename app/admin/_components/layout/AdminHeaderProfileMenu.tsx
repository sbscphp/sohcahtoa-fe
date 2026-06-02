"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { Avatar, Popover } from "@mantine/core";
import { useAtomValue } from "jotai";
import { adminRoutes } from "@/lib/adminRoutes";
import {
  adminUserAtom,
  type UserPermission,
} from "@/app/admin/_lib/atoms/admin-auth-atom";
import { hasModuleAccess } from "@/app/admin/_lib/permissions";
import { useAdminLogout } from "../../login/hooks/useAdminLogout";
import { ConfirmationModal } from "../ConfirmationModal";
import { SuccessModal } from "../SuccessModal";

const BASE_SETTING_TABS = [
  { value: "account", label: "Account Information", href: adminRoutes.adminSettingsAccountInformation },
  { value: "password", label: "Password", href: adminRoutes.adminSettingsPassword },
  { value: "notifications", label: "Notifications", href: adminRoutes.adminSettingsNotifications },
  { value: "pickup-stations", label: "Pick-Up Stations", href: adminRoutes.adminSettingsPickupStations },
] as const;

const RATE_TAB = {
  value: "rates",
  label: "Rate Management",
  href: adminRoutes.adminSettingsRates,
} as const;

const EMPTY_USER_PERMISSIONS: UserPermission[] = [];

export default function AdminHeaderProfileMenu() {
  const adminUser = useAtomValue(adminUserAtom);
  const { logout, redirectToLogin, isLoggingOut } = useAdminLogout();

  const displayName = adminUser?.fullName?.trim() || "Admin User";
  const displayEmail = adminUser?.email?.trim() || "No email available";

  const userPermissions = adminUser?.userPermissions ?? EMPTY_USER_PERMISSIONS;
  const hasRateAccess = hasModuleAccess(userPermissions, "RATE");

  const settingsMenuItems = useMemo(
    () => (hasRateAccess ? [...BASE_SETTING_TABS, RATE_TAB] : [...BASE_SETTING_TABS]),
    [hasRateAccess]
  );

  const [popoverOpen, setPopoverOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const handleLogoutClick = () => {
    setPopoverOpen(false);
    setConfirmOpen(true);
  };

  const handleLogoutConfirm = async () => {
    await logout();
    setConfirmOpen(false);
    setSuccessOpen(true);
  };

  const handleSuccessDismiss = () => {
    setSuccessOpen(false);
    redirectToLogin();
  };

  return (
    <>
      <Popover
        position="bottom-end"
        shadow="md"
        withArrow
        opened={popoverOpen}
        closeOnClickOutside
        closeOnEscape
        onClose={() => setPopoverOpen(false)}
      >
        <Popover.Target>
          <button
            type="button"
            onClick={() => setPopoverOpen((v) => !v)}
            className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-gray-50 transition-colors hover:bg-gray-50"
            aria-label="Profile menu"
            aria-expanded={popoverOpen}
          >
            <Avatar name={displayName} className="cursor-pointer" color="initials" size={32} radius="xl" />
          </button>
        </Popover.Target>

        <Popover.Dropdown className="w-64 rounded-xl border border-gray-50 p-0">
          <div className="flex items-center gap-3 border-b border-gray-50 px-4 py-3">
            <Avatar name={displayName} color="initials" size={40} radius="xl" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-body-heading-300">
                {displayName}
              </p>
              <p className="truncate text-xs text-body-text-100">{displayEmail}</p>
            </div>
          </div>

          <nav className="py-1">
            {settingsMenuItems.map((item) => (
              <Link
                key={item.value}
                href={item.href()}
                onClick={() => setPopoverOpen(false)}
                className="block px-4 py-2.5 text-sm text-body-heading-300 transition-colors hover:bg-gray-50"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="border-t border-gray-50 py-1">
            <button
              type="button"
              onClick={handleLogoutClick}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-primary-400 transition-colors hover:bg-gray-50"
            >
              <LogOut size={16} className="shrink-0" />
              Log out
            </button>
          </div>
        </Popover.Dropdown>
      </Popover>

      <ConfirmationModal
        opened={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Log Out"
        message="Are you sure you want to log out?"
        primaryButtonText="Yes, Log Out"
        secondaryButtonText="Cancel"
        onPrimary={handleLogoutConfirm}
        loading={isLoggingOut}
      />

      <SuccessModal
        opened={successOpen}
        onClose={handleSuccessDismiss}
        title="Logged Out"
        message="You have been successfully logged out."
        primaryButtonText="Go to Login"
        onPrimaryClick={handleSuccessDismiss}
      />
    </>
  );
}
