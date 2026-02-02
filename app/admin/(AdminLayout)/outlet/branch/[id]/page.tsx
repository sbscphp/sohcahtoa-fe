"use client";

import { useParams, useRouter } from "next/navigation";
import { Text, Group, Button } from "@mantine/core";
import { ArrowLeft } from "lucide-react";
import { adminRoutes } from "@/lib/adminRoutes";
import { DetailItem } from "@/app/admin/_components/DetailItem";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";

export default function BranchDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id ?? "";

  // Placeholder data – replace with API when available
  const branch = {
    id,
    name: "Eternal Global",
    managerName: "Tunde Bashorun",
    managerEmail: "tunde@eternalglobal.com",
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
              {branch.name}
            </Text>
            <Text size="sm" c="dimmed">
              ID: {branch.id}
            </Text>
          </div>
          <StatusBadge status={branch.status} />
        </Group>

        <div className="grid gap-6 sm:grid-cols-2">
          <DetailItem label="Branch Manager" value={branch.managerName} />
          <DetailItem label="Email" value={branch.managerEmail} />
          <DetailItem label="Address" value={branch.address} />
        </div>
      </div>
    </div>
  );
}
