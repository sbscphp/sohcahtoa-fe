"use client";

import {
  Modal,
  Text,
  TextInput,
  Select,
  Group,
  Stack,
  Divider,
  Button,
} from "@mantine/core";
import { X } from "lucide-react";
import { useState } from "react";

interface AddUserModalProps {
  opened: boolean;
  onClose: () => void;
  onCreateRole: () => void;
}

export function AddUserModal({
  opened,
  onClose,
  onCreateRole,
}: AddUserModalProps) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone1: "",
    phone2: "",
    branch: "",
    department: "",
    position: "",
    role: "",
  });

  const isValid =
    form.fullName &&
    form.email &&
    form.phone1 &&
    form.branch &&
    form.department &&
    form.role;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size="xl"
      radius="md"
      title={
        <Text className="text-body-heading-300! text-xl! font-bold! leading-tight!">
          Add a New User
        </Text>
      }
      closeButtonProps={{
        icon: (
          <X
            size={20}
            className="bg-[#e69fb6]! text-pink-500! font-bold! rounded-full! p-1! hover:bg-[#e69fb6]/80! transition-all! duration-300!"
          />
        ),
      }}
    >
      <Divider my="xs" />

      <Stack gap="md" mt="lg">
        <Group grow>
          <TextInput
            label="Full Name"
            placeholder="Enter Full Name"
            required
            value={form.fullName}
            onChange={(e) =>
              setForm({ ...form, fullName: e.target.value })
            }
          />

          <TextInput
            label="Email Address"
            placeholder="example@email.com"
            required
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />
        </Group>

        <Group grow>
          <TextInput
            label="Phone Number 1"
            placeholder="+234 00 0000 0000"
            required
            value={form.phone1}
            onChange={(e) =>
              setForm({ ...form, phone1: e.target.value })
            }
          />

          <TextInput
            label="Phone Number 2 (optional)"
            placeholder="+234 00 0000 0000"
            value={form.phone2}
            onChange={(e) =>
              setForm({ ...form, phone2: e.target.value })
            }
          />
        </Group>

        <Group grow>
          <Select
            label="Branch"
            placeholder="Select an Option"
            required
            data={[
              "Lagos Branch",
              "Abuja Branch",
              "Port Harcourt Branch",
              "Lagos State Branch",
            ]}
            value={form.branch}
            onChange={(value) =>
              setForm({ ...form, branch: value! })
            }
          />

          <Stack gap={4}>
            <Select
              label="Department"
              placeholder="Select an Option"
              required
              data={[
                "Finance & Accounting",
                "Audit",
                "Technology",
                "Sales & Marketing",
              ]}
              value={form.department}
              onChange={(value) =>
                setForm({ ...form, department: value! })
              }
            />
            <Text size="xs" c="dimmed">
              A corresponding department within a branch
            </Text>
          </Stack>
        </Group>

        <Stack gap={4}>
          <TextInput
            label="Position"
            placeholder="Enter position name"
            value={form.position}
            onChange={(e) =>
              setForm({ ...form, position: e.target.value })
            }
          />
          <Text size="xs" c="dimmed">
            Position user hold in the company
          </Text>
        </Stack>

        <Select
          label="Admin Role"
          placeholder="Search or select option"
          required
          data={[
            "Management Role",
            "Audit and Internal Control Role",
            "Sales Role",
            "Marketing Role",
          ]}
          value={form.role}
          onChange={(value) =>
            setForm({ ...form, role: value! })
          }
        />
      </Stack>

      <Divider my="lg" />

      <Group justify="flex-end">
        <Button variant="outline" radius="xl" onClick={onClose}>
          Close
        </Button>

        <Button
          color="orange"
          radius="xl"
          disabled={!isValid}
          onClick={onCreateRole}
          styles={{
            root: {
              minWidth: 120,
            },
          }}
        >
          Add User
        </Button>
      </Group>
    </Modal>
  );
}
