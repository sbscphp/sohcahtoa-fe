"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminRoutes } from "@/lib/adminRoutes";

export default function LegacyWorkflowCreateRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace(adminRoutes.adminSettingsWorkflowCreate());
  }, [router]);

  return null;
}
