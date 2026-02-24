"use client";

import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { z } from "zod";
import { Button, Select, TextInput } from "@mantine/core";
import SelectableLocationCard from "@/app/(customer)/_components/forms/SelectableLocationCard";
import SelectableBankCard from "@/app/(customer)/_components/forms/SelectableBankCard";
import { EmptyState } from "@/app/(customer)/_components/common";
import { HugeiconsIcon } from "@hugeicons/react";
import { ChevronDown } from "@hugeicons/core-free-icons";
import { DateInput, TimeInput } from "@mantine/dates";

const pickupOnlySchema = z.object({
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  locationId: z.string().min(1, "Pickup location is required"),
  pickupDate: z.string().min(1, "Date of collection is required"),
  pickupTime: z.string().min(1, "Time of collection is required"),
});

const pickupOrBankSchema = z
  .object({
    preference: z.enum(["pickup", "bank"]),
    state: z.string(),
    city: z.string(),
    locationId: z.string(),
    selectedBankId: z.string(),
    pickupDate: z.string(),
    pickupTime: z.string(),
  })
  .refine(
    (data) => {
      if (data.preference === "pickup") {
        return (
          data.state.trim().length > 0 &&
          data.city.trim().length > 0 &&
          data.locationId.trim().length > 0 &&
          (data.pickupDate?.trim().length ?? 0) > 0 &&
          (data.pickupTime?.trim().length ?? 0) > 0
        );
      }
      return true;
    },
    { message: "Pickup location, date and time are required", path: ["locationId"] }
  )
  .refine(
    (data) => {
      if (data.preference === "bank") return data.selectedBankId.trim().length > 0;
      return true;
    },
    { message: "Please select a bank account", path: ["selectedBankId"] }
  );

export type PickupPointFormData = z.infer<typeof pickupOnlySchema>;

export type PickupOrBankFormData = z.infer<typeof pickupOrBankSchema>;

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
}

interface Location {
  id: string;
  name: string;
  address: string;
}

export type PreferenceMode = "pickup-only" | "pickup-or-bank";

export interface PickupPointStepProps {
  preferenceMode?: PreferenceMode;
  /** Main heading, e.g. "Select Pick Up Point" or "Select Drop Off Point" */
  title?: string;
  subtitle?: string;
  /** Primary button label */
  submitLabel?: string;
  initialValues?: Partial<PickupPointFormData | PickupOrBankFormData>;
  onSubmit: (data: any) => void;
  onBack?: () => void;
  locations?: Location[];
  states?: string[];
  cities?: string[];
  banks?: BankAccount[];
  onAddBank?: () => void;
}

const DEFAULT_LOCATIONS: Location[] = [
  { id: "1", name: "SOHCAHTOA LAGOS", address: "ADEOLA ODEKU . RD VICTORIA ISLAND" },
  { id: "2", name: "TRIGONOMETRY HUB", address: "LAGOS ISLAND" },
  { id: "3", name: "GEOMETRIC SPACE", address: "LAGOS MAINLAND" },
  { id: "4", name: "CALCULUS CIRCLE", address: "IKOYI" },
];

const DEFAULT_STATES = ["Lagos", "Abuja", "Port Harcourt", "Kano"];
const DEFAULT_CITIES = ["Lagos Island", "Victoria Island", "Ikoyi", "Lekki"];

const DEFAULT_SUBTITLE =
  "Select the closest sohcahtoa office to pick up your card and cash";

const DEFAULT_TITLE = "Select Pick Up Point";

