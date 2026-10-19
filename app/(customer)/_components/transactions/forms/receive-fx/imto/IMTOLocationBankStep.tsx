"use client";

import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { z } from "zod";
import { Button } from "@mantine/core";
import SelectableBankCard from "@/app/(customer)/_components/forms/SelectableBankCard";

const fullNairaSchema = z.object({
  selectedBankId: z.string().min(1, "Please select a bank account"),
});

const DEFAULT_BANKS = [
  {
    id: "1",
    bankName: "Sterling Bank",
    accountNumber: "2224567890",
    accountName: "SOHCAHTOA LTD",
  },
  {
    id: "2",
    bankName: "Wema Bank",
    accountNumber: "2224567890",
    accountName: "SOHCAHTOA LTD",
  },
  {
    id: "3",
    bankName: "Providus Bank",
    accountNumber: "2224567890",
    accountName: "SOHCAHTOA LTD",
  },
];

interface IMTOLocationBankStepProps {
  initialValues?: Partial<{ selectedBankId: string }>;
  onSubmit: (data: { selectedBankId: string }) => void;
  onBack?: () => void;
}

export default function IMTOLocationBankStep({
  initialValues,
  onSubmit,
  onBack,
}: IMTOLocationBankStepProps) {
  const form = useForm({
    mode: "controlled",
    initialValues: { selectedBankId: initialValues?.selectedBankId ?? "" },
    validate: zod4Resolver(fullNairaSchema),
  });

  const handleSubmit = form.onSubmit((values) => {
    onSubmit({ selectedBankId: values.selectedBankId });
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg border border-gray-100 bg-white p-4 space-y-3">
        <h3 className="text-[#4D4B4B] text-base font-semibold">
          How would you like your funds disbursed?
        </h3>
        <p className="text-[#6C6969] text-sm">Select your preferred bank account</p>
        <div className="flex flex-col gap-2">
          {DEFAULT_BANKS.map((bank) => (
            <SelectableBankCard
              key={bank.id}
              bankName={bank.bankName}
              accountNumber={bank.accountNumber}
              accountName={bank.accountName}
              isSelected={form.values.selectedBankId === bank.id}
              onClick={() => form.setFieldValue("selectedBankId", bank.id)}
            />
          ))}
        </div>
      </div>

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
