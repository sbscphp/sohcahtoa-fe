"use client";

import { useForm, type UseFormReturnType } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { z } from "zod";
import { Alert, Button } from "@mantine/core";
import { Info } from "lucide-react";
import type { FileWithPath } from "@mantine/dropzone";
import { INVOICE_BENEFICIARY_MESSAGE } from "@/app/(customer)/_lib/compliance-messaging";
import InternationalBankDetailsFields from "@/app/(customer)/_components/transactions/forms/InternationalBankDetailsFields";
import BankDetailsMemberSummary, {
  type BankDetailsMemberSummaryProps,
} from "@/app/(customer)/_components/transactions/forms/BankDetailsMemberSummary";
import FileUploadInput from "../../../../forms/FileUploadInput";
import {
  internationalBankDetailsInitialValues,
  internationalBankDetailsSchema,
  type InternationalBankDetailsFormValues,
  type InternationalBankDetailsLegacyInitial,
} from "@/app/(customer)/_lib/international-bank-details-schema";

const professionalBodyBankDetailsSchema = internationalBankDetailsSchema.and(
  z.object({
    invoiceFile: z.custom<FileWithPath | null>().optional(),
  })
);

export type ProfessionalBodyBankDetailsFormData = z.infer<typeof professionalBodyBankDetailsSchema>;

interface ProfessionalBodyBankDetailsStepProps {
  initialValues?: InternationalBankDetailsLegacyInitial & {
    invoiceFile?: FileWithPath | null;
  };
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
  const base = internationalBankDetailsInitialValues(initialValues);

  const form = useForm<ProfessionalBodyBankDetailsFormData>({
    mode: "uncontrolled",
    initialValues: {
      ...base,
      invoiceFile: initialValues?.invoiceFile ?? null,
    },
    validate: zod4Resolver(professionalBodyBankDetailsSchema),
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

      <Alert icon={<Info size={14} />} title="" className="bg-white! border-gray-300!">
        <p className="text-body-text-200 text-sm">{INVOICE_BENEFICIARY_MESSAGE}</p>
        <p className="text-body-text-200 text-sm mt-1">
          You may also upload an invoice below to use as confirmation during internet banking.
        </p>
      </Alert>

      <InternationalBankDetailsFields
        form={form as UseFormReturnType<InternationalBankDetailsFormValues>}
        trailingFields={
          <FileUploadInput
            label="Upload invoice (optional – with beneficiary details for verification)"
            value={form.values.invoiceFile ?? null}
            onChange={(file) => form.setFieldValue("invoiceFile", file)}
            placeholder="Click to upload invoice"
          />
        }
      />

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