export default function PickupPointStep({
  preferenceMode = "pickup-only",
  title = DEFAULT_TITLE,
  subtitle = DEFAULT_SUBTITLE,
  submitLabel = "Next",
  initialValues,
  onSubmit,
  onBack,
  locations = DEFAULT_LOCATIONS,
  states = DEFAULT_STATES,
  cities = DEFAULT_CITIES,
  banks = [],
  onAddBank,
}: PickupPointStepProps) {
  const isPickupOrBank = preferenceMode === "pickup-or-bank";

  const pickupOnlyForm = useForm<PickupPointFormData>({
    mode: "uncontrolled",
    initialValues: {
      state: (initialValues as Partial<PickupPointFormData>)?.state || "",
      city: (initialValues as Partial<PickupPointFormData>)?.city || "",
      locationId: (initialValues as Partial<PickupPointFormData>)?.locationId || "",
      pickupDate: (initialValues as Partial<PickupPointFormData>)?.pickupDate || "",
      pickupTime: (initialValues as Partial<PickupPointFormData>)?.pickupTime || "",
    },
    validate: zod4Resolver(pickupOnlySchema),
  });

  const pickupOrBankForm = useForm<PickupOrBankFormData>({
    mode: "uncontrolled",
    initialValues: {
      preference: (initialValues as Partial<PickupOrBankFormData>)?.preference || "pickup",
      state: (initialValues as Partial<PickupOrBankFormData>)?.state || "",
      city: (initialValues as Partial<PickupOrBankFormData>)?.city || "",
      locationId: (initialValues as Partial<PickupOrBankFormData>)?.locationId || "",
      selectedBankId: (initialValues as Partial<PickupOrBankFormData>)?.selectedBankId || "",
      pickupDate: (initialValues as Partial<PickupOrBankFormData>)?.pickupDate || "",
      pickupTime: (initialValues as Partial<PickupOrBankFormData>)?.pickupTime || "",
    },
    validate: zod4Resolver(pickupOrBankSchema),
  });

  const values = isPickupOrBank ? pickupOrBankForm.values : pickupOnlyForm.values;

  const preference = isPickupOrBank ? (values as PickupOrBankFormData).preference : "pickup";
  const state = "state" in values ? values.state : "";
  const city = "city" in values ? values.city : "";
  const locationId = "locationId" in values ? values.locationId : "";
  const selectedBankId = isPickupOrBank ? (values as PickupOrBankFormData).selectedBankId : "";

  const handleSubmit =
    preferenceMode === "pickup-only"
      ? pickupOnlyForm.onSubmit((v) => onSubmit(v))
      : pickupOrBankForm.onSubmit((v) => onSubmit(v));

  const filteredLocations =
    state && city
      ? locations.filter(
          (loc) =>
            loc.address.toLowerCase().includes(state.toLowerCase()) ||
            loc.address.toLowerCase().includes(city.toLowerCase())
        )
      : locations;

  const showPickupForm = !isPickupOrBank || preference === "pickup";
  const showBankForm = isPickupOrBank && preference === "bank";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col gap-2 justify-center items-center">
        <h2 className="text-body-heading-300 text-2xl font-semibold">
          {title}
        </h2>
        <p className="text-body-text-200 text-base max-w-md text-center">
          {subtitle}
        </p>
      </div>

      {isPickupOrBank && (
        <div className="flex rounded-md border border-gray-100 bg-gray-50/50 p-0.5 text-sm">
          <button
            type="button"
            onClick={() => pickupOrBankForm.setFieldValue("preference", "pickup")}
            className={`flex-1 py-2 px-3 rounded-[6px] text-xs font-medium transition-colors ${
              preference === "pickup"
                ? "bg-white text-[#4D4B4B] shadow-sm border border-gray-100"
                : "text-[#8F8B8B] hover:text-[#4D4B4B]"
            }`}
          >
            I Prefer to Pickup
          </button>
          <button
            type="button"
            onClick={() => pickupOrBankForm.setFieldValue("preference", "bank")}
            className={`flex-1 py-2 px-3 rounded-[6px] text-xs font-medium transition-colors ${
              preference === "bank"
                ? "bg-white text-[#4D4B4B] shadow-sm border border-gray-100"
                : "text-[#8F8B8B] hover:text-[#4D4B4B]"
            }`}
          >
            I Prefer Bank Transfer
          </button>
        </div>
      )}

      {showPickupForm && isPickupOrBank && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              key={pickupOrBankForm.key("state")}
              label="Select State"
              required
              placeholder="Select an Option"
              data={states}
              rightSection={
                <HugeiconsIcon icon={ChevronDown} size={20} className="text-text-300" />
              }
              size="md"
              {...pickupOrBankForm.getInputProps("state")}
            />
            <Select
              key={pickupOrBankForm.key("city")}
              label="Select City"
              required
              placeholder="Select an Option"
              data={cities}
              rightSection={
                <HugeiconsIcon icon={ChevronDown} size={20} className="text-text-300" />
              }
              size="md"
              {...pickupOrBankForm.getInputProps("city")}
            />
          </div>

          <div className="box-border flex flex-col items-start p-4 gap-6 w-full bg-white border border-gray-100 rounded-2xl shadow-[0px_1px_2px_rgba(16,24,40,0.05)]">
            <p className="text-body-text-200 text-base font-normal leading-6 flex-none">
              Pickup Locations ({filteredLocations.length.toString().padStart(2, "0")})
            </p>
            <div className="flex flex-col items-start w-full gap-4 max-h-[200px] overflow-y-auto">
              {!state || !city || filteredLocations.length === 0 ? (
                <EmptyState
                  title="No Data available"
                  description="Select a state and city to display location option"
                  className="w-full py-4"
                />
              ) : (
                filteredLocations.map((location) => (
                  <SelectableLocationCard
                    key={location.id}
                    name={location.name}
                    address={location.address}
                    isSelected={locationId === location.id}
                    onClick={() => pickupOrBankForm.setFieldValue("locationId", location.id)}
                  />
                ))
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput
              key={pickupOrBankForm.key("pickupDate")}
              label="Date of collection"
              required
              size="md"
              type="date"
              {...pickupOrBankForm.getInputProps("pickupDate")}
            />
            <TextInput
              key={pickupOrBankForm.key("pickupTime")}
              label="Time of collection"
              required
              size="md"
              type="time"
              {...pickupOrBankForm.getInputProps("pickupTime")}
            />
          </div>
        </>
      )}

      {showPickupForm && !isPickupOrBank && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              key={pickupOnlyForm.key("state")}
              label="Select State"
              required
              placeholder="Select an Option"
              data={states}
              rightSection={
                <HugeiconsIcon icon={ChevronDown} size={20} className="text-text-300" />
              }
              size="md"
              {...pickupOnlyForm.getInputProps("state")}
            />
            <Select
              key={pickupOnlyForm.key("city")}
              label="Select City"
              required
              placeholder="Select an Option"
              data={cities}
              rightSection={
                <HugeiconsIcon icon={ChevronDown} size={20} className="text-text-300" />
              }
              size="md"
              {...pickupOnlyForm.getInputProps("city")}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DateInput
              key={pickupOnlyForm.key("pickupDate")}
              label="Pick Up Date"
              placeholder="DD MM YYYY"
              required
              size="md"
              {...pickupOnlyForm.getInputProps("pickupDate")}
            />
            <TimeInput
              key={pickupOnlyForm.key("pickupTime")}
              label="Pick Up Time"
              placeholder="HH:MM"
              required
              size="md"
              {...pickupOnlyForm.getInputProps("pickupTime")}
            />
          </div>

          <div className="box-border flex flex-col items-start p-4 gap-6 w-full bg-white border border-gray-100 rounded-2xl shadow-[0px_1px_2px_rgba(16,24,40,0.05)]">
            <p className="text-body-text-200 text-base font-normal leading-6 flex-none">
              Pickup Locations ({filteredLocations.length.toString().padStart(2, "0")})
            </p>
            <div className="flex flex-col items-start w-full gap-4 max-h-[200px] overflow-y-auto">
              {!state || !city || filteredLocations.length === 0 ? (
                <EmptyState
                  title="No Data available"
                  description="Select a state and city to display location option"
                  className="w-full py-4"
                />
              ) : (
                filteredLocations.map((location) => (
                  <SelectableLocationCard
                    key={location.id}
                    name={location.name}
                    address={location.address}
                    isSelected={locationId === location.id}
                    onClick={() => pickupOnlyForm.setFieldValue("locationId", location.id)}
                  />
                ))
              )}
            </div>
          </div>
        </>
      )}

      {showBankForm && (
        <div className="box-border flex flex-col items-start p-4 gap-6 w-full bg-white border border-gray-100 rounded-2xl shadow-[0px_1px_2px_rgba(16,24,40,0.05)]">
          <p className="text-body-text-200 text-base font-normal leading-6 flex-none">
            Bank Accounts ({banks.length.toString().padStart(2, "0")})
          </p>
          <div className="flex flex-col items-start w-full gap-4 max-h-[200px] overflow-y-auto">
            {banks.length === 0 ? (
              <EmptyState
                title="No Data available"
                description="Add a bank account to receive your funds"
                className="w-full py-4"
              />
            ) : (
              banks.map((bank) => (
                <SelectableBankCard
                  key={bank.id}
                  bankName={bank.bankName}
                  accountNumber={bank.accountNumber}
                  accountName={bank.accountName}
                  isSelected={selectedBankId === bank.id}
                  onClick={() => pickupOrBankForm.setFieldValue("selectedBankId", bank.id)}
                />
              ))
            )}
          </div>
          {onAddBank && (
            <button
              type="button"
              onClick={onAddBank}
              className="flex items-center gap-2 text-primary-400 font-medium text-sm hover:underline"
            >
              <span className="text-lg leading-none">+</span> Add New Bank
            </button>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-center w-full">
        {onBack && (
          <Button
            type="button"
            variant="outline"
            size="md"
            radius="xl"
            className="border-gray-200! text-body-text-200! w-full sm:w-[188px]! min-h-[48px] h-[48px]!"
            onClick={onBack}
          >
            Back
          </Button>
        )}
        <Button
          type="submit"
          variant="filled"
          size="md"
          radius="xl"
          className="w-full sm:w-[188px]! min-h-[48px] h-[48px]!"
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
