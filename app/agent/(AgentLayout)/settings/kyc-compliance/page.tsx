"use client";

import SectionCard from "@/app/(customer)/_components/dashboard/SectionCard";
import { Text } from "@mantine/core";

export default function KYCCompliancePage() {
  return (
    <SectionCard className="rounded-2xl p-4 md:p-6">
      <div className="space-y-4">
        <Text size="lg" fw={600}>
          KYC and Compliance
        </Text>
        <Text size="sm" c="dimmed">
          KYC and compliance information will be displayed here.
        </Text>
      </div>
    </SectionCard>
  );
}
