"use client";

import { useState } from "react";
import { Modal, Button, Group, Text, ScrollArea, Checkbox, Avatar } from "@mantine/core";

export interface AssignableUser {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

interface AssignIncidentModalProps {
  opened: boolean;
  onClose: () => void;
}

const MOCK_USERS: AssignableUser[] = [
  {
    id: "u1",
    name: "Adekunle, Ibrahim",
    email: "kibrahim@sohcahtoa.com",
    roles: ["Internal Control"],
  },
  {
    id: "u2",
    name: "Benson, Clara",
    email: "cbenson@sohcahtoa.com",
    roles: ["Finance", "Head of Audit"],
  },
  {
    id: "u3",
    name: "Chukwu, David",
    email: "dchukwu@sohcahtoa.com",
    roles: ["IT Support", "IT Manager"],
  },
  {
    id: "u4",
    name: "Ekwueme, Fatima",
    email: "fekwueme@sohcahtoa.com",
    roles: ["Chief Financial Officer"],
  },
];

function getInitials(name: string): string {
  return name
    .split(/[\s,]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

const ROLE_PILL_COLORS: Record<string, string> = {
  "Internal Control": "bg-blue-100 text-blue-700",
  Finance: "bg-blue-100 text-blue-700",
  "IT Support": "bg-blue-100 text-blue-700",
  "Head of Audit": "bg-green-100 text-green-700",
  "IT Manager": "bg-green-100 text-green-700",
  "Chief Financial Officer": "bg-green-100 text-green-700",
};

export default function AssignIncidentModal({ opened, onClose }: AssignIncidentModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleUser = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const handleSelect = () => {
    onClose();
    setSelectedIds(new Set());
  };

  const handleClose = () => {
    onClose();
    setSelectedIds(new Set());
  };

  const count = selectedIds.size;

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <div>
          <Text fw={700} size="lg" className="text-gray-900">
            Assign incident to User(s)
          </Text>
          <Text size="sm" c="dimmed" mt={4}>
            Select who to assign this incident to
          </Text>
        </div>
      }
      centered
      radius="lg"
      size="md"
      classNames={{ title: "!mb-0" }}
    >
      <ScrollArea h={360} type="scroll">
        <div className="divide-y divide-gray-200">
          {MOCK_USERS.map((user) => {
            const isSelected = selectedIds.has(user.id);
            return (
              <button
                key={user.id}
                type="button"
                onClick={() => toggleUser(user.id)}
                className={`flex w-full items-center gap-3 px-2 py-3 text-left transition-colors rounded ${
                  isSelected ? "border-l-4 border-orange-500 bg-orange-50/50" : "hover:bg-gray-50"
                }`}
              >
                <Checkbox
                  checked={isSelected}
                  onChange={() => toggleUser(user.id)}
                  onClick={(e) => e.stopPropagation()}
                  color="orange"
                />
                <Avatar
                  size="md"
                  radius="xl"
                  className="bg-orange-100 text-orange-700 shrink-0"
                >
                  {getInitials(user.name)}
                </Avatar>
                <div className="flex-1 min-w-0">
                  <Text fw={600} size="sm" className="text-gray-900 truncate">
                    {user.name}
                  </Text>
                  <Text size="xs" c="dimmed" className="truncate">
                    {user.email}
                  </Text>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {user.roles.map((role) => (
                      <span
                        key={role}
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          ROLE_PILL_COLORS[role] ?? "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>

      <Group justify="flex-end" gap="sm" mt="lg">
        <Button variant="outline" color="gray" radius="xl" onClick={handleClose}>
          No, Close
        </Button>
        <Button
          color="#DD4F05"
          radius="xl"
          onClick={handleSelect}
          disabled={count === 0}
        >
          Select User ({String(count).padStart(2, "0")})
        </Button>
      </Group>
    </Modal>
  );
}
