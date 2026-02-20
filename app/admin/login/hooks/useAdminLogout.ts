"use client";

import { useSetAtom } from "jotai";
import { useRouter } from "next/navigation";
import { adminUserAtom } from "@/app/admin/_lib/atoms/admin-auth-atom";
import { adminApi } from "@/app/admin/_services/admin-api";
import { adminRoutes } from "@/lib/adminRoutes";

/**
 * Returns a logout function that:
 * 1. Calls the logout API endpoint (best-effort — session is cleared locally regardless)
 * 2. Clears the adminUserAtom (removes "admin_auth" from localStorage)
 * 3. Redirects to the admin login page
 */
export function useAdminLogout() {
  const setAdminUser = useSetAtom(adminUserAtom);
  const router = useRouter();

  const logout = async () => {
    try {
      await adminApi.auth.logout();
    } catch {
      // Ignore API errors — clear the local session regardless
    } finally {
      setAdminUser(null);
      router.replace(adminRoutes.adminLogin());
    }
  };

  return logout;
}
