"use client";

import { useMemo, useState } from "react";
import { Button, Group, Select, Text, TextInput } from "@mantine/core";
import { ListFilter, Plus, Search, Upload } from "lucide-react";
import { useDebouncedValue } from "@mantine/hooks";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import RowActionIcon from "@/app/admin/_components/RowActionIcon";
import FormModal, { FormField } from "@/app/admin/_components/FormModal";
import { SuccessModal } from "@/app/admin/_components/SuccessModal";
import { adminRoutes } from "@/lib/adminRoutes";

type PickUpStation = {
  id: string;
  stationName: string;
  stationId: string;
  location: string;
  address: string;
  state: string;
  region: string;
  email: string;
  phoneNumber: string;
  dateCreated: string;
  timeCreated: string;
};

const PAGE_SIZE = 6;

const INITIAL_STATIONS: PickUpStation[] = [
  {
    id: "8933",
    stationName: "Ikeja Station 1",
    stationId: "8933",
    location: "Ikeja, Lagos",
    address: "Block 14, Adeniyi Jones, Ikeja",
    state: "Lagos State",
    region: "Ikeja",
    email: "ikeja1@socatoa.com",
    phoneNumber: "+234 8056283635",
    dateCreated: "September 12, 2025",
    timeCreated: "11:00 am",
  },
  {
    id: "8935",
    stationName: "Agungi Station",
    stationId: "8935",
    location: "Eti-Osa 3, Lagos",
    address: "A3, Parks Estate, Agungi bus-stop, Lagos",
    state: "Lagos State",
    region: "Eti-Osa",
    email: "agungi@socatoa.com",
    phoneNumber: "+234 8021234567",
    dateCreated: "September 12, 2025",
    timeCreated: "11:00 am",
  },
  {
    id: "8936",
    stationName: "Maitama Station",
    stationId: "8936",
    location: "Maitama, Abuja",
    address: "34, Bourdillon Road, Ikoyi, Lagos",
    state: "FCT",
    region: "Maitama",
    email: "maitama@socatoa.com",
    phoneNumber: "+234 8070001122",
    dateCreated: "September 12, 2025",
    timeCreated: "11:00 am",
  },
  {
    id: "8934",
    stationName: "Trans-Amadi Station",
    stationId: "8934",
    location: "Port Harcourt, Rivers",
    address: "12, Trans Amadi Road, Port Harcourt",
    state: "Rivers State",
    region: "Trans-Amadi",
    email: "transamadi@socatoa.com",
    phoneNumber: "+234 8081112233",
    dateCreated: "September 12, 2025",
    timeCreated: "11:00 am",
  },
  {
    id: "8937",
    stationName: "Kano Station 1",
    stationId: "8937",
    location: "Kano, Kano State",
    address: "7, Gwani Muktar Road, Kano",
    state: "Kano State",
    region: "Nassarawa",
    email: "kano1@socatoa.com",
    phoneNumber: "+234 8093334455",
    dateCreated: "September 12, 2025",
    timeCreated: "11:00 am",
  },
  {
    id: "8938",
    stationName: "Abuja Station 3",
    stationId: "8938",
    location: "CBD, Abuja",
    address: "Plot 23, Cadastral Zone, Central Business District",
    state: "FCT",
    region: "CBD",
    email: "abuja3@socatoa.com",
    phoneNumber: "+234 8067778899",
    dateCreated: "September 12, 2025",
    timeCreated: "11:00 am",
  },
  {
    id: "8939",
    stationName: "Lekki Station",
    stationId: "8939",
    location: "Lekki, Lagos",
    address: "16, Admiralty Way, Lekki Phase 1",
    state: "Lagos State",
    region: "Lekki",
    email: "lekki@socatoa.com",
    phoneNumber: "+234 8019991010",
    dateCreated: "September 12, 2025",
    timeCreated: "11:00 am",
  },
  {
    id: "8940",
    stationName: "Yaba Station",
    stationId: "8940",
    location: "Yaba, Lagos",
    address: "2, Herbert Macaulay Way, Yaba",
    state: "Lagos State",
    region: "Yaba",
    email: "yaba@socatoa.com",
    phoneNumber: "+234 8041213141",
    dateCreated: "September 12, 2025",
    timeCreated: "11:00 am",
  },
  {
    id: "8941",
    stationName: "Wuse Station",
    stationId: "8941",
    location: "Wuse, Abuja",
    address: "18, Aminu Kano Crescent, Wuse 2",
    state: "FCT",
    region: "Wuse",
    email: "wuse@socatoa.com",
    phoneNumber: "+234 8031516171",
    dateCreated: "September 12, 2025",
    timeCreated: "11:00 am",
  },
  {
    id: "8942",
    stationName: "GRA Station",
    stationId: "8942",
    location: "GRA, Port Harcourt",
    address: "9, King Perekule Street, GRA Phase 2",
    state: "Rivers State",
    region: "GRA",
    email: "gra@socatoa.com",
    phoneNumber: "+234 8051819202",
    dateCreated: "September 12, 2025",
    timeCreated: "11:00 am",
  },
  {
    id: "8943",
    stationName: "Kaduna Station",
    stationId: "8943",
    location: "Barnawa, Kaduna",
    address: "21, Ali Akilu Road, Kaduna",
    state: "Kaduna State",
    region: "Barnawa",
    email: "kaduna@socatoa.com",
    phoneNumber: "+234 8072122232",
    dateCreated: "September 12, 2025",
    timeCreated: "11:00 am",
  },
  {
    id: "8944",
    stationName: "Ibadan Station",
    stationId: "8944",
    location: "Bodija, Ibadan",
    address: "10, Awolowo Avenue, Bodija",
    state: "Oyo State",
    region: "Bodija",
    email: "ibadan@socatoa.com",
    phoneNumber: "+234 8092425262",
    dateCreated: "September 12, 2025",
    timeCreated: "11:00 am",
  },
];

