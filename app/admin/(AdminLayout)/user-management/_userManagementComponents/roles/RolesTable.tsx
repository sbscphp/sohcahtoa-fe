"use client";

import { useState } from "react";
import {
  Text,
  Group,
  TextInput,
  Button,
  Select,
} from "@mantine/core";
import { Search, Plus, Upload, ListFilter } from "lucide-react";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { ConfirmationModal } from "@/app/admin/_components/ConfirmationModal";
import { SuccessModal } from "@/app/admin/_components/SuccessModal";
import { CustomerStatus } from "../../../customer/[id]/page";
import { CreateRoleModal } from "./CreateRoleModal";
import RowActionIcon from "@/app/admin/_components/RowActionIcon";
import { useRouter } from "next/navigation";
import { adminRoutes } from "@/lib/adminRoutes";
import { useRoles, type RoleItem } from "../../hooks/useRoles";
import { useDebouncedValue } from "@mantine/hooks";

const PAGE_SIZE = 10;

export default function RolesTable() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 400);
  const [filter, setFilter] = useState("Filter By");
  const [open, setOpen] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [status, setStatus] = useState<CustomerStatus>("Active");
  const isCurrentlyActive = status === "Active";
  const actionVerb = isCurrentlyActive ? "Deactivate" : "Reactivate";
  const pastTenseVerb = isCurrentlyActive ? "Deactivated" : "Reactivated";
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const { roles, totalPages, isLoading } = useRoles({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
  });

  const handleConfirm = () => {
    setStatus((prev) => (prev === "Active" ? "Deactivated" : "Active"));
    setDeactivateOpen(false);
    setIsSuccessOpen(true);
  };

  const headers = [
    { label: "Role Name", key: "name" },
    { label: "Date Created", key: "date" },
    { label: "Users", key: "users" },
    { label: "Status", key: "status" },
    { label: "Permissions", key: "permissions" },
    { label: "Action", key: "action" },
  ];

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return {
      date: d.toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" }),
      time: d.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit", hour12: true }),
    };
  };

  const renderRow = (role: RoleItem) => {
    const { date, time } = formatDate(role.createdAt);

    return [
      <div key="name">
        <Text fw={500} size="sm">
          {role.name}
        </Text>
        <Text size="xs" c="dimmed">
          ID:{role.id}
        </Text>
      </div>,

      <div key="date">
        <Text size="sm">{date}</Text>
        <Text size="xs" c="dimmed">
          {time}
        </Text>
      </div>,

      <Text key="users" size="sm">
        {role._count.users}
      </Text>,

      <StatusBadge key="status" status={role.isActive ? "Active" : "Deactivated"} />,

      <Text key="permissions" size="sm">
        {role.permissionsCount}
      </Text>,

      <RowActionIcon key="action" onClick={() => router.push(adminRoutes.adminUserManagementUser(role.id))} />,
    ];
  };

  return (
    <div className="p-5 bg-white rounded-lg">
      <Group justify="space-between" mb="md" wrap="wrap">
        <Group>
          <Text fw={600} size="lg">
            All Roles
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
            data={["Filter By", "Active", "Deactivated"]}
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
            onClick={() => setOpen(true)}
            color="orange"
            radius="xl"
            rightSection={<Plus size={16} />}
          >
            Add New
          </Button>
        </Group>
      </Group>

      <DynamicTableSection
        headers={headers}
        data={roles}
        loading={isLoading}
        renderItems={renderRow}
        emptyTitle="No Roles Found"
        emptyMessage="There are no roles available yet."
        pagination={{
          page,
          totalPages,
          onNext: () => setPage((p) => Math.min(p + 1, totalPages)),
          onPrevious: () => setPage((p) => Math.max(p - 1, 1)),
          onPageChange: setPage,
        }}
      />
      <CreateRoleModal
        opened={open}
        onClose={() => setOpen(false)}
        onSave={(data) => {
          console.log(data);
          setOpen(false);
        }}
      />
      {/* Deactivate / Reactivate confirmation modal */}
      <ConfirmationModal
        opened={deactivateOpen}
        onClose={() => setDeactivateOpen(false)}
        title={`${actionVerb} Department ?`}
        message={`Are you sure, ${actionVerb.toLowerCase()} this admin user? Kindly note that system access would be ${
          isCurrentlyActive
            ? "temporarily suspended, until the admin user is reactivated, therefore admin users under this department would be reassigned temporarily to the default department"
            : "restored therefore this admin user would now be able to access the system according to their role and related permissions"
        }`}
        primaryButtonText={`Yes, ${actionVerb} Department`}
        secondaryButtonText="No, Close"
        onPrimary={handleConfirm}
      />

      {/* Success modal */}
      <SuccessModal
        opened={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        title={`Department ${pastTenseVerb}`}
        message={`Department has been successfully ${pastTenseVerb.toLowerCase()}.`}
        primaryButtonText="Manage User"
        secondaryButtonText="No, Close"
      />
      <ConfirmationModal
        opened={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Department ?"
        message="Are you sure, Delete this department? Kindly note that this action is irreversible, hence department details would be deleted completely and admin users under this department would be reassigned to the default department"
        primaryButtonText={`Yes, Delete Department`}
        secondaryButtonText="No, Close"
        onPrimary={handleConfirm}
      />

      {/* Success modal */}
      <SuccessModal
        opened={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        title="Department Deleted"
        message="Department has been successfully deleted"
        primaryButtonText="Manage User"
        secondaryButtonText="No, Close"
      />
    </div>
  );
}
