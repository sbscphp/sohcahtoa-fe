"use client";

import { useMemo, useState } from "react";
import { Button, Group, Select, Text, TextInput } from "@mantine/core";
import { ListFilter, Search, Upload } from "lucide-react";
import { useDebouncedValue } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import EmptySection from "@/app/admin/_components/EmptySection";

type StationPickupStatus = "Picked Up" | "Pending";

type StationPickup = {
  id: string;
  customerName: string;
  customerCode: string;
  phoneNumber: string;
  email: string;
  date: string;
  time: string;
  type: string;
  status: StationPickupStatus;
};

const PICKUPS_SEED: StationPickup[] = [
  {
    id: "9023",
    customerName: "Tunde Bashorun",
    customerCode: "9023",
    phoneNumber: "+234 90 2323 4545",
    email: "tunde@emailglobal.com",
    date: "September 12, 2025",
    time: "11:00 am",
    type: "Card",
    status: "Picked Up",
  },
  {
    id: "9025",
    customerName: "Marcus Lee",
    customerCode: "9025",
    phoneNumber: "+234 90 5858 3939",
    email: "queen@kudimafa.com",
    date: "September 12, 2025",
    time: "11:00 am",
    type: "Card and cash",
    status: "Pending",
  },
  {
    id: "9026",
    customerName: "Sofia Wang",
    customerCode: "9026",
    phoneNumber: "+234 91 2222 4545",
    email: "olubankisamuel@gmail.com",
    date: "September 12, 2025",
    time: "11:00 am",
    type: "120",
    status: "Picked Up",
  },
  {
    id: "9024",
    customerName: "Aisha Patel",
    customerCode: "9024",
    phoneNumber: "+234 90 5858 3939",
    email: "ibrahim@sultan.com",
    date: "September 12, 2025",
    time: "11:00 am",
    type: "50",
    status: "Pending",
  },
  {
    id: "9027",
    customerName: "Jamal Rivers",
    customerCode: "9027",
    phoneNumber: "+234 90 2323 4545",
    email: "mubto@greenfield.com",
    date: "September 12, 2025",
    time: "11:00 am",
    type: "60",
    status: "Picked Up",
  },
  {
    id: "9028",
    customerName: "Kunle Dairo",
    customerCode: "9028",
    phoneNumber: "+234 81 0000 3456",
    email: "nagode@gmail.com",
    date: "September 12, 2025",
    time: "11:00 am",
    type: "98",
    status: "Picked Up",
  },
  {
    id: "9029",
    customerName: "Ada Obinna",
    customerCode: "9029",
    phoneNumber: "+234 80 1212 4545",
    email: "adao@novadigital.com",
    date: "September 13, 2025",
    time: "09:40 am",
    type: "Card",
    status: "Pending",
  },
  {
    id: "9030",
    customerName: "Wale Yusuf",
    customerCode: "9030",
    phoneNumber: "+234 70 3434 2323",
    email: "wyusuf@mail.com",
    date: "September 13, 2025",
    time: "10:05 am",
    type: "Card",
    status: "Picked Up",
  },
];

const PICKUPS_PAGE_SIZE = 6;

export default function AllPickupsSection({
  pickUpStationId,
}: {
  pickUpStationId: string;
}) {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 350);
  const [statusFilter, setStatusFilter] = useState("Filter By");
  const [page, setPage] = useState(1);

  // Keep local mock behavior for now; ready to swap to station-scoped API later.
  void pickUpStationId;
  const pickups = PICKUPS_SEED;

  const headers = [
    { label: "Customer", key: "customer" },
    { label: "Contact", key: "contact" },
    { label: "Date & Time", key: "dateAndTime" },
    { label: "Type", key: "type" },
    { label: "Status", key: "status" },
  ];

  const filteredPickups = useMemo(() => {
    const keyword = debouncedSearch.trim().toLowerCase();
    return pickups.filter((pickup) => {
      const matchesSearch =
        !keyword ||
        pickup.customerName.toLowerCase().includes(keyword) ||
        pickup.customerCode.toLowerCase().includes(keyword) ||
        pickup.phoneNumber.toLowerCase().includes(keyword) ||
        pickup.email.toLowerCase().includes(keyword) ||
        pickup.type.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "Filter By" ||
        statusFilter === "All" ||
        pickup.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [pickups, debouncedSearch, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPickups.length / PICKUPS_PAGE_SIZE)
  );

  const paginatedPickups = useMemo(() => {
    const start = (page - 1) * PICKUPS_PAGE_SIZE;
    return filteredPickups.slice(start, start + PICKUPS_PAGE_SIZE);
  }, [filteredPickups, page]);

  const renderPickupRow = (pickup: StationPickup) => [
    <div key="customer">
      <Text fw={500} size="sm">
        {pickup.customerName}
      </Text>
      <Text size="xs" c="dimmed">
        ID:{pickup.customerCode}
      </Text>
    </div>,
    <div key="contact">
      <Text fw={500} size="sm">
        {pickup.phoneNumber}
      </Text>
      <Text size="xs" c="dimmed">
        {pickup.email}
      </Text>
    </div>,
    <div key="dateAndTime">
      <Text fw={500} size="sm">
        {pickup.date}
      </Text>
      <Text size="xs" c="dimmed">
        {pickup.time}
      </Text>
    </div>,
    <Text key="type" size="sm">
      {pickup.type}
    </Text>,
    <StatusBadge
      key="status"
      status={pickup.status}
      color={pickup.status === "Picked Up" ? "#2563EB" : "#B54708"}
    />,
  ];

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <Group justify="space-between" mb="md" wrap="wrap">
        <Group>
          <Text fw={600} size="lg">
            All Pick-ups
          </Text>
          <TextInput
            placeholder="Enter keyword"
            leftSection={<Search size={16} color="#DD4F05" />}
            value={search}
            onChange={(event) => {
              setSearch(event.currentTarget.value);
              setPage(1);
            }}
            w={320}
            radius="xl"
          />
        </Group>

        <Group>
          <Select
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value ?? "Filter By");
              setPage(1);
            }}
            data={["Filter By", "All", "Picked Up", "Pending"]}
            radius="xl"
            w={120}
            rightSection={<ListFilter size={16} />}
          />
          <Button
            variant="outline"
            color="#DD4F05"
            radius="xl"
            rightSection={<Upload size={16} />}
            onClick={() =>
              notifications.show({
                title: "Export not available",
                message: "Export is a design placeholder in this phase.",
                color: "blue",
              })
            }
          >
            Export
          </Button>
        </Group>
      </Group>

      {paginatedPickups.length === 0 ? (
        <EmptySection
          title="No Pick-ups Found"
          description="No pick-up records match your search or filter."
        />
      ) : (
        <DynamicTableSection
          headers={headers}
          data={paginatedPickups}
          renderItems={renderPickupRow}
          emptyTitle="No Pick-ups Found"
          emptyMessage="No pick-up records match your search or filter."
          pagination={{
            page,
            totalPages,
            onNext: () => setPage((current) => Math.min(current + 1, totalPages)),
            onPrevious: () => setPage((current) => Math.max(current - 1, 1)),
            onPageChange: setPage,
          }}
        />
      )}
    </div>
  );
}
