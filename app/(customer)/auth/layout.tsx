"use client";

import { usePathname } from "next/navigation";
import { AuthLayout } from "@/app/(customer)/_components/auth/AuthLayout";

export default function AuthRouteLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const variant = pathname?.includes("/auth/login") ? "login" : "default";

  return <AuthLayout variant={variant}>{children}</AuthLayout>;
}
