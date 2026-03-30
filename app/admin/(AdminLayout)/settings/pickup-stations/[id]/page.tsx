"use client";

import { useMemo, useState } from "react";
import {
  Button,
  Divider,
  Group,
  Menu,
  Select,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { ListFilter, Search, Upload } from "lucide-react";
import { useDebouncedValue } from "@mantine/hooks";
import { useParams, useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { DetailItem } from "@/app/admin/_components/DetailItem";
import FormModal, { FormField } from "@/app/admin/_components/FormModal";
import { ConfirmationModal } from "@/app/admin/_components/ConfirmationModal";
import { SuccessModal } from "@/app/admin/_components/SuccessModal";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import EmptySection from "@/app/admin/_components/EmptySection";
import { adminRoutes } from "@/lib/adminRoutes";

type StationStatus = "Active" | "Deleted";

type PickupStationDetails = {
  id: string;
  stationName: string;
  stationCode: string;
  location: string;
  address: string;
  state: string;
  region: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
  createdTime: string;
  status: StationStatus;
};

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

const STATION_SEED: PickupStationDetails = {
  id: "271625",
  stationName: "Ikeja Station",
  stationCode: "271625",
  location: "Ikeja, Lagos",
  address: "Block 14, Adeniyi Jones, Ikeja, Lagos",
  state: "Lagos State",
  region: "Ikeja",
  email: "ikeja1@sohcahtoa.com",
  phoneNumber: "+234 8056283635",
  createdAt: "Nov 17 2025",
  createdTime: "11:00am",
  status: "Active",
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

export default function PickupStationDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const stationId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [station, setStation] = useState<PickupStationDetails>({
    ...STATION_SEED,
    id: stationId || STATION_SEED.id,
    stationCode: stationId || STATION_SEED.stationCode,
  });
  const [pickups, setPickups] = useState<StationPickup[]>(PICKUPS_SEED);
  const [isDeleted, setIsDeleted] = useState(false);

  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 350);
  const [statusFilter, setStatusFilter] = useState("Filter By");
  const [page, setPage] = useState(1);

  const [editModalOpened, setEditModalOpened] = useState(false);
  const [editConfirmOpened, setEditConfirmOpened] = useState(false);
  const [editSuccessOpened, setEditSuccessOpened] = useState(false);
  const [deleteConfirmOpened, setDeleteConfirmOpened] = useState(false);
  const [deleteSuccessOpened, setDeleteSuccessOpened] = useState(false);
  const [pendingEditData, setPendingEditData] =
    useState<Record<string, unknown> | null>(null);

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

  const editFields: FormField[] = [
    {
      name: "stationName",
      label: "Station Name",
      type: "text",
      required: true,
      placeholder: "Ikeja Station 1",
    },
    {
      name: "address",
      label: "Physical Address",
      type: "text",
      required: true,
      placeholder: "Block 14, Adeniyi Jones, Ikeja Lagos",
    },
    {
      name: "state",
      label: "State",
      type: "select",
      required: true,
      options: [
        "Lagos State",
        "FCT",
        "Rivers State",
        "Kano State",
        "Kaduna State",
        "Oyo State",
      ],
    },
    {
      name: "region",
      label: "Region",
      type: "text",
      required: true,
      placeholder: "Ikeja",
    },
    {
      name: "email",
      label: "Email Address",
      type: "email",
      required: true,
      placeholder: "name@sohcahtoa.com",
    },
    {
      name: "phoneNumber",
      label: "Phone Number 1",
      type: "tel",
      required: true,
      placeholder: "+234 8056283635",
    },
  ];

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

  const handleEditSubmit = (data: Record<string, unknown>) => {
    setPendingEditData(data);
    setEditConfirmOpened(true);
  };

  const performEdit = () => {
    if (!pendingEditData) return;

    setStation((prev) => ({
      ...prev,
      stationName: String(pendingEditData.stationName ?? prev.stationName),
      address: String(pendingEditData.address ?? prev.address),
      state: String(pendingEditData.state ?? prev.state),
      region: String(pendingEditData.region ?? prev.region),
      email: String(pendingEditData.email ?? prev.email),
      phoneNumber: String(pendingEditData.phoneNumber ?? prev.phoneNumber),
      location: `${String(pendingEditData.region ?? prev.region)}, ${String(
        pendingEditData.state ?? prev.state
      )}`,
    }));

    setEditConfirmOpened(false);
    setEditModalOpened(false);
    setEditSuccessOpened(true);
    setPendingEditData(null);
  };

  const performDelete = () => {
    setDeleteConfirmOpened(false);
    setDeleteSuccessOpened(true);
    setIsDeleted(true);
    setStation((prev) => ({ ...prev, status: "Deleted" }));
    setPickups([]);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white p-5 shadow-sm space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Stack gap={4} className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <Text size="xl" fw={600}>
                {station.stationName}
              </Text>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-[#6B7280]">
              <span>
                <span className="font-medium text-[#111827]">Date Created:</span>{" "}
                {station.createdAt} | {station.createdTime}
              </span>
              <StatusBadge status={station.status} />
            </div>
          </Stack>

          <Menu position="bottom-end" shadow="md" width={180}>
            <Menu.Target>
              <Button
                radius="xl"
                size="md"
                color="#DD4F05"
                className="self-start md:self-auto"
              >
                Take Action
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item onClick={() => setEditModalOpened(true)}>Edit</Menu.Item>
              <Menu.Divider />
              <Menu.Item color="red" onClick={() => setDeleteConfirmOpened(true)}>
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </div>

        <Divider />

        <div>
          <Text fw={600} className="mb-4! text-orange-500!">
            Station Details
          </Text>
          <div className="grid gap-6 md:grid-cols-4">
            <DetailItem label="Station ID" value={station.stationCode} />
            <DetailItem label="Location" value={station.location} />
            <DetailItem label="Address" value={station.address} />
            <DetailItem label="Phone Number" value={station.phoneNumber} />
            <DetailItem label="Email Address" value={station.email} />
          </div>
        </div>
      </div>

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

        {isDeleted ? (
          <EmptySection
            title="Station Deleted"
            description="This station has been deleted. No further pick-up records are available."
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
              onPrevious: () =>
                setPage((current) => Math.max(current - 1, 1)),
              onPageChange: setPage,
            }}
          />
        )}
      </div>

      <FormModal
        opened={editModalOpened}
        onClose={() => setEditModalOpened(false)}
        title="Edit Pick-up Station"
        description="Make changes to this pick-up station information"
        fields={editFields}
        submitLabel="Save Changes"
        cancelLabel="Close"
        size="lg"
        initialValues={{
          stationName: station.stationName,
          address: station.address,
          state: station.state,
          region: station.region,
          email: station.email,
          phoneNumber: station.phoneNumber,
        }}
        onSubmit={handleEditSubmit}
      />

      <ConfirmationModal
        opened={editConfirmOpened}
        onClose={() => setEditConfirmOpened(false)}
        title="Save Changes ?"
        message="Are you sure, save and update this changes? Kindly note that this new changes would override the existing data."
        primaryButtonText="Yes, Save and Update Changes"
        secondaryButtonText="No, Close"
        onPrimary={performEdit}
        onSecondary={() => setEditConfirmOpened(false)}
      />

      <SuccessModal
        opened={editSuccessOpened}
        onClose={() => setEditSuccessOpened(false)}
        title="New Changes Saved"
        message="New Changes has been successfully Saved and Updated"
        primaryButtonText="Manage Stations"
        secondaryButtonText="No, Close"
        onPrimaryClick={() => {
          setEditSuccessOpened(false);
          router.push(adminRoutes.adminSettingsPickupStations());
        }}
        onSecondaryClick={() => setEditSuccessOpened(false)}
      />

      <ConfirmationModal
        opened={deleteConfirmOpened}
        onClose={() => setDeleteConfirmOpened(false)}
        title="Delete Station ?"
        message="Are you sure you want to delete this pick-up station? Kindly note that this action is irreversible, as data would be deleted permanently"
        primaryButtonText="Yes, Delete Station"
        secondaryButtonText="No, Close"
        onPrimary={performDelete}
        onSecondary={() => setDeleteConfirmOpened(false)}
      />

      <SuccessModal
        opened={deleteSuccessOpened}
        onClose={() => setDeleteSuccessOpened(false)}
        title="Station Deleted"
        message="Station has been successfully deleted."
        primaryButtonText="Manage Stations"
        secondaryButtonText="No, Close"
        onPrimaryClick={() => {
          setDeleteSuccessOpened(false);
          router.push(adminRoutes.adminSettingsPickupStations());
        }}
        onSecondaryClick={() => setDeleteSuccessOpened(false)}
      />
    </div>
  );
}