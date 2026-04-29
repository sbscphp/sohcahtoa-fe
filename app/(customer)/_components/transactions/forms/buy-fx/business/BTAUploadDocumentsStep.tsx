"use client";

import { formAIdSchema } from "@/app/(customer)/_lib/form-a-id-schema";
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
import {
  formatDateToIso,
  passportNumberSchema,
  requiredIsoDateSchema,
  validatePassportDates,
} from "@/app/(customer)/_utils/input-validation";
import {
  shouldLockKycPrefill,
  useCustomerProfileBvnNin,
  useKycProfilePrefillEffect,
} from "@/app/(customer)/_hooks/use-customer-profile-bvn-nin";
import { kycBvnSchema, kycNinOptionalSchema } from "@/app/(customer)/_lib/kyc-bvn-nin-schema";

/** TCC document number + TIN certificate file optional — not collected when inputs are hidden. */
const uploadDocumentsSchema = z.object({
  bvn: kycBvnSchema,
  ninNumber: kycNinOptionalSchema,
  tinNumber: z.string().min(1, "TIN Number is required").max(30, "TIN Number is too long"),
  formAId: formAIdSchema,
  tccDocumentNumber: z.string().max(50, "Document number is too long"),
  tccFile: z.custom<FileWithPath | null>().refine((file) => file !== null, {
    message: "TCC (Tax Clearance Certificate) file is required",
  }),
  passportDocumentNumber: passportNumberSchema,
  passportIssueDate: requiredIsoDateSchema("Passport issue date"),
  passportExpiryDate: requiredIsoDateSchema("Passport expiry date"),
  passportFile: z.custom<FileWithPath | null>().refine((file) => file !== null, {
    message: "International Passport file is required",
  }),
  visaDocumentNumber: z.string().min(1, "Visa document number is required").max(50, "Document number is too long"),
  visaFile: z.custom<FileWithPath | null>().refine((file) => file !== null, {
    message: "Valid Visa file is required",
  }),
  returnTicketFile: z.custom<FileWithPath | null>().refine((file) => file !== null, {
    message: "Return Ticket file is required",
  }),
  letterFromCompanyFile: z.custom<FileWithPath | null>().refine((file) => file !== null, {
    message: "Letter from company/business confirming what the payment is about is required",
  }),
  letterOfInvitationFile: z.custom<FileWithPath | null>().refine((file) => file !== null, {
    message: "Letter of Invitation from Partner is required",
  }),
  tinCertificateFile: z.custom<FileWithPath | null>().optional(),
}).superRefine(validatePassportDates);

export type BTAUploadDocumentsFormData = z.infer<typeof uploadDocumentsSchema>;

/** Form state allows null for file fields before validation */
type BTAUploadDocumentsFormValues = z.input<typeof uploadDocumentsSchema>;

interface BTAUploadDocumentsStepProps {
  initialValues?: Partial<BTAUploadDocumentsFormValues>;
  onSubmit: (data: BTAUploadDocumentsFormData) => void;
  onBack?: () => void;
  lockKycPrefill?: boolean;
}

