"use client";

import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import {
  Badge,
  Button,
  Card,
  Divider,
  Group,
  Select,
  Stack,
  Text,
  Menu
} from "@mantine/core";
import { useRouter } from "next/navigation";
import UserActivitiesTable from "./UserActivitiesTable";
import { ChevronDown, UserX, UserCheck } from "lucide-react";

export default function ViewAdminUserDetails() {
  const router = useRouter();

  return (
    <>
      <div className=" space-y-6">
        {/* Main Card */}
        <Card radius="lg" p="lg">
          <Stack gap="xl">
            {/* Header */}
            <Group justify="space-between" align="flex-start">
              <Stack gap={4}>
                <Text fw={600} size="lg">
                  Adekunle Ibrahim
                </Text>

                <Group gap="sm">
                  <Text size="xs" c="dimmed">
                    Date Created: Nov 17, 2025 | 11:00am
                  </Text>
                  <StatusBadge status="Active" />
                </Group>
              </Stack>
              <Menu position="bottom-end" radius="md" shadow="sm">
      <Menu.Target>
        <Button
          color="orange"
          radius="xl"
        >
          Take Action
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item
          onClick={() => {}}
        >
          Edit
        </Menu.Item>
        <Divider />

        <Menu.Item
          onClick={() => {}}
        >
          Deactivate
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
    </Group>
            {/* Section Title */}
            <Text fw={600} c="orange" size="sm">
              User Details
            </Text>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-y-6 gap-x-10">
              <DetailItem label="User ID" value="2223334355" />
              <DetailItem label="Role" value="Internal Control and Audit" />
              <DetailItem label="Position" value="Head of Internal Control" />
              <DetailItem label="Last Active" value="September 22, 2025" />

              <DetailItem label="Email Address" value="adekunle@socahoa.com" />
              <DetailItem label="Phone Number" value="+234 90 4747 2791" />
              <DetailItem label="Branch" value="Lagos Branch" />
              <DetailItem
                label="Department"
                value="Audit and Internal Control"
              />
            </div>
          </Stack>
        </Card>
      </div>
      <div className=" my-6">
        <UserActivitiesTable />
      </div>
    </>
  );
}

/* --------------------------------------------
 Reusable Detail Item
--------------------------------------------- */
function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Text size="xs" c="dimmed" mb={4}>
        {label}
      </Text>
      <Text size="sm" fw={500}>
        {value}
      </Text>
    </div>
  );
}
