"use client";

import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { Button } from "@mantine/core";
import InternationalBankDetailsFields from "@/app/(customer)/_components/transactions/forms/InternationalBankDetailsFields";
import BankDetailsMemberSummary, {
  type BankDetailsMemberSummaryProps,
} from "@/app/(customer)/_components/transactions/forms/BankDetailsMemberSummary";
import {
  internationalBankDetailsInitialValues,
  internationalBankDetailsSchema,
  type InternationalBankDetailsFormValues,
  type InternationalBankDetailsLegacyInitial,
} from "@/app/(customer)/_lib/international-bank-details-schema";

export type ProfessionalBodyBankDetailsFormData = InternationalBankDetailsFormValues;

interface ProfessionalBodyBankDetailsStepProps {
  initialValues?: InternationalBankDetailsLegacyInitial;
  memberSummary?: BankDetailsMemberSummaryProps;
  onSubmit: (data: ProfessionalBodyBankDetailsFormData) => void;
  onBack?: () => void;
}

export default function ProfessionalBodyBankDetailsStep({
  initialValues,
  memberSummary,
  onSubmit,
  onBack,
}: Readonly<ProfessionalBodyBankDetailsStepProps>) {
  const form = useForm<ProfessionalBodyBankDetailsFormData>({
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
          Enter the professional body and bank details for this payment.
        </p>
      </div>

      <BankDetailsMemberSummary {...memberSummary} />
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
