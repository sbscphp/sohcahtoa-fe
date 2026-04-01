"use client";

import { useMemo, useState } from "react";
import { Alert, Button, Divider, Menu, Stack, Text } from "@mantine/core";
import { useParams, useRouter } from "next/navigation";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { DetailItem } from "@/app/admin/_components/DetailItem";
import FormModal, { FormField } from "@/app/admin/_components/FormModal";
import { ConfirmationModal } from "@/app/admin/_components/ConfirmationModal";
import { SuccessModal } from "@/app/admin/_components/SuccessModal";
import EmptySection from "@/app/admin/_components/EmptySection";
import { adminRoutes } from "@/lib/adminRoutes";
import AllPickupsSection from "./AllPickupsSection";
import {
  usePickupStationDetails,
  type PickupStationDetailsViewModel,
} from "../../hooks/usePickupStationDetails";

export default function PickupStationDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const stationId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const {
    station: fetchedStation,
    isLoading,
    isError,
    error,
    isNotFound,
  } = usePickupStationDetails(stationId);
  const [stationOverride, setStationOverride] = useState<
    Partial<PickupStationDetailsViewModel> | null
  >(
    null
  );

  const [editModalOpened, setEditModalOpened] = useState(false);
  const [editConfirmOpened, setEditConfirmOpened] = useState(false);
  const [editSuccessOpened, setEditSuccessOpened] = useState(false);
  const [deleteConfirmOpened, setDeleteConfirmOpened] = useState(false);
  const [deleteSuccessOpened, setDeleteSuccessOpened] = useState(false);
  const [pendingEditData, setPendingEditData] =
    useState<Record<string, unknown> | null>(null);
  const station = useMemo(() => {
    if (!fetchedStation) return null;
    const merged = {
      ...fetchedStation,
      ...(stationOverride ?? {}),
    };
    const location = [merged.region, merged.state].filter(Boolean).join(", ");
    return { ...merged, location: location || "—" };
  }, [fetchedStation, stationOverride]);

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

  const handleEditSubmit = (data: Record<string, unknown>) => {
    setPendingEditData(data);
    setEditConfirmOpened(true);
  };

  const performEdit = () => {
    if (!pendingEditData || !station) return;

    setStationOverride((prev) => ({
      ...(prev ?? {}),
      stationName: String(
        pendingEditData.stationName ?? prev?.stationName ?? station.stationName
      ),
      address: String(
        pendingEditData.address ?? prev?.address ?? station.address
      ),
      state: String(pendingEditData.state ?? prev?.state ?? station.state),
      region: String(pendingEditData.region ?? prev?.region ?? station.region),
      email: String(pendingEditData.email ?? prev?.email ?? station.email),
      phoneNumber: String(
        pendingEditData.phoneNumber ??
          prev?.phoneNumber ??
          station.phoneNumber
      ),
      location: `${String(
        pendingEditData.region ?? prev?.region ?? station.region
      )}, ${String(
        pendingEditData.state ?? prev?.state ?? station.state
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
    setStationOverride((prev) => ({ ...(prev ?? {}), status: "Deleted" }));
  };

  if (!stationId) {
    return (
      <Alert color="red" title="Invalid pickup station">
        Missing pickup station id in the URL.
      </Alert>
    );
  }

  if (!isLoading && isNotFound) {
    return (
      <EmptySection
        title="Pick-up Station Not Found"
        description="The requested pick-up station could not be found."
      />
    );
  }

  return (
    <div className="space-y-6">
      {isError && (
        <Alert color="red" title="Could not load station details">
          {error?.message ?? "Unable to load pick-up station details right now."}
        </Alert>
      )}
      <div className="rounded-xl bg-white p-5 shadow-sm space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Stack gap={4} className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <Text size="xl" fw={600}>
                {station?.stationName ?? "—"}
              </Text>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-[#6B7280]">
              <span>
                <span className="font-medium text-[#111827]">Date Created:</span>{" "}
                {station?.createdAt ?? "—"} | {station?.createdTime ?? "—"}
              </span>
              <StatusBadge status={station?.status ?? "—"} />
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
            <DetailItem label="Station ID" value={station?.stationCode ?? "—"} />
            <DetailItem label="Location" value={station?.location ?? "—"} />
            <DetailItem label="Address" value={station?.address ?? "—"} />
            <DetailItem label="Phone Number" value={station?.phoneNumber ?? "—"} />
            <DetailItem label="Email Address" value={station?.email ?? "—"} />
          </div>
        </div>
      </div>

      <AllPickupsSection pickUpStationId={stationId} />

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
          stationName: station?.stationName ?? "",
          address: station?.address ?? "",
          state: station?.state ?? "",
          region: station?.region ?? "",
          email: station?.email ?? "",
          phoneNumber: station?.phoneNumber ?? "",
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