export default function PickUpStations() {
  const router = useRouter();
  const [stations, setStations] = useState<PickUpStation[]>(INITIAL_STATIONS);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 350);
  const [stateFilter, setStateFilter] = useState("All States");
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const [successModalOpened, setSuccessModalOpened] = useState(false);

  const headers = [
    { label: "Station name", key: "stationName" },
    { label: "Location", key: "location" },
    { label: "Address", key: "address" },
    { label: "Date Created", key: "dateCreated" },
    { label: "Action", key: "action" },
  ];

  const stateOptions = useMemo(() => {
    const uniqueStates = Array.from(new Set(stations.map((station) => station.state)));
    return ["All States", ...uniqueStates];
  }, [stations]);

  const filteredStations = useMemo(() => {
    const keyword = debouncedSearch.trim().toLowerCase();
    return stations.filter((station) => {
      const matchesSearch =
        !keyword ||
        station.stationName.toLowerCase().includes(keyword) ||
        station.stationId.toLowerCase().includes(keyword) ||
        station.location.toLowerCase().includes(keyword) ||
        station.address.toLowerCase().includes(keyword);

      const matchesState = stateFilter === "All States" || station.state === stateFilter;

      return matchesSearch && matchesState;
    });
  }, [stations, debouncedSearch, stateFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredStations.length / PAGE_SIZE));

  const paginatedStations = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredStations.slice(start, start + PAGE_SIZE);
  }, [filteredStations, page]);

  const createFields: FormField[] = [
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
      options: ["Lagos State", "FCT", "Rivers State", "Kano State", "Kaduna State", "Oyo State"],
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
      placeholder: "name@socatoa.com",
    },
    {
      name: "phoneNumber",
      label: "Phone Number 1",
      type: "tel",
      required: true,
      placeholder: "+234 8056283635",
    },
  ];

  const renderRow = (station: PickUpStation) => [
    <div key="stationName">
      <Text fw={500} size="sm">
        {station.stationName}
      </Text>
      <Text size="xs" c="dimmed">
        ID:{station.stationId}
      </Text>
    </div>,
    <Text key="location" size="sm">
      {station.location}
    </Text>,
    <Text key="address" size="sm">
      {station.address}
    </Text>,
    <div key="dateCreated">
      <Text fw={500} size="sm">
        {station.dateCreated}
      </Text>
      <Text size="xs" c="dimmed">
        {station.timeCreated}
      </Text>
    </div>,
    <RowActionIcon
      key="action"
      onClick={() => router.push(adminRoutes.adminSettingsPickupStationDetails(station.id))}
    />,
  ];

  const handleCreateStation = async (data: Record<string, unknown>) => {
    const now = new Date();
    const id = String(Date.now());
    const newStation: PickUpStation = {
      id,
      stationId: id.slice(-4),
      stationName: String(data.stationName ?? ""),
      address: String(data.address ?? ""),
      state: String(data.state ?? ""),
      region: String(data.region ?? ""),
      email: String(data.email ?? ""),
      phoneNumber: String(data.phoneNumber ?? ""),
      location: `${String(data.region ?? "")}, ${String(data.state ?? "")}`,
      dateCreated: now.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      timeCreated: now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    };

    setStations((prev) => [newStation, ...prev]);
    setCreateModalOpened(false);
    setSuccessModalOpened(true);
    setPage(1);
  };

  return (
    <div className="my-5 rounded-lg bg-white p-5">
      <Group justify="space-between" mb="md" wrap="wrap">
        <Group>
          <Text fw={600} size="lg">
            All Stations ({filteredStations.length})
          </Text>
          <TextInput
            placeholder="Enter keyword"
            leftSection={<Search size={16} color="#DD4F05" />}
            value={search}
            onChange={(event) => {
              setSearch(event.currentTarget.value);
              setPage(1);
            }}
            w={360}
            radius="xl"
          />
        </Group>

        <Group>
          <Select
            value={stateFilter}
            onChange={(value) => {
              setStateFilter(value ?? "All States");
              setPage(1);
            }}
            data={stateOptions}
            radius="xl"
            w={150}
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
          <Button
            variant="filled"
            color="#DD4F05"
            radius="xl"
            leftSection={<Plus size={16} />}
            onClick={() => setCreateModalOpened(true)}
          >
            Add New
          </Button>
        </Group>
      </Group>

      <FormModal
        opened={createModalOpened}
        onClose={() => setCreateModalOpened(false)}
        title="Create New Pick-up Station"
        description="Add a new pick-up address for customers to pick-up their cards"
        fields={createFields}
        onSubmit={handleCreateStation}
        submitLabel="Create Station"
        cancelLabel="Close"
      />

      <SuccessModal
        opened={successModalOpened}
        onClose={() => setSuccessModalOpened(false)}
        title="Pick-up Station Created"
        message="Station successfully created. This station will now be visible to customers as pick-up station."
        primaryButtonText="Manage Stations"
        onPrimaryClick={() => setSuccessModalOpened(false)}
      />

      <DynamicTableSection
        headers={headers}
        data={paginatedStations}
        renderItems={renderRow}
        emptyTitle="No Stations Found"
        emptyMessage="There are currently no pick-up stations to display. Add a station to get started."
        pagination={{
          page,
          totalPages,
          onNext: () => setPage((current) => Math.min(current + 1, totalPages)),
          onPrevious: () => setPage((current) => Math.max(current - 1, 1)),
          onPageChange: setPage,
        }}
      />
    </div>
  );
}