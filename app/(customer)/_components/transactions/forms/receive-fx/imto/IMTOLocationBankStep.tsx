"use client";

import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { z } from "zod";
import { Button, Select } from "@mantine/core";
import SelectableBankCard from "@/app/(customer)/_components/forms/SelectableBankCard";
import SelectableLocationCard from "@/app/(customer)/_components/forms/SelectableLocationCard";
import { EmptyState } from "@/app/(customer)/_components/common";
import { HugeiconsIcon } from "@hugeicons/react";
import { ChevronDown } from "@hugeicons/core-free-icons";
import type { DisbursementOption } from "./IMTODisbursementOptionsStep";

const fullNairaSchema = z.object({
  selectedBankId: z.string().min(1, "Please select a bank account"),
});

const usdPickupSchema = z.object({
  selectedBankId: z.string().min(1, "Please select a bank account for the balance"),
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  locationId: z.string().min(1, "Pickup location is required"),
});

const DEFAULT_BANKS = [
  { id: "1", bankName: "Sterling Bank", accountNumber: "2224567890", accountName: "SOHCAHTOA LTD" },
  { id: "2", bankName: "Wema Bank", accountNumber: "2224567890", accountName: "SOHCAHTOA LTD" },
  { id: "3", bankName: "Providus Bank", accountNumber: "2224567890", accountName: "SOHCAHTOA LTD" },
];

const DEFAULT_LOCATIONS = [
  { id: "1", name: "SOHCAHTOA LAGOS", address: "ADEOLA ODEKU . RD VICTORIA ISLAND" },
  { id: "2", name: "TRIGONOMETRY HUB", address: "LAGOS ISLAND" },
];
const DEFAULT_STATES = ["Lagos", "Abuja", "Port Harcourt", "Kano"];
const DEFAULT_CITIES = ["Lagos Island", "Victoria Island", "Ikoyi", "Lekki"];

interface IMTOLocationBankStepProps {
  disbursementOption: DisbursementOption;
  balanceAmountNgn?: string;
  initialValues?: Partial<{ selectedBankId: string; state: string; city: string; locationId: string }>;
  onSubmit: (data: { selectedBankId: string; state?: string; city?: string; locationId?: string }) => void;
  onBack?: () => void;
}

export default function IMTOLocationBankStep({
  disbursementOption,
  balanceAmountNgn = "NGN 200,000.00",
  initialValues,
  onSubmit,
  onBack,
}: IMTOLocationBankStepProps) {
  const isUsdPickup = disbursementOption === "usd-cash-pickup";

  const fullNairaForm = useForm({
    mode: "uncontrolled",
    initialValues: { selectedBankId: initialValues?.selectedBankId ?? "" },
    validate: zod4Resolver(fullNairaSchema),
  });

  const usdPickupForm = useForm({
    mode: "uncontrolled",
    initialValues: {
      selectedBankId: initialValues?.selectedBankId ?? "",
      state: initialValues?.state ?? "",
      city: initialValues?.city ?? "",
      locationId: initialValues?.locationId ?? "",
    },
    validate: zod4Resolver(usdPickupSchema),
  });

  const form = isUsdPickup ? usdPickupForm : fullNairaForm;

  const handleSubmit = form.onSubmit((values) => {
    if (isUsdPickup) {
      const v = values as { selectedBankId: string; state: string; city: string; locationId: string };
      onSubmit({
        selectedBankId: v.selectedBankId,
        state: v.state,
        city: v.city,
        locationId: v.locationId,
      });
    } else {
      onSubmit({ selectedBankId: values.selectedBankId });
    }
  });

  const filteredLocations =
    isUsdPickup && usdPickupForm.values.state && usdPickupForm.values.city
      ? DEFAULT_LOCATIONS.filter(
          (loc) =>
            loc.address.toLowerCase().includes(usdPickupForm.values.state.toLowerCase()) ||
            loc.address.toLowerCase().includes(usdPickupForm.values.city.toLowerCase())
        )
      : DEFAULT_LOCATIONS;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg border border-gray-100 bg-white p-4 space-y-3">
        <h3 className="text-[#4D4B4B] text-base font-semibold">
          {isUsdPickup
            ? "Where would you like to receive the balance?"
            : "How would you like your funds disbursed?"}
        </h3>
        <p className="text-[#6C6969] text-sm">
          {isUsdPickup
            ? `Select an account to credit the naira equivalent of the money left (${balanceAmountNgn})`
            : "Select your preferred option"}
        </p>
        <div className="flex flex-col gap-2">
          {DEFAULT_BANKS.map((bank) => (
            <SelectableBankCard
              key={bank.id}
              bankName={bank.bankName}
              accountNumber={bank.accountNumber}
              accountName={bank.accountName}
              isSelected={form.values.selectedBankId === bank.id}
              onClick={() =>
                isUsdPickup
                  ? usdPickupForm.setFieldValue("selectedBankId", bank.id)
                  : fullNairaForm.setFieldValue("selectedBankId", bank.id)
              }
            />
          ))}
        </div>
      </div>

      {isUsdPickup && (
        <div className="rounded-lg border border-gray-100 bg-white p-4 space-y-3">
          <h3 className="text-[#4D4B4B] text-base font-semibold">
            Where would you like to pick up your cash?
          </h3>
          <p className="text-[#6C6969] text-sm">
            Select your preferred location near you
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Select State"
              required
              placeholder="Select an Option"
              data={DEFAULT_STATES}
              size="md"
              rightSection={<HugeiconsIcon icon={ChevronDown} size={20} className="text-text-300" />}
              classNames={{ label: "text-sm font-medium text-[#6C6969]" }}
              {...usdPickupForm.getInputProps("state")}
            />
            <Select
              label="Select City"
              required
              placeholder="Select an Option"
              data={DEFAULT_CITIES}
              size="md"
              rightSection={<HugeiconsIcon icon={ChevronDown} size={20} className="text-text-300" />}
              classNames={{ label: "text-sm font-medium text-[#6C6969]" }}
              {...usdPickupForm.getInputProps("city")}
            />
          </div>
          <div className="min-h-[120px]">
            {!usdPickupForm.values.state || !usdPickupForm.values.city || filteredLocations.length === 0 ? (
              <EmptyState
                title="No Data available"
                description="Select a state and city to display location option"
                className="py-4"
              />
            ) : (
              <div className="flex flex-col gap-2">
                {filteredLocations.map((loc) => (
                  <SelectableLocationCard
                    key={loc.id}
                    name={loc.name}
                    address={loc.address}
                    isSelected={usdPickupForm.values.locationId === loc.id}
                    onClick={() => usdPickupForm.setFieldValue("locationId", loc.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        {onBack && (
          <Button
            type="button"
            variant="outline"
            radius="xl"
            className="!flex !items-center !justify-center !px-6 !py-3.5 w-full sm:!w-[138px] !min-h-[48px] !bg-white !border !border-text-50 !rounded-full !font-medium !text-base !leading-6 !text-[#4D4B4B]"
            onClick={onBack}
          >
            Back
          </Button>
        )}
        <Button
          type="submit"
          size="md"
          radius="xl"
          className="w-full sm:!w-[140px] !min-h-[44px] !font-medium !text-base !bg-primary-400 hover:!bg-primary-500"
        >
          Submit
        </Button>
      </div>
    </form>
  );
}
