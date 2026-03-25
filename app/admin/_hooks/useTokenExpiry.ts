"use client";

import { startTransition, useEffect, useState } from "react";
import { useSetAtom } from "jotai";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";
import {
  adminUserAtom,
  type AdminUser,
} from "@/app/admin/_lib/atoms/admin-auth-atom";
import { adminRoutes } from "@/lib/adminRoutes";
import { apiClient } from "@/app/_lib/api/client";
import { API_ENDPOINTS } from "@/app/_lib/api/endpoints";
import type { RefreshTokenResponse } from "@/app/_lib/api/types";

const WARNING_BEFORE_EXPIRY_MS = 60_000; // 1 minute
/** On load, refresh if the access token expires within this window. */
const REFRESH_BEFORE_EXPIRY_MS = 30_000;

/**
 * Decode JWT payload segment with base64url support.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const json = atob(padded);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Returns JWT `exp` as milliseconds since epoch, or null if missing/invalid.
 * Normalizes seconds vs milliseconds (typical JWT exp is unix seconds).
 */
function getJwtExpiryMs(token: string): number | null {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;
  const exp = payload.exp;
  if (typeof exp !== "number" && typeof exp !== "string") return null;
  const n = typeof exp === "string" ? Number(exp) : exp;
  if (!Number.isFinite(n)) return null;
  // Unix exp is ~1e9–1e10; if much larger, treat as already in ms.
  if (n > 10_000_000_000) return n;
  return n * 1000;
}

/**
 * Watches admin access token expiry and refreshes via `/api/auth/refresh`
 * instead of logging out immediately. Clears session only when refresh fails or
 * there is no refresh token and the access token is already expired.
 */
export function useTokenExpiry(
  adminUser: AdminUser | null,
  accessToken: string | null | undefined
): { isRefreshing: boolean } {
  const setAdminUser = useSetAtom(adminUserAtom);
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!adminUser) {
      startTransition(() => {
        setIsRefreshing(false);
      });
      return;
    }

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const clearTimers = () => {
      timers.forEach(clearTimeout);
      notifications.hide("session-expiry-warning");
    };

    const invalidateSession = () => {
      setAdminUser(null);
      router.replace(adminRoutes.adminLogin());
    };

    const applyNewTokens = (data: {
      accessToken: string;
      refreshToken: string;
    }) => {
      setAdminUser((prev) =>
        prev
          ? {
              ...prev,
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
            }
          : null
      );
    };

    const doRefresh = async (rt: string): Promise<boolean> => {
      try {
        const res = await apiClient.post<RefreshTokenResponse>(
          API_ENDPOINTS.auth.refresh,
          { refreshToken: rt },
          { skipAuth: true }
        );
        if (res.success && res.data?.accessToken && res.data?.refreshToken) {
          applyNewTokens({
            accessToken: res.data.accessToken,
            refreshToken: res.data.refreshToken,
          });
          return true;
        }
        return false;
      } catch {
        return false;
      }
    };

    void (async () => {
      const refreshToken = adminUser.refreshToken;
      const token = accessToken ?? adminUser.accessToken ?? null;

      if (!token) {
        if (refreshToken) {
          if (!cancelled) setIsRefreshing(true);
          const ok = await doRefresh(refreshToken);
          if (!cancelled) setIsRefreshing(false);
          if (!ok && !cancelled) invalidateSession();
        }
        return;
      }

      const expiryMs = getJwtExpiryMs(token);
      if (!expiryMs) {
        return;
      }

      const now = Date.now();
      const msUntilExpiry = expiryMs - now;

      if (msUntilExpiry <= REFRESH_BEFORE_EXPIRY_MS) {
        if (!refreshToken) {
          if (msUntilExpiry <= 0 && !cancelled) invalidateSession();
          return;
        }
        if (!cancelled) setIsRefreshing(true);
        const ok = await doRefresh(refreshToken);
        if (!cancelled) setIsRefreshing(false);
        if (!ok && !cancelled) invalidateSession();
        return;
      }

      const warningDelay = msUntilExpiry - WARNING_BEFORE_EXPIRY_MS;
      if (warningDelay > 0) {
        timers.push(
          setTimeout(() => {
            if (cancelled) return;
            notifications.show({
              id: "session-expiry-warning",
              title: "Session Expiring Soon",
              message:
                "Your session will expire in 1 minute. Please save your work.",
              color: "yellow",
              autoClose: false,
            });
          }, warningDelay)
        );
      }

      const refreshDelay = msUntilExpiry - REFRESH_BEFORE_EXPIRY_MS;
      timers.push(
        setTimeout(() => {
          if (cancelled) return;
          notifications.hide("session-expiry-warning");
          void (async () => {
            if (cancelled) return;
            if (!refreshToken) {
              notifications.show({
                title: "Session Expired",
                message: "Your session has expired. Please log in again.",
                color: "red",
                autoClose: 5000,
              });
              invalidateSession();
              return;
            }
            setIsRefreshing(true);
            const ok = await doRefresh(refreshToken);
            if (!cancelled) setIsRefreshing(false);
            if (!ok && !cancelled) invalidateSession();
          })();
        }, Math.max(0, refreshDelay))
      );
    })();

    return () => {
      cancelled = true;
      clearTimers();
    };
  }, [adminUser, accessToken, router, setAdminUser]);

  return { isRefreshing };
}
