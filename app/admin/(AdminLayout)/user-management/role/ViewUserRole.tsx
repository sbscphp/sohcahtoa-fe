"use client";

import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import {
  Button,
  Card,
  Divider,
  Group,
  Stack,
  Text,
  Menu,
} from "@mantine/core";
import { useState } from "react";
import { ConfirmationModal } from "@/app/admin/_components/ConfirmationModal";
import { SuccessModal } from "@/app/admin/_components/SuccessModal";
import { CustomerStatus } from "../../customer/[id]/page";
import { useRouter } from "next/navigation";
import UserActivitiesTable from "../user/[id]/UserActivitiesTable";
import { EditUserModal } from "../user/[id]/EditUserModal";

export default function ViewAdminUserDetails() {
    const router = useRouter();
  const [status, setStatus] = useState<CustomerStatus>("Active");
  const [editOpen, setEditOpen] = useState(false);
  const isCurrentlyActive = status === "Active";
  const actionVerb = isCurrentlyActive ? "Deactivate" : "Reactivate";
  const pastTenseVerb = isCurrentlyActive ? "Deactivated" : "Reactivated";
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const handleToggleClick = () => {
    setIsConfirmOpen(true);
  };

  const handleConfirm = () => {
    setStatus((prev) => (prev === "Active" ? "Deactivated" : "Active"));
    setIsConfirmOpen(false);
    setIsSuccessOpen(true);
  };

  // ✅ Single source of truth for user details
  const userDetails = {
    fullName: "Adekunle Ibrahim Olamide",
    email: "olamide@socatoa.com",
    branch: "Lagos State Branch",
    department: "Audit and Internal Control",
    role: "Audit and Internal Control Role",
  };
  const handleViewAllCustomers = () => {
    router.push("/admin/user-management");
  };

  return (
    <>
      <div className="space-y-6">
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
                  <StatusBadge status={status} />
                </Group>
              </Stack>

              {/* Take Action */}
              <Menu position="bottom-end" radius="md" shadow="sm">
                <Menu.Target>
                  <Button color="orange" radius="xl">
                    Take Action
                  </Button>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Item onClick={() => setEditOpen(true)}>
                    Edit
                  </Menu.Item>

                  <Divider />

                  <Menu.Item color="red" onClick={handleToggleClick}>{isCurrentlyActive ? "Deactivate" : "Reactivate"}</Menu.Item>
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

      <div className="my-6">
        <UserActivitiesTable />
      </div>

      {/* ✅ Edit User Modal */}
      <EditUserModal
        opened={editOpen}
        onClose={() => setEditOpen(false)}
        user={userDetails}
        onSave={(updatedUser) => {
          console.log("Updated user:", updatedUser);
          setEditOpen(false);
        }}
      />

      {/* Deactivate / Reactivate confirmation modal */}
      <ConfirmationModal
        opened={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title={`${actionVerb} User ?`}
        message={`Are you sure, ${actionVerb.toLowerCase()} this admin user? Kindly note that system access would be ${
          isCurrentlyActive
            ? "temporarily suspended, until the admin user is reactivated"
            : "restored therefore this admin user would now be able to access the system according to their role and related permissions"
        }`}
        primaryButtonText={`Yes, ${actionVerb} User`}
        secondaryButtonText="No, Close"
        onPrimary={handleConfirm}
      />

      {/* Success modal */}
      <SuccessModal
        opened={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        title={`Customer ${pastTenseVerb}`}
        message={`Admin user has been successfully ${pastTenseVerb.toLowerCase()}.`}
        primaryButtonText="Manage User"
        onPrimaryClick={handleViewAllCustomers}
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
