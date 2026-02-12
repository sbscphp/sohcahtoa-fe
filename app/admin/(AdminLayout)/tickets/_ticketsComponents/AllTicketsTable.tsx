"use client";

import { useState, useMemo } from "react";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import RowActionIcon from "@/app/admin/_components/RowActionIcon";
import { Group, TextInput, Select, Button, Text } from "@mantine/core";
import { ListFilter, Plus, Search, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { adminRoutes } from "@/lib/adminRoutes";

export type TicketStatus = "Resolved" | "Open" | "In progress" | "Closed";
export type TicketPriority = "High" | "Medium" | "Low";

export interface TicketRow {
  id: string;
  customerName: string;
  customerEmail: string;
  date: string;
  time: string;
  assignedTo: string;
  assignedRole: string;
  status: TicketStatus;
  priority: TicketPriority;
}

const TICKET_DATA: TicketRow[] = [
  {
    id: "1001",
    customerName: "Liam Neeson",
    customerEmail: "liam@fictitiousmail.com",
    date: "September 12, 2025",
    time: "11:00 am",
    assignedTo: "Jide Adeola",
    assignedRole: "System Admin",
    status: "Resolved",
    priority: "High",
  },
  {
    id: "1002",
    customerName: "Emma Watson",
    customerEmail: "emma@fakedomain.com",
    date: "September 12, 2025",
    time: "11:00 am",
    assignedTo: "Finance",
    assignedRole: "Department",
    status: "Open",
    priority: "Medium",
  },
  {
    id: "1003",
    customerName: "Noah Smith",
    customerEmail: "noah@samplemail.net",
    date: "September 12, 2025",
    time: "11:00 am",
    assignedTo: "Jide Adeola",
    assignedRole: "CRM Manager",
    status: "Resolved",
    priority: "Low",
  },
  {
    id: "1004",
    customerName: "Ava Brown",
    customerEmail: "ava@mockemail.org",
    date: "September 12, 2025",
    time: "11:00 am",
    assignedTo: "Marketing",
    assignedRole: "Department",
    status: "Resolved",
    priority: "Medium",
  },
  {
    id: "1005",
    customerName: "Ethan Hunt",
    customerEmail: "ethan@theoreticalmail.com",
    date: "September 12, 2025",
    time: "11:00 am",
    assignedTo: "Sodiq Dairo",
    assignedRole: "Settlement Manager",
    status: "In progress",
    priority: "High",
  },
  {
    id: "1006",
    customerName: "Sophia Turner",
    customerEmail: "sophia@imaginarymail.com",
    date: "September 12, 2025",
    time: "11:00 am",
    assignedTo: "Internal Control",
    assignedRole: "",
    status: "Closed",
    priority: "High",
  },
  // Additional mock tickets to match stat (15 total) and multi-page pagination
  {
    id: "1007",
    customerName: "James Wilson",
    customerEmail: "james@example.com",
    date: "September 13, 2025",
    time: "09:30 am",
    assignedTo: "Support",
    assignedRole: "Department",
    status: "Resolved",
    priority: "Low",
  },
  {
    id: "1008",
    customerName: "Olivia Davis",
    customerEmail: "olivia@example.com",
    date: "September 13, 2025",
    time: "02:15 pm",
    assignedTo: "Jide Adeola",
    assignedRole: "System Admin",
    status: "Open",
    priority: "Medium",
  },
  {
    id: "1009",
    customerName: "William Brown",
    customerEmail: "william@example.com",
    date: "September 14, 2025",
    time: "10:00 am",
    assignedTo: "Finance",
    assignedRole: "Department",
    status: "Resolved",
    priority: "High",
  },
  {
    id: "1010",
    customerName: "Isabella Martinez",
    customerEmail: "isabella@example.com",
    date: "September 14, 2025",
    time: "11:45 am",
    assignedTo: "Sodiq Dairo",
    assignedRole: "Settlement Manager",
    status: "In progress",
    priority: "Medium",
  },
  {
    id: "1011",
    customerName: "Benjamin Garcia",
    customerEmail: "benjamin@example.com",
    date: "September 15, 2025",
    time: "08:00 am",
    assignedTo: "Marketing",
    assignedRole: "Department",
    status: "Resolved",
    priority: "Low",
  },
  {
    id: "1012",
    customerName: "Mia Anderson",
    customerEmail: "mia@example.com",
    date: "September 15, 2025",
    time: "03:30 pm",
    assignedTo: "Internal Control",
    assignedRole: "",
    status: "Closed",
    priority: "High",
  },
  {
    id: "1013",
    customerName: "Lucas Thomas",
    customerEmail: "lucas@example.com",
    date: "September 16, 2025",
    time: "01:00 pm",
    assignedTo: "Jide Adeola",
    assignedRole: "CRM Manager",
    status: "Open",
    priority: "Medium",
  },
  {
    id: "1014",
    customerName: "Charlotte Jackson",
    customerEmail: "charlotte@example.com",
    date: "September 16, 2025",
    time: "04:45 pm",
    assignedTo: "Finance",
    assignedRole: "Department",
    status: "Resolved",
    priority: "Low",
  },
  {
    id: "1015",
    customerName: "Henry White",
    customerEmail: "henry@example.com",
    date: "September 17, 2025",
    time: "09:15 am",
    assignedTo: "Support",
    assignedRole: "Department",
    status: "In progress",
    priority: "High",
  },
];

const ticketHeaders = [
  { label: "Incident ID", key: "id" },
  { label: "Customer", key: "customer" },
  { label: "Date", key: "date" },
  { label: "Assigned to", key: "assigned" },
  { label: "Status", key: "status" },
  { label: "Priority", key: "priority" },
  { label: "Action", key: "action" },
];

const priorityColorMap: Record<TicketPriority, string> = {
  High: "text-red-600",
  Medium: "text-amber-600",
  Low: "text-blue-600",
};

const priorityDotColorMap: Record<TicketPriority, string> = {
  High: "bg-red-500",
  Medium: "bg-amber-500",
  Low: "bg-blue-500",
};

export default function AllTicketsTable() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Filter By");
  const pageSize = 6;

  const filteredData = useMemo(() => {
    return TICKET_DATA.filter((t) => {
      const matchesSearch =
        t.id.includes(search) ||
        t.customerName.toLowerCase().includes(search.toLowerCase()) ||
        t.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
        t.assignedTo.toLowerCase().includes(search.toLowerCase()) ||
        t.assignedRole.toLowerCase().includes(search.toLowerCase());
      const matchesFilter =
        filter === "Filter By" ||
        filter === "All" ||
        t.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [search, filter]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [page, filteredData]);

  const renderRow = (item: TicketRow) => [
    <Text key="id" size="sm" fw={500}>
      ID: {item.id}
    </Text>,
    <div key="customer">
      <Text fw={500} size="sm">
        {item.customerName}
      </Text>
      <Text size="xs" c="dimmed">
        {item.customerEmail}
      </Text>
    </div>,
    <div key="date">
      <Text size="sm">{item.date}</Text>
      <Text size="xs" c="dimmed">
        {item.time}
      </Text>
    </div>,
    <div key="assigned">
      <Text fw={500} size="sm">
        {item.assignedTo}
      </Text>
      {item.assignedRole && (
        <Text size="xs" c="dimmed">
          {item.assignedRole}
        </Text>
      )}
    </div>,
    <StatusBadge key="status" status={item.status} />,
    <div key="priority" className="flex items-center gap-1.5">
      <span
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${priorityDotColorMap[item.priority]}`}
        aria-hidden
      />
      <Text size="sm" className={priorityColorMap[item.priority]}>
        {item.priority}
      </Text>
    </div>,
    <RowActionIcon
      key="action"
      onClick={() => router.push(adminRoutes.adminTicketDetails(item.id))}
    />,
  ];

  return (
    <div className="rounded-lg bg-white p-5 shadow-sm">
      <Group justify="space-between" mb="md" wrap="wrap">
        <div className="flex flex-wrap items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900">All Tickets</h2>
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
        </div>
        <Group>
          <Select
            value={filter}
            onChange={(value) => {
              setFilter(value!);
              setPage(1);
            }}
            data={[
              "Filter By",
              "All",
              "Resolved",
              "Open",
              "In progress",
              "Closed",
            ]}
            radius="xl"
            w={120}
            rightSection={<ListFilter size={16} />}
          />
          <Button
            variant="outline"
            color="#E36C2F"
            radius="xl"
            rightSection={<Upload size={16} />}
          >
            Export
          </Button>
          <Button
            variant="filled"
            color="#DD4F05"
            radius="xl"
            leftSection={<Plus size={16} />}
            onClick={() => router.push(adminRoutes.adminTicketCreate())}
          >
            Add New +
          </Button>
        </Group>
      </Group>
      <DynamicTableSection
        headers={ticketHeaders}
        data={paginatedData}
        loading={false}
        renderItems={renderRow}
        emptyTitle="No Tickets Found"
        emptyMessage="There are currently no tickets to display."
        pagination={{
          page,
          totalPages,
          onNext: () => setPage((p) => Math.min(p + 1, totalPages)),
          onPrevious: () => setPage((p) => Math.max(p - 1, 1)),
          onPageChange: setPage,
        }}
      />
    </div>
  );
}
