"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useAtomValue } from "jotai";
import { useRouter, usePathname } from "next/navigation";
import { adminUserAtom, adminAccessTokenAtom } from "@/app/admin/_lib/atoms/admin-auth-atom";
import { apiClient } from "@/app/_lib/api/client";
import { adminRoutes } from "@/lib/adminRoutes";
import { useTokenExpiry } from "@/app/admin/_hooks/useTokenExpiry";
import { getRequiredModule, hasModuleAccess } from "@/app/admin/_lib/permissions";
import { UnauthorizedView } from "@/app/admin/_components/UnauthorizedView";

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

const emptySubscribe = () => () => {};

/**
 * Protects all admin layout routes.
 *
 * - Reads the persisted adminUserAtom (backed by localStorage "admin_auth").
 *   The atom is initialized synchronously from localStorage on module load, so
 *   the stored session is available on the very first render — no async race.
 * - Wires the admin access token into the shared apiClient singleton.
 * - Redirects to /admin/login when no valid session exists.
 * - Renders UnauthorizedView when the user lacks the required module permission
 *   for the current route.
 *
 * Rendering is deferred until after client hydration to prevent a flash
 * caused by the server not having access to localStorage.
 */
export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const adminUser = useAtomValue(adminUserAtom);
  const accessToken = useAtomValue(adminAccessTokenAtom);

  // Returns false on the server, true on the client — no setState needed.
  const hydrated = useSyncExternalStore(emptySubscribe, () => true, () => false);

  // Set the token getter synchronously during render so that any child query
  // fired in the same commit already has the correct token available.
  // The captured `accessToken` variable is stable for this render cycle.
  apiClient.setAuthTokenGetter(() => accessToken);

  // Watch token expiry: shows a warning notification and clears the session
  // when the access token expires.
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

  // Check module-level permission for the current route.
  const requiredModule = getRequiredModule(pathname);
  const canAccess =
    requiredModule === undefined ||
    requiredModule === null ||
    hasModuleAccess(adminUser.userPermissions ?? [], requiredModule);

  if (!canAccess) {
    return <UnauthorizedView />;
  }

  return <>{children}</>;
}
