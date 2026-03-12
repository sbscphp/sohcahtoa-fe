"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useAtomValue } from "jotai";
import { useRouter } from "next/navigation";
import { adminUserAtom, adminAccessTokenAtom } from "@/app/admin/_lib/atoms/admin-auth-atom";
import { apiClient } from "@/app/_lib/api/client";
import { adminRoutes } from "@/lib/adminRoutes";
import { useTokenExpiry } from "@/app/admin/_hooks/useTokenExpiry";

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

const emptySubscribe = () => () => {};

/**
 * Protects all admin layout routes.
 *
 * - Reads the persisted adminUserAtom (backed by localStorage "admin_auth")
 * - Wires the admin access token into the shared apiClient singleton
 * - Redirects to /admin/login when no valid session exists
 *
 * Rendering is deferred until after client hydration to prevent a flash
 * caused by the atom reading localStorage (which is unavailable on the server).
 */
export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const router = useRouter();
  const adminUser = useAtomValue(adminUserAtom);
  const accessToken = useAtomValue(adminAccessTokenAtom);

  // Returns false on the server, true on the client — no setState needed.
  const hydrated = useSyncExternalStore(emptySubscribe, () => true, () => false);

  // Keep the apiClient token in sync with the admin session at all times.
  useEffect(() => {
    apiClient.setAuthTokenGetter(() => accessToken);
  }, [accessToken]);

  // Track token expiry and clear session + redirect when it expires.
  useTokenExpiry(accessToken);

  // Redirect once hydration confirms there is no active session.
  useEffect(() => {
    if (hydrated && !adminUser) {
      router.replace(adminRoutes.adminLogin());
    }
  }, [hydrated, adminUser, router]);

  if (!hydrated || !adminUser) {
    return null;
  }

  return <>{children}</>;
}
