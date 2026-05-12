"use client";

import { useMemo } from "react";
import type { ApiResponse } from "@/app/_lib/api/client";
import { useFetchData } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import { adminApi, type ManagementAdminUserItem } from "@/app/admin/_services/admin-api";
import type { AssignableRole, AssignableUser } from "../_workflowComponents/AssignToModal";
import { useManagementLookups } from "../../user-management/hooks/useManagementLookups";

interface EscalationUserOption {
  id: string;
  name: string;
}

function normalizeUsers(data: unknown): AssignableUser[] {
  if (!Array.isArray(data)) return [];

  return data
    .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
    .map((item) => ({
      id: typeof item.id === "string" ? item.id : "",
      name: typeof item.fullName === "string" && item.fullName.trim() ? item.fullName : "--",
      email: typeof item.email === "string" && item.email.trim() ? item.email : "--",
      roles:
        typeof item.roleName === "string" && item.roleName.trim()
          ? [item.roleName]
          : ["User"],
    }))
    .filter((user) => user.id);
}

function deriveRoles(users: AssignableUser[]): AssignableRole[] {
  const roleMap = new Map<string, number>();

  for (const user of users) {
    for (const role of user.roles) {
      if (!role || role === "User") continue;
      roleMap.set(role, (roleMap.get(role) ?? 0) + 1);
    }
  }

  return [...roleMap.entries()].map(([name, userCount]) => ({
    id: name,
    name,
    userCount,
  }));
}

export function useWorkflowEditOptions() {
  const { options: departmentOptions, isLoading: departmentsLoading } =
    useManagementLookups("department");
  const { options: branchOptions, isLoading: branchesLoading } = useManagementLookups("branch");

  const usersQuery = useFetchData<ApiResponse<ManagementAdminUserItem[]>>(
    [...adminKeys.management.users.allUsers()],
    () =>
      adminApi.management.users.getAll() as unknown as Promise<
        ApiResponse<ManagementAdminUserItem[]>
      >,
    true
  );

  const users = useMemo(() => normalizeUsers(usersQuery.data?.data), [usersQuery.data?.data]);
  const roles = useMemo(() => deriveRoles(users), [users]);
  const escalationUsers = useMemo<EscalationUserOption[]>(
    () =>
      users.map((user) => ({
        id: user.id,
        name: user.name,
      })),
    [users]
  );

  return {
    branchOptions,
    departmentOptions,
    users,
    roles,
    escalationUsers,
    isLoading: departmentsLoading || branchesLoading || usersQuery.isLoading,
    isError: usersQuery.isError,
  };
}
