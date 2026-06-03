"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminRoutes } from "@/lib/adminRoutes";

export default function RateManagementRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace(adminRoutes.adminSettingsRates());
  }, [router]);

  return null;
}
