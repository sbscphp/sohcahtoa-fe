"use client";

import { useState } from "react";
import { Modal, Button, Group, Text, ScrollArea, Checkbox, Avatar, Tabs } from "@mantine/core";

export interface AssignableUser {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

export interface AssignableRole {
  id: string;
  name: string;
  userCount: number;
}

interface AssignToModalProps {
  opened: boolean;
  onClose: () => void;
  onSelectUsers: (users: AssignableUser[]) => void;
  onSelectRoles: (roles: AssignableRole[]) => void;
  users: AssignableUser[];
  roles: AssignableRole[];
}

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

export default function AssignToModal({
  opened,
  onClose,
  onSelectUsers,
  onSelectRoles,
  users,
  roles,
}: AssignToModalProps) {
  const [activeTab, setActiveTab] = useState<string | null>("admin-users");
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [selectedRoleIds, setSelectedRoleIds] = useState<Set<string>>(new Set());

  const toggleUser = (id: string) => {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleRole = (id: string) => {
    setSelectedRoleIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelect = () => {
    if (activeTab === "admin-users") {
      const selectedUsers = users.filter((u) => selectedUserIds.has(u.id));
      onSelectUsers(selectedUsers);
    } else {
      const selectedRoles = roles.filter((r) => selectedRoleIds.has(r.id));
      onSelectRoles(selectedRoles);
    }
    handleClose();
  };

  const handleClose = () => {
    setSelectedUserIds(new Set());
    setSelectedRoleIds(new Set());
    onClose();
  };

  const count = activeTab === "admin-users" ? selectedUserIds.size : selectedRoleIds.size;
  const buttonLabel =
    activeTab === "admin-users"
      ? `Select Admin (${String(count).padStart(2, "0")})`
      : `Select Role (${String(count).padStart(2, "0")})`;

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <div>
          <Text fw={700} size="lg" className="text-gray-900">
            Assign workflow line to User(s) or a Role
          </Text>
          <Text size="sm" c="dimmed" mt={4}>
            Select who to assign workflow process to
          </Text>
        </div>
      }
      centered
      radius="lg"
      size="md"
      classNames={{ title: "!mb-0" }}
    >
      <Tabs value={activeTab} onChange={setActiveTab} color="orange">
        <Tabs.List className="mb-4">
          <Tabs.Tab value="admin-users" className="flex-1 text-center font-medium">
            Admin Users
          </Tabs.Tab>
          <Tabs.Tab value="roles" className="flex-1 text-center font-medium">
            Roles
          </Tabs.Tab>
        </Tabs.List>

        {/* Admin Users Tab */}
        <Tabs.Panel value="admin-users">
          <ScrollArea h={360} type="scroll">
            <div className="divide-y divide-gray-200">
              {users.map((user) => {
                const isSelected = selectedUserIds.has(user.id);
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => toggleUser(user.id)}
                    className={`flex w-full items-center gap-3 px-2 py-3 text-left transition-colors rounded ${
                      isSelected
                        ? "border-l-4 border-orange-500 bg-orange-50/50"
                        : "hover:bg-gray-50"
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
        </Tabs.Panel>

        {/* Roles Tab */}
        <Tabs.Panel value="roles">
          <ScrollArea h={360} type="scroll">
            <div className="divide-y divide-gray-200">
              {roles.map((role) => {
                const isSelected = selectedRoleIds.has(role.id);
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => toggleRole(role.id)}
                    className={`flex w-full items-center gap-3 px-2 py-3 text-left transition-colors rounded ${
                      isSelected
                        ? "border-l-4 border-orange-500 bg-orange-50/50"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <Checkbox
                      checked={isSelected}
                      onChange={() => toggleRole(role.id)}
                      onClick={(e) => e.stopPropagation()}
                      color="orange"
                    />
                    <Avatar
                      size="md"
                      radius="xl"
                      className="bg-orange-100 text-orange-700 shrink-0"
                    >
                      {getInitials(role.name)}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <Text fw={600} size="sm" className="text-gray-900 truncate">
                        {role.name}
                      </Text>
                      <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                        {role.userCount} Users
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </Tabs.Panel>
      </Tabs>

      <Group justify="flex-end" gap="sm" mt="lg">
        <Button variant="outline" color="gray" radius="xl" onClick={handleClose}>
          No, Close
        </Button>
        <Button color="#DD4F05" radius="xl" onClick={handleSelect} disabled={count === 0}>
          {buttonLabel}
        </Button>
      </Group>
    </Modal>
  );
}
