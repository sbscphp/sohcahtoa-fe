"use client";

import { useForm, type UseFormReturnType } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { z } from "zod";
import { Alert, Button } from "@mantine/core";
import { Info } from "lucide-react";
import FileUploadInput from "../../../../forms/FileUploadInput";
import type { FileWithPath } from "@mantine/dropzone";
import { INVOICE_BENEFICIARY_MESSAGE } from "@/app/(customer)/_lib/compliance-messaging";
import InternationalBankDetailsFields from "@/app/(customer)/_components/transactions/forms/InternationalBankDetailsFields";
import {
  internationalBankDetailsInitialValues,
  internationalBankDetailsSchema,
  type InternationalBankDetailsFormValues,
} from "@/app/(customer)/_lib/international-bank-details-schema";

const schoolFeesBankDetailsSchema = internationalBankDetailsSchema.and(
  z.object({
    invoiceFile: z.custom<FileWithPath | null>().optional(),
  })
);

export type SchoolFeesBankDetailsFormData = z.infer<typeof schoolFeesBankDetailsSchema>;

interface SchoolFeesBankDetailsStepProps {
  initialValues?: Partial<SchoolFeesBankDetailsFormData> & {
    accountName?: string;
  };
  onSubmit: (data: SchoolFeesBankDetailsFormData) => void;
  onBack?: () => void;
}

export default function SchoolFeesBankDetailsStep({
  initialValues,
  onSubmit,
  onBack,
}: Readonly<SchoolFeesBankDetailsStepProps>) {
  const base = internationalBankDetailsInitialValues(initialValues);

  const form = useForm<SchoolFeesBankDetailsFormData>({
    mode: "uncontrolled",
    initialValues: {
      ...base,
      invoiceFile: initialValues?.invoiceFile ?? null,
    },
    validate: zod4Resolver(schoolFeesBankDetailsSchema),
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
