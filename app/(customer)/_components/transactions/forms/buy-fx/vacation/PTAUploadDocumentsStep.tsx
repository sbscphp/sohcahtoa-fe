"use client";

import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { z } from "zod";
import { Alert, Button } from "@mantine/core";
import { Info } from "lucide-react";
import { TextInput } from "@mantine/core";
import { FileWithPath } from "@mantine/dropzone";
import { APPROVAL_BEFORE_PAYMENT_MESSAGE, REVIEW_TIMELINE_MESSAGE } from "@/app/(customer)/_lib/compliance-messaging";
import TransactionFileUploadInput from '../../../../forms/TransactionFileUploadInput';

const uploadDocumentsSchema = z.object({
  bvn: z.string().regex(/^\d{11}$/, "BVN must be exactly 11 digits"),
  ninNumber: z.string().regex(/^\d{11}$/, "NIN must be exactly 11 digits"),
  formAId: z.string().min(1, "Form A ID is required").max(30, "Form A ID is too long"),
  formADocumentNumber: z.string().min(1, "International Passport number is required").max(50, "International Passport number is too long"),
  passportFile: z.custom<FileWithPath | null>().refine((file) => file !== null, {
    message: "Valid Visa file is required",
  }),
  passportDocumentNumber: z.string().min(1, "Valid Visa Number is required").max(50, "Visa Number is too long"),
  returnTicketFile: z.custom<FileWithPath | null>().refine((file) => file !== null, {
    message: "Return Ticket file is required",
  }),
  returnTicketDocumentNumber: z.string().min(1, "Return Ticket Number is required").max(50, "Return Ticket Number is too long"),
});

export type UploadDocumentsFormData = z.infer<typeof uploadDocumentsSchema>;

/** Form state allows null for file fields before validation */
type UploadDocumentsFormValues = z.input<typeof uploadDocumentsSchema>;

interface PTAUploadDocumentsStepProps {
  initialValues?: Partial<UploadDocumentsFormValues>;
  onSubmit: (data: UploadDocumentsFormData) => void;
  onBack?: () => void;
}

export default function PTAUploadDocumentsStep({
  initialValues,
  onSubmit,
  onBack,
}: PTAUploadDocumentsStepProps) {
  const form = useForm<UploadDocumentsFormValues>({
    mode: "uncontrolled",
    initialValues: {
      bvn: initialValues?.bvn || "",
      ninNumber: initialValues?.ninNumber || "",
      formAId: initialValues?.formAId || "",
      formADocumentNumber: initialValues?.formADocumentNumber || "",
      passportFile: initialValues?.passportFile ?? null,
      passportDocumentNumber: initialValues?.passportDocumentNumber || "",
      returnTicketFile: initialValues?.returnTicketFile ?? null,
      returnTicketDocumentNumber: initialValues?.returnTicketDocumentNumber || "",
    },
    validate: zod4Resolver(uploadDocumentsSchema),
  });

  const handleSubmit = form.onSubmit((values) => {
    onSubmit(values as UploadDocumentsFormData);
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex text-center flex-col items-center justify-center">
        <h2 className="text-body-heading-300 text-2xl font-semibold mb-1">
          Fill in all required information
        </h2>
        <p className="text-body-text-200 text-base max-w-md">
          Create a new Personal Travel Allowance (PTA) and get access to foreign
          exchange for personal trips abroad.
        </p>
      </div>

      <Alert
        icon={<Info size={14} />}
        title=""
        className="bg-white! border-gray-300!"
      >
        <p className="text-body-text-200">
          {APPROVAL_BEFORE_PAYMENT_MESSAGE} Please note the maximum you can
          transact is <strong>$4,000 per quarter</strong>.
        </p>
        <p className="text-body-text-200 mt-2">
          {REVIEW_TIMELINE_MESSAGE}
        </p>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextInput
          label="BVN"
          required
          size="md"
          placeholder="Enter 11-digit BVN"
          maxLength={11}
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          value={form.values.bvn}
          onBlur={() => form.validateField("bvn")}
          error={form.errors.bvn}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
            form.setFieldValue("bvn", digits);
          }}
        />

        <TextInput
          label="NIN Number"
          required
          size="md"
          placeholder="Enter 11-digit NIN"
          maxLength={11}
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          value={form.values.ninNumber}
          onBlur={() => form.validateField("ninNumber")}
          error={form.errors.ninNumber}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
            form.setFieldValue("ninNumber", digits);
          }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextInput
          label="Form A"
          required
          size="md"
          placeholder="Enter Form A"
          maxLength={30}
          autoComplete="off"
          {...form.getInputProps("formAId")}
        />
        <TextInput
          label="International Passport"
          required
          size="md"
          placeholder="Enter International Passport"
          maxLength={50}
          autoComplete="off"
          {...form.getInputProps("formADocumentNumber")}
        />
      </div>

      <TransactionFileUploadInput
            label="Valid Visa"
            required
            value={form.values.passportFile}
            onChange={(file) => form.setFieldValue("passportFile", file)}
            error={form.errors.passportFile as string}
          />

      <div className="space-y-3 ">
      <TextInput
              label="Valid Visa Number"
              required
              size="md"
              placeholder="Enter  Visa Number"
              maxLength={50}
              {...form.getInputProps("passportDocumentNumber")}
            />


        <div className="space-y-2">
        <TransactionFileUploadInput
            label="Upload Return Ticket"
            required
            value={form.values.returnTicketFile}
            onChange={(file) => form.setFieldValue("returnTicketFile", file)}
            error={form.errors.returnTicketFile as string}
          />
          <TextInput
            label="Return Ticket Number"
            required
            size="md"
            placeholder="Enter Ticket Number"
            maxLength={50}
            {...form.getInputProps("returnTicketDocumentNumber")}
          />

        </div>
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
          Next
        </Button>
      </div>
    </form>
  );
}
