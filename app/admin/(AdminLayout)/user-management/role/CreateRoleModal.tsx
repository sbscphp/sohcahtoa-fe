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
import { useRouter } from "next/navigation";
import { useState } from "react";
import { RolePermissionModal } from "./RolePermissionModal";

interface CreateDepartmentModalProps {
  opened: boolean;
  onClose: () => void;
  onSave?: (data: any) => void;
}

export function CreateRoleModal({
  opened,
  onClose,
}: CreateDepartmentModalProps) {
    const [permissionOpen, setPermissionOpen] = useState(false);
  const [isDefault, setIsDefault] = useState(false);
  

  return (
    <><Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={600} size="lg">
          Create a New Role
        </Text>
      }
      radius="lg"
      size="lg"
      centered
    >
      <Stack gap="md">
        {/* Row 1 */}
        <Group mb="lg" grow>
          <TextInput
            label="Role Name"
            placeholder="Role Name"
            required
          />

          <Group className="relative ">
            <TextInput
              label="Description"
              className="w-full"
              placeholder="Short description of role"
              required
            />
            <span className="absolute top-16 text-xs text-gray-600">
              Not more than 32 character counts
            </span>
          </Group>
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
              "Lagos Branch",
              "Port Harcourt Branch",
            ]}
          />

          <Group className="relative ">
            
            <Select
            label="Department Applicable"
            placeholder="Select an Option"
            className="w-full"
            required
            data={[
              "Sales and Marketing",
              "Finance and Accounting",
              "Technology",
              "Audit",
            ]}
          />
            <span className="absolute top-16 text-xs text-gray-600">
              A corresponding department within a branch
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
                1. If another role is deactivated, its admin user will be temporarily reassigned to this role.
              </Text>
              <Text size="xs" c="dimmed">
                2. If another role is deleted, its admin user will be permanently reassigned to this role until given a new one.
              </Text>
            </Stack>
          </div>
        </div>

        {/* Footer */}
        <Group justify="flex-end" mt="md">
          <Button variant="outline" radius="xl" onClick={onClose}>
            Close
          </Button>

          <Button
            color="orange"
            radius="xl"
            onClick={() => {
              onClose();
              setPermissionOpen(true); 
            }}
          >
            Continue
          </Button>
        </Group>
      </Stack>
    </Modal>

    <RolePermissionModal
        opened={permissionOpen}
        onClose={() => setPermissionOpen(false)}
        onContinue={() => {
          setPermissionOpen(false);
        }}
      />
    
    </>
  );
}