"use client";

import { useState, useMemo } from "react";
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
import { CustomerStatus } from "../../../customer/[id]/page";

/* --------------------------------------------
 Types
--------------------------------------------- */
interface Department {
  name: string;
  id: string;
  createdDate: string;
  createdTime: string;
  createdBy: string;
  createdById: string;
  status: "Active" | "Deactivated";
}

/* --------------------------------------------
 Mock Data
--------------------------------------------- */
const departments: Department[] = [
  {
    name: "Internal Control",
    id: "7320",
    createdDate: "September 12, 2025",
    createdTime: "11:00 am",
    createdBy: "Kunle Dairo",
    createdById: "9023",
    status: "Active",
  },
  {
    name: "Risk Assessment",
    id: "9023",
    createdDate: "September 12, 2025",
    createdTime: "11:00 am",
    createdBy: "Marcus Lee",
    createdById: "9025",
    status: "Deactivated",
  },
  {
    name: "Financial Reporting",
    id: "1234",
    createdDate: "September 12, 2025",
    createdTime: "11:00 am",
    createdBy: "Sofia Wang",
    createdById: "9026",
    status: "Active",
  },
  {
    name: "External Audit",
    id: "8451",
    createdDate: "September 12, 2025",
    createdTime: "11:00 am",
    createdBy: "Aisha Patel",
    createdById: "9024",
    status: "Deactivated",
  },
  {
    name: "Compliance Review",
    id: "6789",
    createdDate: "September 12, 2025",
    createdTime: "11:00 am",
    createdBy: "Jamal Rivers",
    createdById: "9027",
    status: "Active",
  },
];

/* --------------------------------------------
 Component
--------------------------------------------- */
export default function DepartmentsTable() {
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Filter By");
  const [open, setOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);

  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [status, setStatus] = useState<CustomerStatus>("Active");
  const isCurrentlyActive = status === "Active";
  const actionVerb = isCurrentlyActive ? "Deactivate" : "Reactivate";
  const pastTenseVerb = isCurrentlyActive ? "Deactivated" : "Reactivated";
    const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  /* Search Filter */
  const filteredData = useMemo(() => {
    return departments.filter(
      (dept) =>
        dept.name.toLowerCase().includes(search.toLowerCase()) ||
        dept.id.includes(search),
    );
  }, [search]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const handleConfirm = () => {
    setStatus((prev) => (prev === "Active" ? "Deactivated" : "Active"));
    setDeactivateOpen(false);
    setIsSuccessOpen(true);
  };

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [page, filteredData]);

  /* Table Headers */
  const headers = [
    { label: "Department Name", key: "name" },
    { label: "Date Created", key: "date" },
    { label: "Created By", key: "createdBy" },
    { label: "Status", key: "status" },
    { label: "Action", key: "action" },
  ];

  /* Row Renderer */
  const renderRow = (dept: Department) => [
    <div key="name">
      <Text fw={500} size="sm">
        {dept.name}
      </Text>
      <Text size="xs" c="dimmed">
        ID:{dept.id}
      </Text>
    </div>,

    <div key="date">
      <Text size="sm">{dept.createdDate}</Text>
      <Text size="xs" c="dimmed">
        {dept.createdTime}
      </Text>
    </div>,

    <div key="createdBy">
      <Text size="sm">{dept.createdBy}</Text>
      <Text size="xs" c="dimmed">
        ID:{dept.createdById}
      </Text>
    </div>,

    <StatusBadge key="status" status={dept.status} />,

    <RowActionMenu
      key="actions"
      onView={() => {
        setSelectedDepartment(dept);
        setViewOpen(true);
      }}
      onEdit={() => {
        setSelectedDepartment(dept);
        setEditOpen(true);
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
            onChange={(e) => setSearch(e.currentTarget.value)}
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
            onClick={() => {setOpen(true);}}
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
        data={paginatedData}
        loading={false}
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
      <CreateDepartmentModal
        opened={open}
        onClose={() => setOpen(false)}
        onSave={(data) => {
          console.log(data);
          setOpen(false);
        }}
      />
      <ViewDepartmentModal
        opened={viewOpen}
        onClose={() => setViewOpen(false)}
        department={selectedDepartment}
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
