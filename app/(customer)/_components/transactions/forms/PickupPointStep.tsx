"use client";

import { useMemo } from "react";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { z } from "zod";
import { Button, Loader, Select, TextInput } from "@mantine/core";
import SelectableLocationCard from "@/app/(customer)/_components/forms/SelectableLocationCard";
import SelectableBankCard from "@/app/(customer)/_components/forms/SelectableBankCard";
import { EmptyState } from "@/app/(customer)/_components/common";
import { HugeiconsIcon } from "@hugeicons/react";
import { ChevronDown } from "@hugeicons/core-free-icons";
import { DateInput, TimeInput } from "@mantine/dates";
import { useFetchData } from "@/app/_lib/api/hooks";
import { customerApi } from "@/app/(customer)/_services/customer-api";
import { customerKeys } from "@/app/_lib/api/query-keys";
import type { PickupTerminalsQueryParams } from "@/app/_lib/api/types";

function toIsoDateString(value: unknown): string | undefined {
  if (value == null || value === "") return undefined;
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return undefined;
    return value.toISOString().slice(0, 10);
  }
  const s = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString().slice(0, 10);
}

function toHHmm(value: unknown): string | undefined {
  if (value == null || value === "") return undefined;
  const s = String(value).trim();
  const m = /^(\d{1,2}):(\d{2})/.exec(s);
  if (!m) return undefined;
  return `${m[1]!.padStart(2, "0")}:${m[2]}`;
}

function toStartOfDay(dateString: string) {
  const trimmed = dateString.trim();
  const isoLike = /^\d{4}-\d{2}-\d{2}$/.test(trimmed);
  if (isoLike) return new Date(`${trimmed}T00:00:00.000Z`);

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return parsed;
  parsed.setHours(0, 0, 0, 0);
  return parsed;
}

