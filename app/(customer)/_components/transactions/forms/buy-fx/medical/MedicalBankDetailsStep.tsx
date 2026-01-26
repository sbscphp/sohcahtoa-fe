"use client";

import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { z } from "zod";
import { Button, Select, TextInput } from "@mantine/core";
import { HugeiconsIcon } from "@hugeicons/react";
import { ChevronDown } from "@hugeicons/core-free-icons";

const bankDetailsSchema = z.object({
  bankName: z.string().min(1, "Bank name is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  accountName: z.string().min(1, "Account name is required"),
  iban: z.string().min(1, "IBAN is required"),
});

export type MedicalBankDetailsFormData = z.infer<typeof bankDetailsSchema>;

const BANK_OPTIONS = [
  "Access Bank",
  "First Bank of Nigeria",
  "GTBank",
  "Union Bank",
  "Zenith Bank",
  "Other",
];

interface MedicalBankDetailsStepProps {
  initialValues?: Partial<MedicalBankDetailsFormData>;
  onSubmit: (data: MedicalBankDetailsFormData) => void;
  onBack?: () => void;
}

export default function MedicalBankDetailsStep({
  initialValues,
  onSubmit,
  onBack,
}: MedicalBankDetailsStepProps) {
  const form = useForm<MedicalBankDetailsFormData>({
    mode: "uncontrolled",
    initialValues: {
      bankName: initialValues?.bankName || "",
      accountNumber: initialValues?.accountNumber || "",
      accountName: initialValues?.accountName || "",
      iban: initialValues?.iban || "",
    },
    validate: zod4Resolver(bankDetailsSchema),
  });

  const handleSubmit = form.onSubmit((values) => {
    onSubmit(values);
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col gap-2 justify-center items-center text-center">
        <h2 className="text-body-heading-300 text-2xl font-semibold">
          Where would you like to send the fund to?
        </h2>
        <p className="text-body-text-200 text-base max-w-md">
          Enter recipient bank details
        </p>
      </div>

      <div className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Bank Name"
          required
          placeholder="Select"
          data={BANK_OPTIONS}
          size="md"
          rightSection={<HugeiconsIcon icon={ChevronDown} size={20} className="text-text-300" />}
          {...form.getInputProps("bankName")}
        />

        <TextInput
          label="Account Number"
          required
          size="md"
          placeholder="Enter"
          {...form.getInputProps("accountNumber")}
        />

        <TextInput
          label="Account Name"
          required
          size="md"
          placeholder="Enter"
          {...form.getInputProps("accountName")}
        />

        <TextInput
          label="Iban"
          required
          size="md"
          placeholder="Enter"
          {...form.getInputProps("iban")}
        />
      </div>

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
          Save
        </Button>
      </div>
    </form>
  );
}
