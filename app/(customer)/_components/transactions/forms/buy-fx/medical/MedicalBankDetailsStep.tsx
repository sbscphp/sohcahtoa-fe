"use client";

import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { Button } from "@mantine/core";
import InternationalBankDetailsFields from "@/app/(customer)/_components/transactions/forms/InternationalBankDetailsFields";
import {
  internationalBankDetailsInitialValues,
  internationalBankDetailsSchema,
  type InternationalBankDetailsFormValues,
} from "@/app/(customer)/_lib/international-bank-details-schema";

export type MedicalBankDetailsFormData = InternationalBankDetailsFormValues;

interface MedicalBankDetailsStepProps {
  initialValues?: Partial<MedicalBankDetailsFormData> & {
    accountName?: string;
    bankName?: string;
    accountNumber?: string;
    iban?: string;
  };
  onSubmit: (data: MedicalBankDetailsFormData) => void;
  onBack?: () => void;
}

export default function MedicalBankDetailsStep({
  initialValues,
  onSubmit,
  onBack,
}: Readonly<MedicalBankDetailsStepProps>) {
  const form = useForm<MedicalBankDetailsFormData>({
    mode: "uncontrolled",
    initialValues: internationalBankDetailsInitialValues(initialValues),
    validate: zod4Resolver(internationalBankDetailsSchema),
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
          Enter recipient bank details. Start by selecting the country where the bank account is held.
        </p>
      </div>

      <InternationalBankDetailsFields form={form} />

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
