"use client";

import { useRouter } from "next/navigation";
import { useAtomValue } from "jotai";
import { Text } from "@mantine/core";
import { ShieldOff, ArrowLeft } from "lucide-react";
import { adminUserAtom } from "@/app/admin/_lib/atoms/admin-auth-atom";
import { getFirstAccessibleRoute } from "@/app/admin/_lib/permissions";
import { CustomButton } from "@/app/admin/_components/CustomButton";

export function UnauthorizedView() {
  const router = useRouter();
  const adminUser = useAtomValue(adminUserAtom);

  const handleBack = () => {
    const hasPreviousHistory =
      typeof window !== "undefined" && window.history.length > 1;

    if (hasPreviousHistory) {
      router.back();
    } else {
      const fallback = getFirstAccessibleRoute(
        adminUser?.userPermissions ?? []
      );
      router.push(fallback);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="mb-6 flex items-center justify-center w-20 h-20 rounded-full bg-orange-50">
        <ShieldOff className="w-10 h-10 text-primary-400" strokeWidth={1.5} />
      </div>

      <Text fw={700} size="xl" c="dark" mb="xs">
        Access Restricted
      </Text>

      <Text size="sm" c="dimmed" maw={420} mb="xl">
        You don&apos;t have permission to view this page. Contact your
        administrator if you believe this is a mistake.
      </Text>

      <CustomButton
        buttonType="secondary"
        leftSection={<ArrowLeft className="w-4 h-4" />}
        onClick={handleBack}
      >
        Go Back
      </CustomButton>
    </div>
  );
}
