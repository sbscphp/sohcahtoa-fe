"use client";

import { useParams, useRouter } from "next/navigation";
import { Text, Group, Button } from "@mantine/core";
import { ArrowLeft } from "lucide-react";
import { adminRoutes } from "@/lib/adminRoutes";
import { DetailItem } from "@/app/admin/_components/DetailItem";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";

export default function FranchiseDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id ?? "";

  // Placeholder data – replace with API when available
  const franchise = {
    id,
    name: "Eternal Global",
    contactName: "Tunde Bashorun",
    contactEmail: "tunde@eternalglobal.com",
    address: "Plot 10, Off Jibowu Street, Lagos",
    status: "Active" as const,
  };

  return (
    <div className="space-y-6">
      <Button
        variant="subtle"
        leftSection={<ArrowLeft size={16} />}
        color="dark"
        onClick={() => router.push(adminRoutes.adminOutlet())}
      >
        Back to Outlet
      </Button>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <Group justify="space-between" mb="lg">
          <div>
            <Text size="xl" fw={600}>
              {franchise.name}
            </Text>
            <Text size="sm" c="dimmed">
              ID: {franchise.id}
            </Text>
          </div>
          <StatusBadge status={franchise.status} />
        </Group>

        <div className="grid gap-6 sm:grid-cols-2">
          <DetailItem label="Contact Person" value={franchise.contactName} />
          <DetailItem label="Email" value={franchise.contactEmail} />
          <DetailItem label="Address" value={franchise.address} />
        </div>
      </div>
    </div>
  );
}