function validatePickupDate(
  data: { pickupDate?: string; preference?: "pickup" | "bank" },
  ctx: z.RefinementCtx
) {
  if (data.preference === "bank") return;
  const rawDate = data.pickupDate?.trim() ?? "";
  if (!rawDate) return;

  const selectedDate = toStartOfDay(rawDate);
  if (Number.isNaN(selectedDate.getTime())) {
    ctx.addIssue({
      code: "custom",
      path: ["pickupDate"],
      message: "Pick Up Date is invalid",
    });
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (selectedDate < today) {
    ctx.addIssue({
      code: "custom",
      path: ["pickupDate"],
      message: "Pick Up Date cannot be earlier than today",
    });
  }
}

const pickupOnlySchema = z
  .object({
    state: z.string().optional(),
    city: z.string().optional(),
    locationId: z.string().min(1, "Pickup location is required"),
    pickupDate: z.string().min(1, "Date of collection is required"),
    pickupTime: z.string().min(1, "Time of collection is required"),
  })
  .superRefine(validatePickupDate);

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
  )
  .superRefine(validatePickupDate);

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
  state?: string;
  city?: string;
  branch?: string;
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
  locations = [],
  states = [],
  cities = [],
  banks = [],
  onAddBank,
}: Readonly<PickupPointStepProps>) {
  const isPickupOrBank = preferenceMode === "pickup-or-bank";

  const pickupOnlyForm = useForm<PickupPointFormData>({
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

  const preference = isPickupOrBank
    ? ((values as PickupOrBankFormData).preference ?? "pickup")
    : "pickup";
  const state = values.state ?? "";
  const city = values.city ?? "";
  const locationId = "locationId" in values ? values.locationId : "";
  const selectedBankId = isPickupOrBank ? (values as PickupOrBankFormData).selectedBankId : "";

  const resolveOptionalLocationField = (selected?: string, formValue?: string) => {
    const selectedValue = selected?.trim();
    if (selectedValue) return selectedValue;
    const fallbackValue = formValue?.trim();
    if (fallbackValue) return fallbackValue;
    return "N/A";
  };

  const { data: pickupStatesResponse } = useFetchData(
    [...customerKeys.transactions.pickupLocationStates()],
    () => customerApi.transactions.getPickupLocationStates()
  );

  const { data: pickupCitiesResponse } = useFetchData(
    [...customerKeys.transactions.pickupLocationCities({ state: state || undefined })],
    () => customerApi.transactions.getPickupLocationCities({ state: state || undefined }),
    Boolean(state)
  );

  const showPickupForm = !isPickupOrBank || preference === "pickup";
  const shouldFetchTerminals = showPickupForm && locations.length === 0;

  /** Drives query key + request — changes here refetch terminals (state/city/date/time). */
  const terminalQueryParams = useMemo((): PickupTerminalsQueryParams => {
    const out: PickupTerminalsQueryParams = {};
    const st = state.trim();
    const ct = city.trim();
    if (st) out.state = st;
    if (ct) out.city = ct;
    const pickupDate = toIsoDateString(values.pickupDate);
    const pickupTime = toHHmm(values.pickupTime);
    if (pickupDate) out.pickupDate = pickupDate;
    if (pickupTime) out.pickupTime = pickupTime;
    return out;
  }, [state, city, values.pickupDate, values.pickupTime]);

  const terminalsQueryKey =
    Object.keys(terminalQueryParams).length > 0 ? terminalQueryParams : "all";

  const { data: pickupTerminalsResponse, isFetching: isFetchingTerminals } = useFetchData(
    [...customerKeys.transactions.pickupTerminals(terminalsQueryKey)],
    () =>
      customerApi.transactions.getPickupTerminals(
        Object.keys(terminalQueryParams).length > 0 ? terminalQueryParams : undefined
      ),
    shouldFetchTerminals
  );

  const apiLocations = useMemo<Location[]>(() => {
    const terminals = pickupTerminalsResponse?.data?.terminals;
    if (!Array.isArray(terminals)) return [];
    return terminals.map((t) => ({
      id: String(t.id),
      name: t.name,
      address: t.address,
      state: t.state,
      city: t.city,
      branch: t.region,
    }));
  }, [pickupTerminalsResponse]);

  const statesData = useMemo(() => {
    if (states.length > 0) return states;
    const apiStates = pickupStatesResponse?.data?.states ?? [];
    return apiStates;
  }, [states, pickupStatesResponse]);

  const citiesData = useMemo(() => {
    if (cities.length > 0) return cities;
    const apiCities = pickupCitiesResponse?.data?.cities ?? [];
    if (apiCities.length > 0) return apiCities;
    return [];
  }, [cities, pickupCitiesResponse]);

  const locationsData = locations.length > 0 ? locations : apiLocations;

  const locationsFilteredData = useMemo(() => {
    if (locations.length > 0) {
      return locationsData.filter((loc) => {
        const matchesState =
          !state ||
          loc.state?.toLowerCase() === state.toLowerCase() ||
          loc.address.toLowerCase().includes(state.toLowerCase());

        const matchesCity =
          !city ||
          loc.city?.toLowerCase() === city.toLowerCase() ||
          loc.address.toLowerCase().includes(city.toLowerCase()) ||
          loc.name.toLowerCase().includes(city.toLowerCase());

        return matchesState && matchesCity;
      });
    }
    return locationsData;
  }, [locations.length, locationsData, state, city]);

  const handleSubmit =
    preferenceMode === "pickup-only"
      ? pickupOnlyForm.onSubmit((v) => {
          const selectedLocation = locationsFilteredData.find((location) => location.id === v.locationId);
          onSubmit({
            ...v,
            state: resolveOptionalLocationField(selectedLocation?.state, v.state),
            city: resolveOptionalLocationField(selectedLocation?.city, v.city),
          });
        })
      : pickupOrBankForm.onSubmit((v) => {
          if (v.preference !== "pickup") {
            onSubmit(v);
            return;
          }

          const selectedLocation = locationsFilteredData.find((location) => location.id === v.locationId);
          onSubmit({
            ...v,
            state: resolveOptionalLocationField(selectedLocation?.state, v.state),
            city: resolveOptionalLocationField(selectedLocation?.city, v.city),
          });
        });

  const showBankForm = isPickupOrBank && preference === "bank";

  const showTerminalLoading =
    locations.length === 0 && Boolean(shouldFetchTerminals) && isFetchingTerminals;

  const renderTerminalEmptyOrList = (setLocation: (id: string) => void) => {
    if (showTerminalLoading) {
      return (
        <div className="flex w-full justify-center py-10">
          <Loader color="var(--mantine-color-orange-6)" size="sm" />
        </div>
      );
    }
    if (locationsFilteredData.length === 0) {
      return (
        <EmptyState
          title="No Data available"
          description="No pickup location found for the selected filters. Adjust date or time if needed."
          className="w-full py-4"
        />
      );
    }
    return locationsFilteredData.map((location) => (
      <SelectableLocationCard
        key={location.id}
        name={location.name}
        address={location.address}
        isSelected={locationId === location.id}
        onClick={() => setLocation(location.id)}
      />
    ));
  };

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
              placeholder="Select an Option"
              data={statesData}
              rightSection={
                <HugeiconsIcon icon={ChevronDown} size={20} className="text-text-300" />
              }
              size="md"
              {...pickupOrBankForm.getInputProps("state")}
              onChange={(v) => {
                const next = v ?? "";
                pickupOrBankForm.setFieldValue("state", next);
                pickupOrBankForm.setFieldValue("city", "");
                pickupOrBankForm.setFieldValue("locationId", "");
              }}
            />
            <Select
              key={pickupOrBankForm.key("city")}
              label="Select City"
              placeholder="Select an Option"
              data={citiesData}
              rightSection={
                <HugeiconsIcon icon={ChevronDown} size={20} className="text-text-300" />
              }
              size="md"
              {...pickupOrBankForm.getInputProps("city")}
              onChange={(v) => {
                const next = v ?? "";
                pickupOrBankForm.setFieldValue("city", next);
                pickupOrBankForm.setFieldValue("locationId", "");
              }}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput
              key={pickupOrBankForm.key("pickupDate")}
              label="Date of collection"
              required
              size="md"
              type="date"
              {...pickupOrBankForm.getInputProps("pickupDate")}
              onChange={(e) => {
                const next = e.currentTarget.value;
                pickupOrBankForm.setFieldValue("pickupDate", next);
                pickupOrBankForm.setFieldValue("locationId", "");
              }}
            />
            <TextInput
              key={pickupOrBankForm.key("pickupTime")}
              label="Time of collection"
              required
              size="md"
              type="time"
              {...pickupOrBankForm.getInputProps("pickupTime")}
              onChange={(e) => {
                const next = e.currentTarget.value;
                pickupOrBankForm.setFieldValue("pickupTime", next);
                pickupOrBankForm.setFieldValue("locationId", "");
              }}
            />
          </div>

          <div className="box-border flex flex-col items-start p-4 gap-6 w-full bg-white border border-gray-100 rounded-2xl shadow-[0px_1px_2px_rgba(16,24,40,0.05)]">
            <p className="text-body-text-200 text-base font-normal leading-6 flex-none">
              Pickup Locations (
              {showTerminalLoading ? "—" : locationsFilteredData.length.toString().padStart(2, "0")})
            </p>
            <div className="flex flex-col items-start w-full gap-4 max-h-[200px] overflow-y-auto">
              {renderTerminalEmptyOrList((id) => pickupOrBankForm.setFieldValue("locationId", id))}
            </div>
          </div>
        </>
      )}

      {showPickupForm && !isPickupOrBank && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              key={pickupOnlyForm.key("state")}
              label="Select State"
              placeholder="Select an Option"
              data={statesData}
              rightSection={
                <HugeiconsIcon icon={ChevronDown} size={20} className="text-text-300" />
              }
              size="md"
              {...pickupOnlyForm.getInputProps("state")}
              onChange={(v) => {
                const next = v ?? "";
                pickupOnlyForm.setFieldValue("state", next);
                pickupOnlyForm.setFieldValue("city", "");
                pickupOnlyForm.setFieldValue("locationId", "");
              }}
            />
            <Select
              key={pickupOnlyForm.key("city")}
              label="Select City"
              placeholder="Select an Option"
              data={citiesData}
              rightSection={
                <HugeiconsIcon icon={ChevronDown} size={20} className="text-text-300" />
              }
              size="md"
              {...pickupOnlyForm.getInputProps("city")}
              onChange={(v) => {
                const next = v ?? "";
                pickupOnlyForm.setFieldValue("city", next);
                pickupOnlyForm.setFieldValue("locationId", "");
              }}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DateInput
              key={pickupOnlyForm.key("pickupDate")}
              label="Pick Up Date"
              placeholder="DD MM YYYY"
              minDate={new Date()}
              required
              size="md"
              valueFormat="YYYY-MM-DD"
              {...pickupOnlyForm.getInputProps("pickupDate")}
              onChange={(v) => {
                let next = "";
                if (typeof v === "string") {
                  next = v;
                } else if (v != null && typeof v === "object" && "getTime" in v) {
                  next = (v as Date).toISOString().slice(0, 10);
                }
                pickupOnlyForm.setFieldValue("pickupDate", next);
                pickupOnlyForm.setFieldValue("locationId", "");
              }}
            />
            <TimeInput
              key={pickupOnlyForm.key("pickupTime")}
              label="Pick Up Time"
              placeholder="HH:MM"
              required
              size="md"
              {...pickupOnlyForm.getInputProps("pickupTime")}
              onChange={(e) => {
                const next = e.currentTarget.value;
                pickupOnlyForm.setFieldValue("pickupTime", next);
                pickupOnlyForm.setFieldValue("locationId", "");
              }}
            />
          </div>

          <div className="box-border flex flex-col items-start p-4 gap-6 w-full bg-white border border-gray-100 rounded-2xl shadow-[0px_1px_2px_rgba(16,24,40,0.05)]">
            <p className="text-body-text-200 text-base font-normal leading-6 flex-none">
              Pickup Locations (
              {showTerminalLoading ? "—" : locationsFilteredData.length.toString().padStart(2, "0")})
            </p>
            <div className="flex flex-col items-start w-full gap-4 max-h-[200px] overflow-y-auto">
              {renderTerminalEmptyOrList((id) => pickupOnlyForm.setFieldValue("locationId", id))}
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
