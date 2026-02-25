"use client";

import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";
import { adminUserAtom } from "@/app/admin/_lib/atoms/admin-auth-atom";
import { adminRoutes } from "@/lib/adminRoutes";

const WARNING_BEFORE_EXPIRY_MS = 60_000; // 1 minute

function getJwtExpiry(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

/**
 * Watches the access token expiry decoded from the JWT and:
 * - Shows a warning notification 1 minute before expiry.
 * - Clears the admin session and redirects to login on expiry.
 */
export function useTokenExpiry(accessToken: string | null | undefined) {
  const setAdminUser = useSetAtom(adminUserAtom);
  const router = useRouter();

  useEffect(() => {
    if (!accessToken) return;

    const expiryMs = getJwtExpiry(accessToken);
    if (!expiryMs) return;

    const now = Date.now();
    const msUntilExpiry = expiryMs - now;

    if (msUntilExpiry <= 0) {
      setAdminUser(null);
      router.replace(adminRoutes.adminLogin());
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];

    const warningDelay = msUntilExpiry - WARNING_BEFORE_EXPIRY_MS;
    if (warningDelay > 0) {
      timers.push(
        setTimeout(() => {
          notifications.show({
            id: "session-expiry-warning",
            title: "Session Expiring Soon",
            message: "Your session will expire in 1 minute. Please save your work.",
            color: "yellow",
            autoClose: false,
          });
        }, warningDelay)
      );
    }

    timers.push(
      setTimeout(() => {
        notifications.hide("session-expiry-warning");
        notifications.show({
          title: "Session Expired",
          message: "Your session has expired. Please log in again.",
          color: "red",
          autoClose: 5000,
        });
        setAdminUser(null);
        router.replace(adminRoutes.adminLogin());
      }, msUntilExpiry)
    );

    return () => {
      timers.forEach(clearTimeout);
      notifications.hide("session-expiry-warning");
    };
  }, [accessToken, setAdminUser, router]);
}
