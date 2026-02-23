"use client";

import { useState } from "react";
import { Text, Group, TextInput, Button, Select } from "@mantine/core";
import { Search, Plus, Upload, ListFilter } from "lucide-react";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import RowActionIcon from "@/app/admin/_components/RowActionIcon";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { AddUserModal } from "./AddUserModal";
import { CreateAdminRoleModal } from "./CreateAdminRoleModal";
import { AdminRoleCreatedModal } from "./AdminRoleCreatedModal";
import { useRouter } from "next/navigation";
import { adminRoutes } from "@/lib/adminRoutes";
import { useUsers, type AdminUserItem } from "../../hooks/useUsers";
import { useDebouncedValue } from "@mantine/hooks";

const PAGE_SIZE = 10;

export default function UsersTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 400);
  const [filter, setFilter] = useState("Filter By");
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [confirmRoleOpen, setConfirmRoleOpen] = useState(false);
  const [roleCreatedOpen, setRoleCreatedOpen] = useState(false);
  const router = useRouter();

  const { users, totalPages, isLoading } = useUsers({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
  });

  const headers = [
    { label: "Admin Name", key: "name" },
    { label: "Department", key: "department" },
    { label: "Email Address", key: "email" },
    { label: "Role", key: "role" },
    { label: "Status", key: "status" },
    { label: "Action", key: "action" },
  ];

  const renderRow = (user: AdminUserItem) => [
    <div key="name">
      <Text fw={500} size="sm">
        {user.fullName}
      </Text>
      <Text size="xs" c="dimmed">
        ID:{user.id}
      </Text>
    </div>,

    <div key="department">
      <Text size="sm">{user.departmentId ?? "—"}</Text>
    </div>,

    <Text key="email" size="sm">
      {user.email}
    </Text>,

    <div key="role">
      <Text size="sm">{user.roleId ?? "—"}</Text>
    </div>,

    <StatusBadge key="status" status={user.isActive ? "Active" : "Deactivated"} />,

    <RowActionIcon key="action" onClick={() => router.push(adminRoutes.adminUserManagementUser(user.id))} />,
  ];

  return (
    <div className="p-5 bg-white rounded-lg">
      <Group justify="space-between" mb="md" wrap="wrap">
        <Group>
          <Text fw={600} size="lg">
            All Users
          </Text>

          <TextInput
            placeholder="Enter keyword"
            leftSection={<Search size={16} color="#DD4F05" />}
            value={search}
            onChange={(e) => {
              setSearch(e.currentTarget.value);
              setPage(1);
            }}
            w={320}
            radius="xl"
          />
        </Group>

        <Group>
          <Select
            value={filter}
            onChange={(value) => setFilter(value!)}
            data={["Filter By", "Buy FX", "Sell FX", "Receive FX"]}
            radius="xl"
            w={120}
            rightSection={<ListFilter size={16} />}
          />
          <Button
            variant="outline"
            color="#DD4F05"
            radius="xl"
            rightSection={<Upload size={16} />}
          >
            Export
          </Button>

          <Button
            color="orange"
            radius="xl"
            onClick={() => setAddUserOpen(true)}
            rightSection={<Plus size={16} />}
          >
            Add New
          </Button>
        </Group>
      </Group>

      <DynamicTableSection
        headers={headers}
        data={users}
        loading={isLoading}
        renderItems={renderRow}
        emptyTitle="No Users Found"
        emptyMessage="There are no users available yet."
        pagination={{
          page,
          totalPages,
          onNext: () => setPage((p) => Math.min(p + 1, totalPages)),
          onPrevious: () => setPage((p) => Math.max(p - 1, 1)),
          onPageChange: setPage,
        }}
      />

      <AddUserModal
        opened={addUserOpen}
        onClose={() => setAddUserOpen(false)}
        onCreateRole={() => {
          setAddUserOpen(false);
          setConfirmRoleOpen(true);
        }}
      />

      <CreateAdminRoleModal
        opened={confirmRoleOpen}
        onClose={() => setConfirmRoleOpen(false)}
        onConfirm={() => {
          setConfirmRoleOpen(false);
          setRoleCreatedOpen(true);
        }}
      />

      <AdminRoleCreatedModal
        opened={roleCreatedOpen}
        onClose={() => setRoleCreatedOpen(false)}
      />
    </div>
  );
}
