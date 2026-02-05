"use client";

import { ConfirmationModal } from "@/app/admin/_components/ConfirmationModal";
import { SuccessModal } from "@/app/admin/_components/SuccessModal";
import {
  Modal,
  Text,
  TextInput,
  Select,
  Switch,
  Stack,
  Group,
  Button,
} from "@mantine/core";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface CreateDepartmentModalProps {
  opened: boolean;
  onClose: () => void;
  onSave?: (data: any) => void;
}

export function CreateDepartmentModal({
  opened,
  onClose,
}: CreateDepartmentModalProps) {
  const router = useRouter();
  const [isDefault, setIsDefault] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isSuccessOpen, setIsSuccessOpen] = useState(false);
    const handleConfirm = () => {
    setIsConfirmOpen(false);
    setIsSuccessOpen(true);
  };
  const handleManageUser = () => {
    router.push("/admin/user-management");
  };

  return (
    <><Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={600} size="lg">
          Create New Department
        </Text>
      }
      radius="lg"
      size="lg"
      centered
    >
      <Stack gap="md">
        {/* Row 1 */}
        <Group grow>
          <TextInput
            label="Department Name"
            placeholder="Enter Department Name"
            required
          />

          <TextInput
            label="Department Email Address (Optional)"
            placeholder="example@email.com"
          />
        </Group>

        {/* Row 2 */}
        <Group grow className="mb-6">
          <Select
            label="Branch Applicable"
            placeholder="Select an Option"
            required
            data={[
              "Lagos State Branch",
              "Abuja Branch",
              "Port Harcourt Branch",
            ]}
          />

          <Group className="relative ">
            <TextInput
              label="Short description (Optional)"
              className="w-full"
              placeholder="Start Typing"
            />
            <span className="absolute top-16 text-xs">
              Not more than 32 character counts
            </span>
          </Group>
        </Group>

        {/* Default Department Box */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex gap-2">
            <Switch
              checked={isDefault}
              onChange={(e) => setIsDefault(e.currentTarget.checked)}
              color="orange"
            />

            <Stack gap={6}>
              <Text fw={500} size="sm">
                Set Department as Default
              </Text>

              <Text size="xs" c="dimmed">
                1. If another department is deactivated, its admin user will be
                temporarily moved here
              </Text>
              <Text size="xs" c="dimmed">
                2. If another department is deleted, its admin user will be
                permanently moved here until assigned to a new department.
              </Text>
            </Stack>
          </div>
        </div>

        {/* Footer */}
        <Group justify="flex-end" mt="md">
          <Button variant="outline" radius="xl" onClick={onClose}>
            No, close
          </Button>

          <Button
            color="orange"
            radius="xl"
            onClick={() => {setIsConfirmOpen(true);}}
          >
            Save
          </Button>
        </Group>
      </Stack>
    </Modal>
    <ConfirmationModal
        opened={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Create a New Department ?"
        message="Are you sure, create a new department ? Kindly note that this department would now be available under this specific branch"
        primaryButtonText={`Yes, Create Department`}
        secondaryButtonText="No, Close"
        onPrimary={handleConfirm}
      />

      {/* Success modal */}
      <SuccessModal
        opened={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        title="Department Created"
        message="Department has been successfully Created"
        primaryButtonText="Manage Department"
        secondaryButtonText="No, Close"
        onPrimaryClick={handleManageUser}

      />
    </>
  );
}
