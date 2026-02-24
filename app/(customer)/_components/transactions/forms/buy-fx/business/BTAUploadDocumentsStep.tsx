"use client";

import { APPROVAL_BEFORE_PAYMENT_MESSAGE, REVIEW_TIMELINE_MESSAGE } from "@/app/(customer)/_lib/compliance-messaging";
import { Alert, Button, TextInput } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { FileWithPath } from "@mantine/dropzone";
import { useForm } from "@mantine/form";
import { Info } from "lucide-react";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { z } from "zod";
import TransactionFileUploadInput from '../../../../forms/TransactionFileUploadInput';
import { HugeiconsIcon } from "@hugeicons/react";
import { CalendarIcon } from "@hugeicons/core-free-icons";

const uploadDocumentsSchema = z.object({
  bvn: z.string().regex(/^\d{11}$/, "BVN must be exactly 11 digits"),
  ninNumber: z.string().max(50).refine((v) => !v || v.trim() === "" || /^\d{11}$/.test(v.trim()), "NIN must be exactly 11 digits when provided"),
  tinNumber: z.string().min(1, "TIN Number is required").max(30, "TIN Number is too long"),
  formAId: z.string().min(1, "Form A ID is required").max(30, "Form A ID is too long"),
  tccDocumentNumber: z.string().min(1, "TCC document number is required").max(50, "Document number is too long"),
  tccFile: z.custom<FileWithPath | null>().refine((file) => file !== null, {
    message: "TCC (Tax Clearance Certificate) file is required",
  }),
  passportDocumentNumber: z.string().min(1, "International passport document number is required").max(50, "Document number is too long"),
  passportIssueDate: z.string().min(1, "Passport issue date is required"),
  passportExpiryDate: z.string().min(1, "Passport expiry date is required"),
  passportFile: z.custom<FileWithPath | null>().refine((file) => file !== null, {
    message: "International Passport file is required",
  }),
  visaDocumentNumber: z.string().min(1, "Visa document number is required").max(50, "Document number is too long"),
  visaFile: z.custom<FileWithPath | null>().refine((file) => file !== null, {
    message: "Valid Visa file is required",
  }),
  letterFromCompanyFile: z.custom<FileWithPath | null>().refine((file) => file !== null, {
    message: "Letter from company/business confirming what the payment is about is required",
  }),
  letterOfInvitationFile: z.custom<FileWithPath | null>().refine((file) => file !== null, {
    message: "Letter of Invitation from Partner is required",
  }),
});

export type BTAUploadDocumentsFormData = z.infer<typeof uploadDocumentsSchema>;

/** Form state allows null for file fields before validation */
type BTAUploadDocumentsFormValues = z.input<typeof uploadDocumentsSchema>;

interface BTAUploadDocumentsStepProps {
  initialValues?: Partial<BTAUploadDocumentsFormValues>;
  onSubmit: (data: BTAUploadDocumentsFormData) => void;
  onBack?: () => void;
}

