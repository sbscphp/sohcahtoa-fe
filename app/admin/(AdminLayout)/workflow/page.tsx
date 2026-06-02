"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminRoutes } from "@/lib/adminRoutes";

export default function LegacyWorkflowRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace(adminRoutes.adminTransactionsWorkflows());
  }, [router]);

  return null;
}
