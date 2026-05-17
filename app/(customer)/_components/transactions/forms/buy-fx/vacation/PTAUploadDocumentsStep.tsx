"use client";

import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { z } from "zod";
import { Alert, Button, TextInput } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { Info } from "lucide-react";
import { FileWithPath } from "@mantine/dropzone";
import { HugeiconsIcon } from "@hugeicons/react";
import { CalendarIcon } from "@hugeicons/core-free-icons";
import {
  shouldLockKycPrefill,
  useCustomerProfileBvnNin,
  useKycProfilePrefillEffect,
} from "@/app/(customer)/_hooks/use-customer-profile-bvn-nin";
import { formAIdSchema } from "@/app/(customer)/_lib/form-a-id-schema";
import { kycBvnSchema, kycNinRequiredSchema } from "@/app/(customer)/_lib/kyc-bvn-nin-schema";
import TransactionFileUploadInput from '../../../../forms/TransactionFileUploadInput';
import VisaDocumentUploadInput from '../../../../forms/VisaDocumentUploadInput';
import {
  formatDateToIso,
  passportNumberSchema,
  requiredIsoDateSchema,
  validatePassportDates,
} from "@/app/(customer)/_utils/input-validation";

const uploadDocumentsSchema = z
  .object({
    bvn: kycBvnSchema,
    ninNumber: kycNinRequiredSchema,
    formAId: formAIdSchema,
    passportDocumentNumber: passportNumberSchema,
    passportIssueDate: requiredIsoDateSchema("Passport Issued Date"),
    passportExpiryDate: requiredIsoDateSchema("Passport Expiry Date"),
    passportFile: z.custom<FileWithPath | null>().refine((file) => file !== null, {
      message: "International Passport file is required",
    }),
    visaFile: z.custom<FileWithPath | null>().refine((file) => file !== null, {
      message: "Valid Visa file is required",
    }),
    returnTicketFile: z.custom<FileWithPath | null>().refine((file) => file !== null, {
      message: "Return Ticket file is required",
    }),
    returnTicketDocumentNumber: z.string().max(50, "Return Ticket Number is too long").optional().nullable(),
  })
  .superRefine(validatePassportDates);

export type UploadDocumentsFormData = z.infer<typeof uploadDocumentsSchema>;

/** Form state allows null for file fields before validation */
type UploadDocumentsFormValues = z.input<typeof uploadDocumentsSchema>;

/** Saved PTA drafts may still use legacy keys (see initialValues mapping below). */
type PTAUploadDocumentsInitialValues = Partial<UploadDocumentsFormValues> & {
  formADocumentNumber?: string;
};

interface PTAUploadDocumentsStepProps {
  initialValues?: PTAUploadDocumentsInitialValues;
  onSubmit: (data: UploadDocumentsFormData) => void;
  onBack?: () => void;
  lockKycPrefill?: boolean;
}

export default function PTAUploadDocumentsStep({
  initialValues,
  onSubmit,
  onBack,
  lockKycPrefill = false,
}: Readonly<PTAUploadDocumentsStepProps>) {
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

  const form = useForm<UploadDocumentsFormValues>({
    mode: "uncontrolled",
    // Backwards-compat: older PTA step stored passport number under `formADocumentNumber`
    initialValues: {
      bvn: initialValues?.bvn || kyc.defaultBvn || "",
      ninNumber: initialValues?.ninNumber || kyc.defaultNin || "",
      formAId: initialValues?.formAId || "",
      passportDocumentNumber: initialValues?.passportDocumentNumber || initialValues?.formADocumentNumber || "",
      passportIssueDate: initialValues?.passportIssueDate || "",
      passportExpiryDate: initialValues?.passportExpiryDate || "",
      passportFile: initialValues?.passportFile ?? null,
      visaFile: initialValues?.visaFile ?? null,
      returnTicketFile: initialValues?.returnTicketFile ?? null,
      returnTicketDocumentNumber: initialValues?.returnTicketDocumentNumber || "",
    },
    validate: zod4Resolver(uploadDocumentsSchema),
  });

  useKycProfilePrefillEffect(form, initialValues, kyc);

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
          {/* {APPROVAL_BEFORE_PAYMENT_MESSAGE} */}
          Please note the maximum you can
          transact is <strong>$4,000 per quarter</strong>.
        </p>
        {/* <p className="text-body-text-200 mt-2">
          {REVIEW_TIMELINE_MESSAGE}
        </p> */}
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <TextInput
          label="NIN Number"
          required
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          label="International Passport Number"
          required
          size="md"
          placeholder="Enter International Passport Number"
          maxLength={9}
          autoComplete="off"
          {...form.getInputProps("passportDocumentNumber")}
        />
      </div>

      <TransactionFileUploadInput
        label="Upload International Passport"
        required
        value={form.values.passportFile}
        onChange={(file) => form.setFieldValue("passportFile", file)}
        error={form.errors.passportFile as string}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DateInput
          placeholder="Select"
          label="Passport Issued Date"
          required
          size="md"
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
          placeholder="Select"
          label="Passport Expiry Date"
          required
          size="md"
          minDate={new Date()}
          value={
            form.values.passportExpiryDate?.trim()
              ? new Date(form.values.passportExpiryDate)
              : null
          }
          onChange={(value) => {
            form.setFieldValue("passportExpiryDate", formatDateToIso(value));
          }}
          error={form.errors.passportExpiryDate as string}
          rightSection={<HugeiconsIcon icon={CalendarIcon} size={20} className="text-text-300!" />}
        />
      </div>

      <VisaDocumentUploadInput
        value={form.values.visaFile}
        onChange={(file) => form.setFieldValue("visaFile", file)}
        error={form.errors.visaFile as string}
      />

      <div className="space-y-3 ">
        <div className="space-y-2">
        <TransactionFileUploadInput
            label="Upload Return Ticket"
            required
            value={form.values.returnTicketFile}
            onChange={(file) => form.setFieldValue("returnTicketFile", file)}
            error={form.errors.returnTicketFile as string}
          />
          {/* <TextInput
            label="Return Ticket Number"
            required
            size="md"
            placeholder="Enter Ticket Number"
            maxLength={50}
            {...form.getInputProps("returnTicketDocumentNumber")}
          /> */}

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
