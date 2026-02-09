"use client";

import { useState, useMemo } from "react";
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

/* --------------------------------------------
 Types
--------------------------------------------- */
interface User {
  name: string;
  userId: string;
  department: string;
  departmentId: string;
  email: string;
  role: string;
  roleId: string;
  status: "Active" | "Deactivated";
}

/* --------------------------------------------
 Mock Data
--------------------------------------------- */
const users: User[] = [
  {
    name: "Kunle Dairo",
    userId: "9023",
    department: "Finance & Accounting",
    departmentId: "8933",
    email: "kunle@socahao.com",
    role: "Finance Role",
    roleId: "7320",
    status: "Active",
  },
  {
    name: "Marcus Lee",
    userId: "9025",
    department: "Human Resources",
    departmentId: "8935",
    email: "john@creativespace.org",
    role: "Product Manager",
    roleId: "7322",
    status: "Deactivated",
  },
  {
    name: "Sofia Wang",
    userId: "9026",
    department: "Research & Development",
    departmentId: "8936",
    email: "lisa@innovators.com",
    role: "UX Designer",
    roleId: "7323",
    status: "Active",
  },
  {
    name: "Aisha Patel",
    userId: "9024",
    department: "Marketing & Sales",
    departmentId: "8934",
    email: "maria@designhub.com",
    role: "Marketing Specialist",
    roleId: "7321",
    status: "Deactivated",
  },
  {
    name: "Jamal Rivers",
    userId: "9027",
    department: "Customer Support",
    departmentId: "8937",
    email: "kunke@innovators.com",
    role: "Software Designer",
    roleId: "7324",
    status: "Active",
  },
  {
    name: "Aisha Patel",
    userId: "9024",
    department: "Marketing & Sales",
    departmentId: "8934",
    email: "maria@designhub.com",
    role: "Marketing Specialist",
    roleId: "7321",
    status: "Deactivated",
  },
];

/* --------------------------------------------
 Component
--------------------------------------------- */
export default function UsersTable() {
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Filter By");
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [confirmRoleOpen, setConfirmRoleOpen] = useState(false);
  const [roleCreatedOpen, setRoleCreatedOpen] = useState(false);
  const router = useRouter();

  /* Filter */
  const filteredData = useMemo(() => {
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.userId.includes(search),
    );
  }, [search]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [page, filteredData]);

  /* Headers */
  const headers = [
    { label: "Admin Name", key: "name" },
    { label: "Department", key: "department" },
    { label: "Email Address", key: "email" },
    { label: "Role", key: "role" },
    { label: "Status", key: "status" },
    { label: "Action", key: "action" },
  ];

  /* Row renderer */
  const renderRow = (user: User) => [
    <div key="name">
      <Text fw={500} size="sm">
        {user.name}
      </Text>
      <Text size="xs" c="dimmed">
        ID:{user.userId}
      </Text>
    </div>,

    <div key="department">
      <Text size="sm">{user.department}</Text>
      <Text size="xs" c="dimmed">
        ID:{user.departmentId}
      </Text>
    </div>,

    <Text key="email" size="sm">
      {user.email}
    </Text>,

    <div key="role">
      <Text size="sm">{user.role}</Text>
      <Text size="xs" c="dimmed">
        ID:{user.roleId}
      </Text>
    </div>,

    <StatusBadge key="status" status={user.status} />,

    <RowActionIcon key="action" onClick={() => router.push(adminRoutes.adminUserManagementUser())} />,
  ];

  return (
    <div className="p-5 bg-white rounded-lg">
      {/* Header */}
      <Group justify="space-between" mb="md" wrap="wrap">
        <Group>
          <Text fw={600} size="lg">
            All Users
          </Text>

          <TextInput
            placeholder="Enter keyword"
            leftSection={<Search size={16} color="#DD4F05" />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            w={320}
            radius="xl"
          />
        </Group>

        <Group>
          {/* Filter */}
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

      {/* Table */}
      <DynamicTableSection
        headers={headers}
        data={paginatedData}
        loading={false}
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
