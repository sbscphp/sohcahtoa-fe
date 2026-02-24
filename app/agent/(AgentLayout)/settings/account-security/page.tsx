"use client";

import FxTransactionTypeCard from "@/app/(customer)/_components/FxTransactionTypeCard";
import { Shield, KeyRound } from "lucide-react";

const SECURITY_OPTIONS = [
  {
    icon: Shield,
    title: "Create Security Question",
    description:
      "Create security questions, update your login password to keep your account secure.",
    href: "/agent/settings/account-security/set-security-question",
  },
  {
    icon: KeyRound,
    title: "Change Password",
    description: "Update your login password to keep your account secure.",
    href: "/agent/settings/change-password",
  },
] as const;

export default function AccountSecurityPage() {
  return (
    <div className="space-y-8 rounded-2xl bg-white p-4 md:p-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {SECURITY_OPTIONS.map((opt, i) => (
          <FxTransactionTypeCard
            key={i}
            icon={<opt.icon className="size-6 text-primary-400" />}
            title={opt.title}
            description={opt.description}
            href={opt.href}
          />
        ))}
      </div>
    </div>
  );
}
