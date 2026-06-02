"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { adminRoutes } from "@/lib/adminRoutes";

export default function LegacyWorkflowDetailsRedirect() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

  useEffect(() => {
    if (!id) return;
    router.replace(adminRoutes.adminSettingsWorkflowDetails(id));
  }, [id, router]);

  return null;
}
