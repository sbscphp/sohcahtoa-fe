"use client";

import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { z } from "zod";
import { Alert, Button } from "@mantine/core";
import { Info } from "lucide-react";
import { TextInput } from "@mantine/core";
import { FileWithPath } from "@mantine/dropzone";
import { APPROVAL_BEFORE_PAYMENT_MESSAGE, REVIEW_TIMELINE_MESSAGE } from "@/app/(customer)/_lib/compliance-messaging";
import {
  shouldLockKycPrefill,
  useCustomerProfileBvnNin,
  useKycProfilePrefillEffect,
} from "@/app/(customer)/_hooks/use-customer-profile-bvn-nin";
import { formAIdSchema } from "@/app/(customer)/_lib/form-a-id-schema";
import { kycBvnSchema, kycNinRequiredSchema } from "@/app/(customer)/_lib/kyc-bvn-nin-schema";
import TransactionFileUploadInput from '../../../../forms/TransactionFileUploadInput';
import { passportNumberSchema } from "@/app/(customer)/_utils/input-validation";

const uploadDocumentsSchema = z.object({
  bvn: kycBvnSchema,
  ninNumber: kycNinRequiredSchema,
  formAId: formAIdSchema,
  passportDocumentNumber: passportNumberSchema,
  passportFile: z.custom<FileWithPath | null>().refine((file) => file !== null, {
    message: "International Passport file is required",
  }),
  visaDocumentNumber: z.string().min(1, "Valid Visa Number is required").max(50, "Visa Number is too long"),
  visaFile: z.custom<FileWithPath | null>().refine((file) => file !== null, {
    message: "Valid Visa file is required",
  }),
  formAFile: z.custom<FileWithPath | null>().refine((file) => file !== null, {
    message: "Form A file is required",
  }),
  returnTicketFile: z.custom<FileWithPath | null>().refine((file) => file !== null, {
    message: "Return Ticket file is required",
  }),
  returnTicketDocumentNumber: z.string().max(50, "Return Ticket Number is too long").optional().nullable(),
});

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
}

export default function PTAUploadDocumentsStep({
  initialValues,
  onSubmit,
  onBack,
}: Readonly<PTAUploadDocumentsStepProps>) {
  const kyc = useCustomerProfileBvnNin();
  const bvnLocked = shouldLockKycPrefill(kyc.hasBvnFromProfile, initialValues?.bvn);
  const ninLocked = shouldLockKycPrefill(kyc.hasNinFromProfile, initialValues?.ninNumber);

  const form = useForm<UploadDocumentsFormValues>({
    mode: "uncontrolled",
    // Backwards-compat: older PTA step stored visa under `passportFile` and passport number under `formADocumentNumber`
    initialValues: {
      bvn: initialValues?.bvn || kyc.defaultBvn || "",
      ninNumber: initialValues?.ninNumber || kyc.defaultNin || "",
      formAId: initialValues?.formAId || "",
      passportDocumentNumber: initialValues?.passportDocumentNumber || initialValues?.formADocumentNumber || "",
      passportFile: initialValues?.passportFile ?? null,
      visaDocumentNumber: initialValues?.visaDocumentNumber || initialValues?.passportDocumentNumber || "",
      visaFile: initialValues?.visaFile ?? (initialValues?.passportFile ?? null),
      formAFile: initialValues?.formAFile ?? null,
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
          autoComplete="off"
          {...form.getInputProps("bvn")}
          disabled={bvnLocked}
        />

        <TextInput
          label="NIN Number"
          required
          size="md"
          placeholder="NIN"
          autoComplete="off"
          {...form.getInputProps("ninNumber")}
          disabled={ninLocked}
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

      <div className="grid grid-cols-1 gap-4">
        <TransactionFileUploadInput
          label="Upload International Passport"
          required
          value={form.values.passportFile}
          onChange={(file) => form.setFieldValue("passportFile", file)}
          error={form.errors.passportFile as string}
        />
        <TransactionFileUploadInput
          label="Upload Form A"
          required
          value={form.values.formAFile}
          onChange={(file) => form.setFieldValue("formAFile", file)}
          error={form.errors.formAFile as string}
        />
      </div>

      <TransactionFileUploadInput
        label="Valid Visa"
        required
        value={form.values.visaFile}
        onChange={(file) => form.setFieldValue("visaFile", file)}
        error={form.errors.visaFile as string}
      />

      <div className="space-y-3 ">
      <TextInput
              label="Valid Visa Number"
              required
              size="md"
              placeholder="Enter  Visa Number"
              maxLength={50}
              {...form.getInputProps("visaDocumentNumber")}
            />


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