export default function BTAUploadDocumentsStep({
  initialValues,
  onSubmit,
  onBack,
  lockKycPrefill = false,
}: Readonly<BTAUploadDocumentsStepProps>) {
  const kyc = useCustomerProfileBvnNin();
  const bvnLocked = shouldLockKycPrefill(
    kyc.hasBvnFromProfile,
    initialValues?.bvn,
    kyc.defaultBvn
  );
  const ninLocked = shouldLockKycPrefill(
    kyc.hasNinFromProfile,
    initialValues?.ninNumber,
    kyc.defaultNin
  );
  const forceBvnLock = lockKycPrefill && Boolean(initialValues?.bvn?.trim());
  const forceNinLock = lockKycPrefill && Boolean(initialValues?.ninNumber?.trim());

  const form = useForm<BTAUploadDocumentsFormValues>({
    mode: "controlled",
    initialValues: {
      bvn: initialValues?.bvn || kyc.defaultBvn || "",
      ninNumber: initialValues?.ninNumber || kyc.defaultNin || "",
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
      returnTicketFile: initialValues?.returnTicketFile ?? null,
      letterFromCompanyFile: initialValues?.letterFromCompanyFile ?? null,
      letterOfInvitationFile: initialValues?.letterOfInvitationFile ?? null,
      tinCertificateFile: initialValues?.tinCertificateFile ?? null,
    },
    validate: zod4Resolver(uploadDocumentsSchema),
  });

  useKycProfilePrefillEffect(form, initialValues, kyc);

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
          {/* {APPROVAL_BEFORE_PAYMENT_MESSAGE}  */}
          Please note the maximum you can
          transact is <strong>$5,000 per quarter</strong>.
        </p>
        {/* <p className="text-body-text-200 mt-2">
          {REVIEW_TIMELINE_MESSAGE}
        </p> */}
      </Alert>

        <TextInput
          label="BVN"
          required
          size="md"
          placeholder="BVN"
          maxLength={11}
          inputMode="numeric"
          autoComplete="off"
          {...form.getInputProps("bvn")}
          onChange={(e) => {
            const raw = e.currentTarget.value.replaceAll(/\D/g, "").slice(0, 11);
            e.currentTarget.value = raw;
            form.setFieldValue("bvn", raw);
          }}
          disabled={bvnLocked || forceBvnLock}
        />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextInput
          label="NIN"
          size="md"
          placeholder="NIN"
          maxLength={11}
          inputMode="numeric"
          autoComplete="off"
          {...form.getInputProps("ninNumber")}
          onChange={(e) => {
            const raw = e.currentTarget.value.replaceAll(/\D/g, "").slice(0, 11);
            e.currentTarget.value = raw;
            form.setFieldValue("ninNumber", raw);
          }}
          disabled={ninLocked || forceNinLock}
        />
        <TextInput
          label="TIN Number"
          required
          size="md"
          placeholder="Enter TIN Number"
          maxLength={8}
          autoComplete="off"
          {...form.getInputProps("tinNumber")}
        />
        <TextInput
          label="Form A ID"
          required
          size="md"
          placeholder="Enter Form A ID"
          maxLength={10}
          autoComplete="off"
          {...form.getInputProps("formAId")}
        />
        <TextInput
          label="International Passport"
          required
          size="md"
          placeholder="Enter Passport Number"
          maxLength={9}
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

{/* <TextInput
            label="TCC document number"
            required
            size="md"
            placeholder="Document number for API"
            maxLength={50}
            {...form.getInputProps("tccDocumentNumber")}
          /> */}

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
              value={
                form.values.passportIssueDate?.trim()
                  ? new Date(form.values.passportIssueDate)
                  : null
              }
              onChange={(value) => {
                form.setFieldValue("passportIssueDate", formatDateToIso(value));
              }}
              error={form.errors.passportIssueDate as string}
              rightSection={<HugeiconsIcon icon={CalendarIcon} size={20} className="text-text-300!" />}
            />
            <DateInput
              placeholder="Select expiry date"
              label="Passport expiry date"
              required
              value={
                form.values.passportExpiryDate?.trim()
                  ? new Date(form.values.passportExpiryDate)
                  : null
              }
              onChange={(value) => {
                form.setFieldValue("passportExpiryDate", formatDateToIso(value));
              }}
              minDate={new Date()}
              error={form.errors.passportExpiryDate as string}
              rightSection={<HugeiconsIcon icon={CalendarIcon} size={20} className="text-text-300!" />}
            />
          </div>
        </div>

        {/* <TransactionFileUploadInput
            label="Tax Identification Number (TIN)"
            required
            value={form.values.tinCertificateFile}
            onChange={(file) => form.setFieldValue("tinCertificateFile", file)}
            error={form.errors.tinCertificateFile as string}
          /> */}
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
            placeholder="Enter Visa Number"
            maxLength={50}
            {...form.getInputProps("visaDocumentNumber")}
          />
        </div>

        <TransactionFileUploadInput
          label="Return Ticket"
          required
          value={form.values.returnTicketFile}
          onChange={(file) => form.setFieldValue("returnTicketFile", file)}
          error={form.errors.returnTicketFile as string}
        />

        <TransactionFileUploadInput
            label="Letter of request from Employer"
            required
            value={form.values.letterFromCompanyFile}
            onChange={(file) => form.setFieldValue("letterFromCompanyFile", file)}
            error={form.errors.letterFromCompanyFile as string}
          />

        <TransactionFileUploadInput
            label="Letter of Invitation from Oversea Partner"
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
