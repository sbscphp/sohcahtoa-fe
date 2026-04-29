"use client";

import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { z } from "zod";
import { Alert, Button, TextInput } from "@mantine/core";
import { Info } from "lucide-react";
import { FileWithPath } from "@mantine/dropzone";
import { APPROVAL_BEFORE_PAYMENT_MESSAGE, REVIEW_TIMELINE_MESSAGE } from "@/app/(customer)/_lib/compliance-messaging";
import { formAIdSchema } from "@/app/(customer)/_lib/form-a-id-schema";
import {
  shouldLockKycPrefill,
  useCustomerProfileBvnNin,
  useKycProfilePrefillEffect,
} from "@/app/(customer)/_hooks/use-customer-profile-bvn-nin";
import { kycBvnSchema, kycNinRequiredSchema } from "@/app/(customer)/_lib/kyc-bvn-nin-schema";
import TransactionFileUploadInput from '../../../../forms/TransactionFileUploadInput';
import { passportNumberSchema } from "@/app/(customer)/_utils/input-validation";

const uploadDocumentsSchema = z.object({
  bvn: kycBvnSchema,
  ninNumber: kycNinRequiredSchema,
  formAId: formAIdSchema,
  formAFile: z.custom<FileWithPath | null>().refine((file) => file !== null, {
    message: "Form A file is required",
  }),
  passportDocumentNumber: passportNumberSchema,
  passportFile: z.custom<FileWithPath | null>().refine((file) => file !== null, {
    message: "International Passport file is required",
  }),
  visaDocumentNumber: z.string().min(1, "Valid Visa Number is required").max(50, "Visa Number is too long"),
  visaFile: z.custom<FileWithPath | null>().refine((file) => file !== null, {
    message: "Valid Visa file is required",
  }),
  returnTicketDocumentNumber: z.string().min(1, "Return Ticket Number is required").max(50, "Return Ticket Number is too long"),
  returnTicketFile: z.custom<FileWithPath | null>().refine((file) => file !== null, {
    message: "Return Ticket file is required",
  }),
  referenceLetterFromDoctorFile: z.custom<FileWithPath | null>().refine((file) => file !== null, {
    message: "Reference Letter (Nigerian Specialist or Hospital) is required",
  }),
  letterFromOverseasDoctorFile: z.custom<FileWithPath | null>().refine((file) => file !== null, {
    message: "Letter from overseas doctor stating treatment cost is required",
  }),
});

export type MedicalUploadDocumentsFormData = z.infer<typeof uploadDocumentsSchema>;

type MedicalUploadDocumentsFormValues = z.input<typeof uploadDocumentsSchema>;

/** Resuming / cross-flow state may pass `null` on optional keys (e.g. PTA shape → medical step). */
export type MedicalUploadDocumentsInitialValues = {
  [K in keyof MedicalUploadDocumentsFormValues]?:
    | MedicalUploadDocumentsFormValues[K]
    | null;
};

interface MedicalUploadDocumentsStepProps {
  initialValues?: MedicalUploadDocumentsInitialValues;
  onSubmit: (data: MedicalUploadDocumentsFormData) => void;
  onBack?: () => void;
  lockKycPrefill?: boolean;
}

export default function MedicalUploadDocumentsStep({
  initialValues,
  onSubmit,
  onBack,
  lockKycPrefill = false,
}: MedicalUploadDocumentsStepProps) {
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

  const form = useForm<MedicalUploadDocumentsFormValues>({
    mode: "uncontrolled",
    initialValues: {
      bvn: initialValues?.bvn || kyc.defaultBvn || "",
      ninNumber: initialValues?.ninNumber || kyc.defaultNin || "",
      formAId: initialValues?.formAId || "",
      formAFile: initialValues?.formAFile ?? null,
      passportDocumentNumber: initialValues?.passportDocumentNumber || "",
      passportFile: initialValues?.passportFile ?? null,
      visaDocumentNumber: initialValues?.visaDocumentNumber || "",
      visaFile: initialValues?.visaFile ?? null,
      returnTicketDocumentNumber: initialValues?.returnTicketDocumentNumber || "",
      returnTicketFile: initialValues?.returnTicketFile ?? null,
      referenceLetterFromDoctorFile: initialValues?.referenceLetterFromDoctorFile ?? null,
      letterFromOverseasDoctorFile: initialValues?.letterFromOverseasDoctorFile ?? null,
    },
    validate: zod4Resolver(uploadDocumentsSchema),
  });

  useKycProfilePrefillEffect(form, initialValues, kyc);

  const handleSubmit = form.onSubmit((values) => {
    onSubmit(values as MedicalUploadDocumentsFormData);
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex text-center flex-col items-center justify-center">
        <h2 className="text-body-heading-300 text-2xl font-semibold mb-1">
          Fill in all required information
        </h2>
        <p className="text-body-text-200 text-base max-w-md">
          Create a new medical fee transaction and get access to foreign exchange
          for medical treatment abroad.
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
          transact is <strong>$5,000 per quarter</strong>.
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
          label="NIN"
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
          placeholder="Enter Passport Number"
          maxLength={9}
          autoComplete="off"
          {...form.getInputProps("passportDocumentNumber")}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TransactionFileUploadInput
          label="Form A"
          required
          value={form.values.formAFile}
          onChange={(file) => form.setFieldValue("formAFile", file)}
          error={form.errors.formAFile as string}
        />

        <TransactionFileUploadInput
          label="International Passport"
          required
          value={form.values.passportFile}
          onChange={(file) => form.setFieldValue("passportFile", file)}
          error={form.errors.passportFile as string}
        />
      </div>

      <TransactionFileUploadInput
        label="Valid Visa"
        required
        value={form.values.visaFile}
        onChange={(file) => form.setFieldValue("visaFile", file)}
        error={form.errors.visaFile as string}
      />

      <TextInput
        label="Valid Visa Number"
        required
        size="md"
        placeholder="Enter Visa Number"
        maxLength={50}
        autoComplete="off"
        {...form.getInputProps("visaDocumentNumber")}
      />

      <TransactionFileUploadInput
        label="Return Ticket"
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
        autoComplete="off"
        {...form.getInputProps("returnTicketDocumentNumber")}
      />

      <div className="grid grid-cols-1 gap-4">
        <TransactionFileUploadInput
          label="Reference Letter (Nigerian Specialist or Hospital)"
          required
          value={form.values.referenceLetterFromDoctorFile}
          onChange={(file) => form.setFieldValue("referenceLetterFromDoctorFile", file)}
          error={form.errors.referenceLetterFromDoctorFile as string}
        />

        <TransactionFileUploadInput
          label="Letter from overseas doctor stating treatment cost"
          required
          value={form.values.letterFromOverseasDoctorFile}
          onChange={(file) => form.setFieldValue("letterFromOverseasDoctorFile", file)}
          error={form.errors.letterFromOverseasDoctorFile as string}
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
          Continue
        </Button>
      </div>
    </form>
  );
}
