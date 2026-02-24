"use client";

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

interface ViewDepartmentModalProps {
  opened: boolean;
  onClose: () => void;
  department?: {
    name: string;
    email?: string;
    branch: string;
    description?: string;
    isDefault: boolean;
  };
}

export function ViewDepartmentModal({
  opened,
  onClose,
  department,
}: ViewDepartmentModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={600} size="lg">
          View Department Details
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
            value={department?.name}
            readOnly
            required
          />

          <TextInput
            label="Department Email Address (Optional)"
            value={department?.email}
            readOnly
          />
        </Group>

        {/* Row 2 */}
        <Group grow>
          <Select
            label="Branch Applicable"
            value={department?.branch}
            readOnly
            required
            data={[department?.branch ?? ""]}
          />

          <TextInput
            label="Short description (Optional)"
            value={department?.description}
            readOnly
            description="Not more than 32 character counts"
          />
        </Group>

        {/* Default Department Info */}
        <div className="border border-primary-100 bg-orange-50 rounded-lg p-4">
          <div className="flex gap-2">
            <Switch
              checked={department?.isDefault}
              readOnly
              color="orange"
            />

            <Stack gap={6}>
              <Text fw={500} size="sm">
                Default Department
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

      </Stack>
    </Modal>
  );
}
