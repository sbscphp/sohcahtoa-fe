"use client";

import { useState } from "react";
import {
  Button,
  Card,
  Divider,
  Group,
  Stack,
  Text,
  Menu,
  Accordion,
  Checkbox,
  Switch,
} from "@mantine/core";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { ConfirmationModal } from "@/app/admin/_components/ConfirmationModal";
import { SuccessModal } from "@/app/admin/_components/SuccessModal";
import { CustomerStatus } from "../../../customer/[id]/page";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { PermissionRowProps } from "../RolePermissionModal";



export default function ViewAdminRoleDetails() {
  const router = useRouter();

  const [status, setStatus] = useState<CustomerStatus>("Deactivated");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const isActive = status === "Active";
  const actionVerb = isActive ? "Deactivate" : "Reactivate";
  const pastTenseVerb = isActive ? "Deactivated" : "Reactivated";

  const handleConfirm = () => {
    setStatus(isActive ? "Deactivated" : "Active");
    setConfirmOpen(false);
    setSuccessOpen(true);
  };
  function PermissionRow({ label }: PermissionRowProps) {
    return (
      <Group justify="space-between" py="sm" className="border-b border-[#E1E0E0]">
        <Text size="sm">{label}</Text>

        <Group gap="xl">
          <Checkbox labelPosition="left" variant="outline" radius="xl" label="Can View" />
          <Checkbox labelPosition="left" variant="outline" radius="xl" label="Can Edit" />
        </Group>
      </Group>
    );
  }

  return (
    <>
      <Card radius="lg" p="xl">
        <Stack gap="xl">
          {/* Header */}
          <Group justify="space-between" align="flex-start">
            <Stack gap={4}>
              <Text fw={600} size="lg">
                Internal Control and Audit Role
              </Text>

              <Group gap="sm">
                <Text size="xs" c="dimmed">
                  <b>Date Created:</b> Nov 17, 2025 | 11:00am
                </Text>
                <StatusBadge status={status} />
              </Group>
            </Stack>

            {/* Take Action */}
            <Menu position="bottom-end" radius="md">
              <Menu.Target>
                <Button color="orange" radius="xl">
                  Take Action
                </Button>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item>View</Menu.Item>
                <Menu.Item>Edit</Menu.Item>
                
                <Menu.Item color="red" onClick={() => setConfirmOpen(true)}>
                  {actionVerb}
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>

          {/* Role Details */}
          <Text fw={600} c="orange" size="sm">
            Role Details
          </Text>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-y-6 gap-x-12">
            <DetailItem label="Permissions" value="4" />
            <DetailItem label="Users" value="24" />
            <DetailItem label="Branch" value="Lagos Branch" />
            <DetailItem label="Department" value="Audit and Internal Control" />
            <div>
              <Text size="xs" c="dimmed" mb={4}>
                Set As Default Role
              </Text>
              <div className=" flex items-center gap-2">
                <Switch defaultChecked color="orange" />
                <Text size="sm" fw={500}>
                  On
                </Text>
              </div>
            </div>
            <DetailItem label="Role ID" value="2782649" />
            <DetailItem
              label="Description"
              value="This is the internal control unit..."
            />
          </div>

          {/* Permissions */}
          <Text fw={600} c="orange" size="sm">
            Permissions
          </Text>

          <Accordion radius="md" variant="separated">
            {[
              "Transaction Management",
              "Customer Management",
              "Franchise Management",
              "Agent Management",
            ].map((permission) => (
              <Accordion.Item key={permission} value={permission}>
                <Accordion.Control
                  icon={<Checkbox variant="outline" checked color="orange" />}
                  chevron={<ChevronDown size={18} />}
                >
                  <Text size="sm" fw={500}>
                    {permission}
                  </Text>
                </Accordion.Control>

                <Accordion.Panel>
                  <Stack gap="xs" ml="lg">
                  <PermissionRow label="Sub-Feature 01" />
                  <PermissionRow label="Sub-Feature 02" />
                  <PermissionRow label="Sub-Feature 03" />
                  <PermissionRow label="Sub-Feature 04" />
                  <PermissionRow label="Sub-Feature 05" />
                </Stack>
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
        </Stack>
      </Card>

      {/* Confirm Modal */}
      <ConfirmationModal
        opened={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={`${actionVerb} Role ?`}
        message={`Are you sure you want to ${actionVerb.toLowerCase()} this role?`}
        primaryButtonText={`Yes, ${actionVerb} Role`}
        secondaryButtonText="No, Close"
        onPrimary={handleConfirm}
      />

      {/* Success Modal */}
      <SuccessModal
        opened={successOpen}
        onClose={() => setSuccessOpen(false)}
        title={`Role ${pastTenseVerb}`}
        message={`Role has been successfully ${pastTenseVerb.toLowerCase()}.`}
        primaryButtonText="Manage Roles"
        onPrimaryClick={() => router.push("/admin/roles")}
        secondaryButtonText="No, Close"
      />
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
