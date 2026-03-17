"use client";

import { useState } from "react";
import { Modal, Button, Group, Text, ScrollArea, Checkbox, Avatar } from "@mantine/core";
import { useFetchData } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import {
  adminApi,
  type ManagementAdminUserItem,
} from "@/app/admin/_services/admin-api";
import { type ApiResponse } from "@/app/_lib/api/client";

export interface AssignableUser {
  id: string;
  name: string;
  email: string;
  roleName: string;
  departmentName: string;
  isActive: boolean;
}

interface AssignIncidentModalProps {
  opened: boolean;
  onClose: () => void;
  assignedAdminId?: string | null;
  onAssign?: (adminId: string) => void;
  loading?: boolean;
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

function normalizeUsers(data: unknown): AssignableUser[] {
  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .filter(
      (item): item is Record<string, unknown> =>
        typeof item === "object" && item !== null
    )
    .map((item) => ({
      id: typeof item.id === "string" ? item.id : "",
      name: typeof item.fullName === "string" ? item.fullName : "--",
      email: typeof item.email === "string" ? item.email : "--",
      roleName:
        typeof item.roleName === "string" && item.roleName.trim()
          ? item.roleName
          : "N/A",
      departmentName:
        typeof item.departmentName === "string" && item.departmentName.trim()
          ? item.departmentName
          : "N/A",
      isActive: Boolean(item.isActive),
    }))
    .filter((item) => item.id);
}

export default function AssignIncidentModal({
  opened,
  onClose,
  assignedAdminId = null,
  onAssign,
  loading = false,
}: AssignIncidentModalProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const usersQuery = useFetchData<ApiResponse<ManagementAdminUserItem[]>>(
    [...adminKeys.management.users.allUsers()],
    () =>
      adminApi.management.users.getAll() as unknown as Promise<
        ApiResponse<ManagementAdminUserItem[]>
      >,
    opened
  );

  const users = normalizeUsers(usersQuery.data?.data);
  const effectiveSelectedId = selectedId ?? assignedAdminId ?? null;

  const toggleUser = (id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  const handleSelect = () => {
    if (!effectiveSelectedId) {
      return;
    }

    onAssign?.(effectiveSelectedId);
  };

  const handleClose = () => {
    setSelectedId(null);
    onClose();
  };

  const count = effectiveSelectedId ? 1 : 0;

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
          {usersQuery.isLoading ? (
            <Text size="sm" c="dimmed" py="md">
              Loading users...
            </Text>
          ) : usersQuery.isError ? (
            <Text size="sm" c="red" py="md">
              Unable to load users. Please refresh and try again.
            </Text>
          ) : users.length === 0 ? (
            <Text size="sm" c="dimmed" py="md">
              No users available
            </Text>
          ) : (
            users.map((user) => {
            const isSelected = effectiveSelectedId === user.id;
            return (
              <button
                key={user.id}
                type="button"
                onClick={() => toggleUser(user.id)}
                className={`flex w-full items-center gap-3 px-2 py-3 text-left transition-colors rounded ${
                  isSelected ? "border-l-4 border-orange-500 bg-orange-50/50" : "hover:bg-gray-50"
                }`}
                disabled={loading}
              >
                <Checkbox
                  checked={isSelected}
                  onChange={() => toggleUser(user.id)}
                  onClick={(e) => e.stopPropagation()}
                  color="orange"
                  disabled={loading}
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
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700">
                      {user.roleName}
                    </span>
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700">
                      {user.departmentName}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        user.isActive
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </button>
            );
          })
          )}
        </div>
      </ScrollArea>

      <Group justify="flex-end" gap="sm" mt="lg">
        <Button variant="outline" color="gray" radius="xl" onClick={handleClose} disabled={loading}>
          No, Close
        </Button>
        <Button
          color="#DD4F05"
          radius="xl"
          onClick={handleSelect}
          disabled={count === 0 || usersQuery.isLoading || usersQuery.isError}
          loading={loading}
        >
          Select User ({String(count).padStart(2, "0")})
        </Button>
      </Group>
    </Modal>
  );
}
