"use client";

import { useMemo, useState } from "react";
import { Button, Group, Select, Text, TextInput } from "@mantine/core";
import { ListFilter, Plus, Search, Upload } from "lucide-react";
import { useDebouncedValue } from "@mantine/hooks";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";
import { useCreateData, useGetExportData } from "@/app/_lib/api/hooks";
import type { ApiError, ApiResponse } from "@/app/_lib/api/client";
import { useQueryClient } from "@tanstack/react-query";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import RowActionIcon from "@/app/admin/_components/RowActionIcon";
import FormModal, { FormField } from "@/app/admin/_components/FormModal";
import { SuccessModal } from "@/app/admin/_components/SuccessModal";
import { adminRoutes } from "@/lib/adminRoutes";
import { adminApi } from "@/app/admin/_services/admin-api";
import { adminKeys } from "@/app/_lib/api/query-keys";
import { useOutletStates } from "../outlet/hooks/useOutletStates";
import {
  usePickupStations,
  type PickupStationRowItem,
} from "./hooks/usePickupStations";
import { useOutletCities } from "./hooks/useOutletCities";

const PAGE_SIZE = 6;
const ALL_STATES_VALUE = "__all_states__";

export default function PickUpStations() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 350);
  const [stateFilter, setStateFilter] = useState(ALL_STATES_VALUE);
  const [selectedCreateState, setSelectedCreateState] = useState<string | null>(null);
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const [successModalOpened, setSuccessModalOpened] = useState(false);
  const { states: outletStateOptions } = useOutletStates();
  const {
    cities: cityOptions,
    isLoading: isCitiesLoading,
    isFetching: isCitiesFetching,
  } = useOutletCities(selectedCreateState);
  const selectedState =
    stateFilter === ALL_STATES_VALUE ? undefined : stateFilter;
  const {
    stations,
    total,
    totalPages,
    isLoading,
    isFetching,
  } = usePickupStations({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    state: selectedState,
  });
  const exportPickupStationsMutation = useGetExportData(
    () =>
      adminApi.outlet.pickupStations.export({
        search: debouncedSearch || undefined,
        state: selectedState,
      }),
    {
      onSuccess: (csvBlob) => {
        const objectUrl = URL.createObjectURL(csvBlob);
        const link = document.createElement("a");
        const dateStamp = new Date().toISOString().slice(0, 10);

        link.href = objectUrl;
        link.download = `pickup-stations-${dateStamp}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(objectUrl);
      },
      onError: (error) => {
        const apiResponse = (error as unknown as ApiError).data as ApiResponse;
        notifications.show({
          title: "Export Pick-up Stations Failed",
          message:
            apiResponse?.error?.message ??
            (error as Error).message ??
            "Unable to export pick-up stations at the moment. Please try again.",
          color: "red",
        });
      },
    }
  );
  const createPickupStationMutation = useCreateData(
    adminApi.outlet.pickupStations.create,
    {
      onSuccess: async () => {
        setCreateModalOpened(false);
        setSuccessModalOpened(true);
        setSelectedCreateState(null);
        await queryClient.invalidateQueries({
          queryKey: [...adminKeys.outlet.pickupStations.all()],
        });
      },
      onError: (error) => {
        const apiResponse = (error as unknown as ApiError).data as ApiResponse;
        notifications.show({
          title: "Create Pick-up Station Failed",
          message:
            apiResponse?.error?.message ??
            (error as Error).message ??
            "Unable to create pick-up station at the moment. Please try again.",
          color: "red",
        });
      },
    }
  );

  const headers = [
    { label: "Station name", key: "stationName" },
    { label: "Location", key: "location" },
    { label: "Address", key: "address" },
    { label: "Date Created", key: "dateCreated" },
    { label: "Action", key: "action" },
  ];

  const stateOptions = useMemo(() => {
    return [
      { value: ALL_STATES_VALUE, label: "All States" },
      ...outletStateOptions,
    ];
  }, [outletStateOptions]);

  const createFields: FormField[] = useMemo(
    () => [
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
        options: outletStateOptions,
      },
      {
        name: "region",
        label: "Region",
        type: "select",
        required: true,
        options: cityOptions,
        disabled: !selectedCreateState || isCitiesLoading || isCitiesFetching,
        placeholder: selectedCreateState
          ? isCitiesLoading || isCitiesFetching
            ? "Loading cities..."
            : "Select city"
          : "Select state first",
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
    ],
    [
      cityOptions,
      isCitiesFetching,
      isCitiesLoading,
      outletStateOptions,
      selectedCreateState,
    ]
  );

  const renderRow = (station: PickupStationRowItem) => [
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
    await createPickupStationMutation.mutateAsync({
      stationName: String(data.stationName ?? ""),
      physicalAddress: String(data.address ?? ""),
      state: String(data.state ?? ""),
      region: String(data.region ?? ""),
      stationEmail: String(data.email ?? ""),
      phoneNumber: String(data.phoneNumber ?? ""),
      status: "Active",
    });
  };

  return (
    <div className="my-5 rounded-lg bg-white p-5">
      <Group justify="space-between" mb="md" wrap="wrap">
        <Group>
          <Text fw={600} size="lg">
            All Stations ({total})
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
              setStateFilter(value ?? ALL_STATES_VALUE);
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
            onClick={() => exportPickupStationsMutation.mutate()}
            loading={exportPickupStationsMutation.isPending}
            disabled={exportPickupStationsMutation.isPending}
          >
            Export
          </Button>
          <Button
            variant="filled"
            color="#DD4F05"
            radius="xl"
            leftSection={<Plus size={16} />}
            onClick={() => {
              setSelectedCreateState(null);
              setCreateModalOpened(true);
            }}
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
        onFieldChange={(name, value, currentData) => {
          if (name === "state") {
            const nextState = value ? String(value) : null;
            setSelectedCreateState(nextState);
            return {
              ...currentData,
              region: "",
            };
          }
          return currentData;
        }}
        onSubmit={handleCreateStation}
        submitLabel="Create Station"
        cancelLabel="Close"
        loading={createPickupStationMutation.isPending}
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
        data={stations}
        loading={isLoading || isFetching}
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