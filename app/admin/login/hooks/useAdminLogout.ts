"use client";

import { useState } from "react";
import { useSetAtom } from "jotai";
import { useRouter } from "next/navigation";
import { adminUserAtom } from "@/app/admin/_lib/atoms/admin-auth-atom";
import { adminApi } from "@/app/admin/_services/admin-api";
import { adminRoutes } from "@/lib/adminRoutes";

/**
 * Returns helpers for a two-step logout flow:
 * - `logout()` — calls the API and clears credentials (no redirect).
 * - `redirectToLogin()` — navigates to the admin login page.
 * - `isLoggingOut` — loading flag for UI feedback.
 */
export function useAdminLogout() {
  const setAdminUser = useSetAtom(adminUserAtom);
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = async () => {
    setIsLoggingOut(true);
    try {
      await adminApi.auth.logout();
    } catch {
      // Ignore API errors — clear the local session regardless
    } finally {
      setAdminUser(null);
      setIsLoggingOut(false);
    }
  };

  const redirectToLogin = () => {
    router.replace(adminRoutes.adminLogin());
  };

  return { logout, redirectToLogin, isLoggingOut };
}