export default function BTAUploadDocumentsStep({
  initialValues,
  onSubmit,
  onBack,
}: BTAUploadDocumentsStepProps) {
  const form = useForm<BTAUploadDocumentsFormValues>({
    mode: "uncontrolled",
    initialValues: {
      bvn: initialValues?.bvn || "",
      ninNumber: initialValues?.ninNumber ?? "",
      tinNumber: initialValues?.tinNumber || "",
      formAId: initialValues?.formAId || "",
      tccDocumentNumber: initialValues?.tccDocumentNumber || "",
      tccFile: initialValues?.tccFile ?? null,
      passportDocumentNumber: initialValues?.passportDocumentNumber || "",
      passportIssueDate: initialValues?.passportIssueDate || "",
      passportExpiryDate: initialValues?.passportExpiryDate || "",
      passportFile: initialValues?.passportFile ?? null,
      visaDocumentNumber: initialValues?.visaDocumentNumber || "",
      visaFile: initialValues?.visaFile ?? null,
      letterFromCompanyFile: initialValues?.letterFromCompanyFile ?? null,
      letterOfInvitationFile: initialValues?.letterOfInvitationFile ?? null,
    },
    validate: zod4Resolver(uploadDocumentsSchema),
  });

  const handleSubmit = form.onSubmit((values) => {
    onSubmit(values as BTAUploadDocumentsFormData);
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex text-center flex-col items-center justify-center">
        <h2 className="text-body-heading-300 text-2xl font-semibold mb-1">
          Fill in all required information
        </h2>
        <p className="text-body-text-200 text-base max-w-md">
          Create a new Business Travel Allowance (BTA) and get access to foreign
          exchange for business trips abroad.
        </p>
      </div>

      <Alert
        icon={<Info size={14} />}
        title=""
        className="bg-white! border-gray-300!"
      >
        <p className="text-body-text-200">
          {APPROVAL_BEFORE_PAYMENT_MESSAGE} Please note the maximum you can
          transact is <strong>$5,000 per quarter</strong>.
        </p>
        <p className="text-body-text-200 mt-2">
          {REVIEW_TIMELINE_MESSAGE}
        </p>
      </Alert>

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextInput
          label="NIN (for API validation)"
          size="md"
          placeholder="Enter 11-digit NIN"
          maxLength={11}
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          value={form.values.ninNumber ?? ""}
          onBlur={() => form.validateField("ninNumber")}
          error={form.errors.ninNumber as string}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
            form.setFieldValue("ninNumber", digits);
          }}
        />
        <TextInput
          label="TIN Number"
          required
          size="md"
          placeholder="Enter TIN Number"
          maxLength={30}
          autoComplete="off"
          {...form.getInputProps("tinNumber")}
        />
        <TextInput
          label="Form A ID"
          required
          size="md"
          placeholder="Enter Form A ID"
          maxLength={30}
          autoComplete="off"
          {...form.getInputProps("formAId")}
        />
        <TextInput
          label="International Passport"
          required
          size="md"
          placeholder="Enter Passport Number"
          maxLength={30}
          autoComplete="off"
          {...form.getInputProps("passportDocumentNumber")}
        />
      </div>

      <div className="space-y-3">

          <TransactionFileUploadInput
            label="Upload Tax Clearance Certificate (TCC)"
            required
            value={form.values.tccFile}
            onChange={(file) => form.setFieldValue("tccFile", file)}
            error={form.errors.tccFile as string}
          />

<TextInput
            label="TCC document number"
            required
            size="md"
            placeholder="Document number for API"
            maxLength={50}
            {...form.getInputProps("tccDocumentNumber")}
          />

        <div className="space-y-2">
          <TransactionFileUploadInput
            label="Upload International Passport"
            required
            value={form.values.passportFile}
            onChange={(file) => form.setFieldValue("passportFile", file)}
            error={form.errors.passportFile as string}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DateInput
            placeholder="Select issue date"
              label="Passport issue date"
              required
              {...form.getInputProps("passportIssueDate")}
              rightSection={<HugeiconsIcon icon={CalendarIcon} size={20} className="text-text-300!" />}
            />
            <DateInput
              placeholder="Select expiry date"
              label="Passport expiry date"
              required
              {...form.getInputProps("passportExpiryDate")}
              rightSection={<HugeiconsIcon icon={CalendarIcon} size={20} className="text-text-300!" />}
            />
          </div>
        </div>

        <TransactionFileUploadInput
            label="Tax Identification Number (TIN)"
            required
            value={form.values.passportFile}
            onChange={(file) => form.setFieldValue("passportFile", file)}
            error={form.errors.passportFile as string}
          />
        <div className="space-y-2">
          <TransactionFileUploadInput
            label="Valid Visa"
            required
            value={form.values.visaFile}
            onChange={(file) => form.setFieldValue("visaFile", file)}
            error={form.errors.visaFile as string}
          />
          <TextInput
            label="Visa document number"
            required
            size="md"
            placeholder="Document number for API"
            maxLength={50}
            {...form.getInputProps("visaDocumentNumber")}
          />
        </div>

        <TransactionFileUploadInput
            label="Letter of request from Corporate Body"
            required
            value={form.values.letterFromCompanyFile}
            onChange={(file) => form.setFieldValue("letterFromCompanyFile", file)}
            error={form.errors.letterFromCompanyFile as string}
          />

        <TransactionFileUploadInput
            label="Letter of Invitation from Partner"
            required
            value={form.values.letterOfInvitationFile}
            onChange={(file) => form.setFieldValue("letterOfInvitationFile", file)}
            error={form.errors.letterOfInvitationFile as string}
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
          Next
        </Button>
      </div>
    </form>
  );
}
