"use client";


import { ConfirmationModal } from "@/app/admin/_components/ConfirmationModal";
import { SuccessModal } from "@/app/admin/_components/SuccessModal";
import {
  Modal,
  Text,
  Stack,
  Group,
  Checkbox,
  Button,
  Accordion,
} from "@mantine/core";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface RolePermissionModalProps {
  opened: boolean;
  onClose: () => void;
  onContinue: () => void;
}
export interface PermissionRowProps {
  label: string;
}

export function RolePermissionModal({
  opened,
  onClose,
  onContinue,
}: RolePermissionModalProps) {
    const router = useRouter();
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isSuccessOpen, setIsSuccessOpen] = useState(false);
    const handleConfirm = () => {
    setIsConfirmOpen(false);
    setIsSuccessOpen(true);
  };
  const handleManageUser = () => {
    router.push("/admin/user-management");
  };
  function PermissionRow({ label }: PermissionRowProps) {
    return (
      <Group justify="space-between" py="sm" className="border-b border-[#E1E0E0]">
        <Text size="sm">{label}</Text>

        <Group gap="xl">
          <Checkbox labelPosition="left" variant="outline" label="Can View" radius="xl" />
          <Checkbox labelPosition="left" variant="outline" label="Can Edit" radius="xl" />
        </Group>
      </Group>
    );
  }
  return (
    <>
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={600} size="lg">
          Create a New Role
        </Text>
      }
      radius="lg"
      size="md"
      centered
    >
      <Stack gap="md">
        <Accordion multiple >
          {[
            "Transaction Management",
            "Customer Management",
            "Outlet Management",
            "Settlement",
            "Workflow",
          ].map((item) => (
            <Accordion.Item key={item} value={item} className="border-[1.5px] border-[#E1E0E0] mb-3 rounded-lg ">
              <Accordion.Control>
                <Checkbox  labelPosition="left" variant="outline" label={item} />
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

        <Group justify="flex-end" mt="md">
          <Button variant="outline" radius="xl" onClick={onClose}>
            Close
          </Button>

          <Button color="orange" radius="xl" onClick={() => {setIsConfirmOpen(true);}}>
            Continue
          </Button>
        </Group>
      </Stack>
    </Modal>
    <ConfirmationModal
        opened={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Create a New Role ?"
        message="Are you sure you to create a new role ? Kindly note that this role would be created with it associated permission."
        primaryButtonText={`Yes, Create New Role`}
        secondaryButtonText="No, Close"
        onPrimary={handleConfirm}
      />

      {/* Success modal */}
      <SuccessModal
        opened={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        title="Role Created"
        message="Role has been successfully Created"
        primaryButtonText="Manage Admin Role"
        secondaryButtonText="No, Close"
        onPrimaryClick={handleManageUser}

      />
    </>
  );
}
