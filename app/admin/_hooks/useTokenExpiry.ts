"use client";

import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";
import { adminUserAtom } from "@/app/admin/_lib/atoms/admin-auth-atom";
import { adminRoutes } from "@/lib/adminRoutes";

const WARNING_BEFORE_EXPIRY_MS = 60_000; // 1 minute

/**
 * Decode JWT payload with base64url support (handles `-` and `_` characters
 * and missing padding that standard `atob` rejects).
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    return JSON.parse(atob(padded)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Returns the JWT `exp` claim as milliseconds since epoch, or null when
 * the claim is absent or unparseable.
 * Normalizes unix-seconds (the standard) vs the rarer millisecond form.
 */
function getJwtExpiryMs(token: string): number | null {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;
  const exp = payload.exp;
  if (typeof exp !== "number" && typeof exp !== "string") return null;
  const n = typeof exp === "string" ? Number(exp) : exp;
  if (!Number.isFinite(n)) return null;
  // Standard JWT exp is unix seconds (~1e9–1e10). Values above 1e10 are
  // already in milliseconds.
  return n > 10_000_000_000 ? n : n * 1000;
}

/**
 * Watches the admin access token expiry and:
 * - Shows a warning notification 1 minute before expiry.
 * - Clears the admin session and redirects to login when the token expires.
 *
 * No proactive refresh is attempted here because the admin auth service uses
 * its own token lifecycle; 401 responses from the API client already handle
 * mid-session expiry via the shared `apiClient` error handler.
 */
export function useTokenExpiry(accessToken: string | null | undefined): void {
  const setAdminUser = useSetAtom(adminUserAtom);
  const router = useRouter();

  useEffect(() => {
    if (!accessToken) return;

    const expiryMs = getJwtExpiryMs(accessToken);
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
