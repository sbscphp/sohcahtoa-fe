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
import { CreateDepartmentModal } from "./CreateDepartmentModal";
import RowActionMenu from "@/app/admin/_components/RowActionMenu";
import { ViewDepartmentModal } from "./ViewDepartmentModal";
import { ConfirmationModal } from "@/app/admin/_components/ConfirmationModal";
import { SuccessModal } from "@/app/admin/_components/SuccessModal";
import { useDebouncedValue } from "@mantine/hooks";
import { useDepartments, type DepartmentItem } from "../../hooks/useDepartments";
import { usePatchData, useDeleteData, useGetExportData } from "@/app/_lib/api/hooks";
import {
  adminApi,
  type UpdateDepartmentStatusPayload,
} from "@/app/admin/_services/admin-api";
import { notifications } from "@mantine/notifications";
import type { ApiError, ApiResponse } from "@/app/_lib/api/client";
import { useQueryClient } from "@tanstack/react-query";
import { adminKeys } from "@/app/_lib/api/query-keys";

const PAGE_SIZE = 10;

/* --------------------------------------------
 Component
--------------------------------------------- */
export default function DepartmentsTable() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 400);
  const [filter, setFilter] = useState("Filter By");
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentItem | null>(null);
  const [viewEditMode, setViewEditMode] = useState<"view" | "edit">("view");
  const [viewEditOpen, setViewEditOpen] = useState(false);

  // Deactivate / Reactivate
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [deactivateSuccessOpen, setDeactivateSuccessOpen] = useState(false);

  // Delete
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteSuccessOpen, setDeleteSuccessOpen] = useState(false);

  const { departments, totalPages, isLoading } = useDepartments({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
  });

  /* ---- Status toggle mutation ---- */
  const isCurrentlyActive = selectedDepartment?.isActive ?? true;
  const actionVerb = isCurrentlyActive ? "Deactivate" : "Reactivate";
  const pastTenseVerb = isCurrentlyActive ? "Deactivated" : "Reactivated";

  const toggleStatusMutation = usePatchData(
    ({ id, data }: { id: string; data: UpdateDepartmentStatusPayload }) =>
      adminApi.management.departments.updateStatus(id, data),
    {
      onSuccess: async () => {
        setDeactivateOpen(false);
        setDeactivateSuccessOpen(true);
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: [...adminKeys.management.departments.all()],
          }),
          queryClient.invalidateQueries({
            queryKey: [...adminKeys.management.departments.stats()],
          }),
        ]);
      },
      onError: (error) => {
        const apiResponse = (error as unknown as ApiError).data as ApiResponse;
        notifications.show({
          title: `${actionVerb} Department Failed`,
          message:
            apiResponse?.error?.message ??
            error.message ??
            "Unable to update department status. Please try again.",
          color: "red",
        });
      },
    }
  );

  /* ---- Delete mutation ---- */
  const deleteDepartmentMutation = useDeleteData(
    (id: string) => adminApi.management.departments.delete(id),
    {
      onSuccess: async () => {
        setDeleteOpen(false);
        setDeleteSuccessOpen(true);
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: [...adminKeys.management.departments.all()],
          }),
          queryClient.invalidateQueries({
            queryKey: [...adminKeys.management.departments.stats()],
          }),
        ]);
      },
      onError: (error) => {
        const apiResponse = (error as unknown as ApiError).data as ApiResponse;
        notifications.show({
          title: "Delete Department Failed",
          message:
            apiResponse?.error?.message ??
            error.message ??
            "Unable to delete department. Please try again.",
          color: "red",
        });
      },
    }
  );

  const exportDepartmentsMutation = useGetExportData(
    () => adminApi.management.departments.export(),
    {
      onSuccess: (csvBlob) => {
        const objectUrl = URL.createObjectURL(csvBlob);
        const link = document.createElement("a");
        const dateStamp = new Date().toISOString().slice(0, 10);

        link.href = objectUrl;
        link.download = `admin-departments-${dateStamp}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(objectUrl);
      },
      onError: (error) => {
        const apiResponse = (error as unknown as ApiError).data as ApiResponse;
        notifications.show({
          title: "Export Departments Failed",
          message:
            apiResponse?.error?.message ??
            error.message ??
            "Unable to export departments at the moment. Please try again.",
          color: "red",
        });
      },
    }
  );

  /* ---- Handlers ---- */
  const handleConfirmToggleStatus = () => {
    if (!selectedDepartment) return;
    toggleStatusMutation.mutate({
      id: selectedDepartment.id,
      data: { isActive: !selectedDepartment.isActive },
    });
  };

  const handleConfirmDelete = () => {
    if (!selectedDepartment) return;
    deleteDepartmentMutation.mutate(selectedDepartment.id);
  };

  /* Table Headers */
  const headers = [
    { label: "Department Name", key: "name" },
    { label: "Date Created", key: "date" },
    { label: "No. of Users", key: "users" },
    { label: "Status", key: "status" },
    { label: "Action", key: "action" },
  ];

  const formatDate = (iso?: string) => {
    if (!iso) {
      return { date: "—", time: "" };
    }
    const d = new Date(iso);
    return {
      date: d.toLocaleDateString("en-NG", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: d.toLocaleTimeString("en-NG", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  /* Row Renderer */
  const renderRow = (dept: DepartmentItem) => {
    const { date, time } = formatDate(dept.createdAt);

    return [
      <div key="name">
        <Text fw={500} size="sm">
          {dept.name}
        </Text>
        <Text size="xs" c="dimmed">
          ID:{dept.id}
        </Text>
      </div>,

      <div key="date">
        <Text size="sm">{date}</Text>
        <Text size="xs" c="dimmed">
          {time}
        </Text>
      </div>,

      <Text key="users" size="sm">
        {dept.usersCount ?? dept._count?.users ?? 0}
      </Text>,

      <StatusBadge key="status" status={dept.isActive ? "Active" : "Deactivated"} />,

      <RowActionMenu
        key="actions"
        deactivateLabel={dept.isActive ? "Deactivate" : "Reactivate"}
        onView={() => {
          setSelectedDepartment(dept);
          setViewEditMode("view");
          setViewEditOpen(true);
        }}
        onEdit={() => {
          setSelectedDepartment(dept);
          setViewEditMode("edit");
          setViewEditOpen(true);
        }}
        onDeactivate={() => {
          setSelectedDepartment(dept);
          setDeactivateOpen(true);
        }}
        onDelete={() => {
          setSelectedDepartment(dept);
          setDeleteOpen(true);
        }}
      />,
    ];
  };

  return (
    <div className="p-5 bg-white rounded-lg">
      {/* Header */}
      <Group justify="space-between" mb="md" wrap="wrap">
        <Group>
          <Text fw={600} size="lg">
            All Departments
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
            onClick={() => exportDepartmentsMutation.mutate()}
            loading={exportDepartmentsMutation.isPending}
            disabled={exportDepartmentsMutation.isPending}
          >
            Export
          </Button>

          <Button
            onClick={() => setCreateOpen(true)}
            color="orange"
            radius="xl"
            rightSection={<Plus size={16} />}
          >
            Add New
          </Button>
        </Group>
      </Group>

      {/* Table */}
      <DynamicTableSection
        headers={headers}
        data={departments}
        loading={isLoading}
        renderItems={renderRow}
        emptyTitle="No Departments Found"
        emptyMessage="There are no departments available yet."
        pagination={{
          page,
          totalPages,
          onNext: () => setPage((p) => Math.min(p + 1, totalPages)),
          onPrevious: () => setPage((p) => Math.max(p - 1, 1)),
          onPageChange: setPage,
        }}
      />

      {/* Create */}
      <CreateDepartmentModal
        opened={createOpen}
        onClose={() => setCreateOpen(false)}
      />

      {/* View / Edit */}
      <ViewDepartmentModal
        opened={viewEditOpen}
        onClose={() => setViewEditOpen(false)}
        mode={viewEditMode}
        department={selectedDepartment}
      />

      {/* Deactivate / Reactivate confirmation */}
      <ConfirmationModal
        opened={deactivateOpen}
        onClose={() => setDeactivateOpen(false)}
        title={`${actionVerb} Department ?`}
        message={`Are you sure you want to ${actionVerb.toLowerCase()} this department? ${
          isCurrentlyActive
            ? "Admin users under this department will be temporarily reassigned to the default department."
            : "Admin users will be restored to this department."
        }`}
        primaryButtonText={`Yes, ${actionVerb} Department`}
        secondaryButtonText="No, Close"
        onPrimary={handleConfirmToggleStatus}
        loading={toggleStatusMutation.isPending}
      />

      <SuccessModal
        opened={deactivateSuccessOpen}
        onClose={() => setDeactivateSuccessOpen(false)}
        title={`Department ${pastTenseVerb}`}
        message={`Department has been successfully ${pastTenseVerb.toLowerCase()}.`}
        primaryButtonText="Done"
        onPrimaryClick={() => setDeactivateSuccessOpen(false)}
      />

      {/* Delete confirmation */}
      <ConfirmationModal
        opened={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Department ?"
        message="Are you sure you want to delete this department? This action is irreversible. Department details will be permanently removed and admin users will be reassigned to the default department."
        primaryButtonText="Yes, Delete Department"
        secondaryButtonText="No, Close"
        onPrimary={handleConfirmDelete}
        loading={deleteDepartmentMutation.isPending}
      />

      <SuccessModal
        opened={deleteSuccessOpen}
        onClose={() => setDeleteSuccessOpen(false)}
        title="Department Deleted"
        message="Department has been successfully deleted."
        primaryButtonText="Done"
        onPrimaryClick={() => setDeleteSuccessOpen(false)}
      />
    </div>
  );
}
