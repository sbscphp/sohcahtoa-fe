"use client";

import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { z } from "zod";
import { Alert, Button, TextInput } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { Info } from "lucide-react";
import { FileWithPath } from "@mantine/dropzone";
import { APPROVAL_BEFORE_PAYMENT_MESSAGE, REVIEW_TIMELINE_MESSAGE } from "@/app/(customer)/_lib/compliance-messaging";
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
import { kycBvnSchema, kycNinRequiredSchema } from "@/app/(customer)/_lib/kyc-bvn-nin-schema";

const uploadDocumentsSchema = z.object({
  bvn: kycBvnSchema,
  ninNumber: kycNinRequiredSchema,
  passportDocumentNumber: passportNumberSchema,
  workPermitNumber: z.string().min(1, "Work Permit Number is required").max(50, "Work Permit Number is too long"),
  internationalPassportFile: z
    .custom<FileWithPath | null>()
    .refine((file) => file !== null, {
      message: "International Passport is required",
    }),
  workPermitFile: z.custom<FileWithPath | null>().refine((file) => file !== null, {
    message: "Work Permit is required",
  }),
  passportIssueDate: requiredIsoDateSchema("Passport Issued Date"),
  passportExpiryDate: requiredIsoDateSchema("Passport Expiry Date"),
  utilityBillFile: z.custom<FileWithPath | null>().refine((file) => file !== null, {
    message: "Utility Bill is required",
  }),
  utilityBillNumber: z.string().min(1, "Utility Bill Number is required").max(50, "Utility Bill Number is too long"),
}).superRefine(validatePassportDates);

export type ExpatriateUploadDocumentsFormData = z.infer<typeof uploadDocumentsSchema>;

type ExpatriateUploadDocumentsFormValues = z.input<typeof uploadDocumentsSchema>;

interface ExpatriateUploadDocumentsStepProps {
  initialValues?: Partial<ExpatriateUploadDocumentsFormValues>;
  onSubmit: (data: ExpatriateUploadDocumentsFormData) => void;
  onBack?: () => void;
  lockKycPrefill?: boolean;
}

export default function ExpatriateUploadDocumentsStep({
  initialValues,
  onSubmit,
  onBack,
  lockKycPrefill = false,
}: Readonly<ExpatriateUploadDocumentsStepProps>) {
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

  const form = useForm<ExpatriateUploadDocumentsFormValues>({
    mode: "uncontrolled",
    initialValues: {
      bvn: initialValues?.bvn || kyc.defaultBvn || "",
      ninNumber: initialValues?.ninNumber || kyc.defaultNin || "",
      passportDocumentNumber: initialValues?.passportDocumentNumber || "",
      workPermitNumber: initialValues?.workPermitNumber || "",
      internationalPassportFile: initialValues?.internationalPassportFile ?? null,
      workPermitFile: initialValues?.workPermitFile ?? null,
      passportIssueDate: initialValues?.passportIssueDate || "",
      passportExpiryDate: initialValues?.passportExpiryDate || "",
      utilityBillFile: initialValues?.utilityBillFile ?? null,
      utilityBillNumber: initialValues?.utilityBillNumber || "",
    },
    validate: zod4Resolver(uploadDocumentsSchema),
  });

  useKycProfilePrefillEffect(form, initialValues, kyc);

  const handleSubmit = form.onSubmit((values) => {
    onSubmit(values as ExpatriateUploadDocumentsFormData);
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex text-center flex-col items-center justify-center">
        <h2 className="text-body-heading-300 text-2xl font-semibold mb-1">
          Fill in all required information
        </h2>
        <p className="text-body-text-200 text-base max-w-md">
          Create transaction and get access to foreign exchange.
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
          transact is <strong>$10,000</strong> per transaction.
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
          label="International Passport Number"
          required
          size="md"
          placeholder="Enter Passport Number"
          maxLength={9}
          autoComplete="off"
          {...form.getInputProps("passportDocumentNumber")}
        />
        <TextInput
          label="Work Permit"
          required
          size="md"
          placeholder="Enter Number"
          maxLength={50}
          autoComplete="off"
          {...form.getInputProps("workPermitNumber")}
        />
      </div>

      <TransactionFileUploadInput
        label="International Passport"
        required
        value={form.values.internationalPassportFile}
        onChange={(file) => form.setFieldValue("internationalPassportFile", file)}
        error={form.errors.internationalPassportFile as string}
      />

      <TransactionFileUploadInput
        label="Work Permit"
        required
        value={form.values.workPermitFile}
        onChange={(file) => form.setFieldValue("workPermitFile", file)}
        error={form.errors.workPermitFile as string}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DateInput
          placeholder="Select"
          label="Passport Issued Date"
          required
          size="md"
          value={form.values.passportIssueDate?.trim() ? new Date(form.values.passportIssueDate) : null}
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
          value={form.values.passportExpiryDate?.trim() ? new Date(form.values.passportExpiryDate) : null}
          onChange={(value) => {
            form.setFieldValue("passportExpiryDate", formatDateToIso(value));
          }}
          error={form.errors.passportExpiryDate as string}
          rightSection={<HugeiconsIcon icon={CalendarIcon} size={20} className="text-text-300!" />}
        />
      </div>

      <TransactionFileUploadInput
        label="Utility Bill"
        required
        value={form.values.utilityBillFile}
        onChange={(file) => form.setFieldValue("utilityBillFile", file)}
        error={form.errors.utilityBillFile as string}
      />

      <TextInput
        label="Utility Bill"
        required
        size="md"
        placeholder="Enter Number"
        maxLength={50}
        autoComplete="off"
        {...form.getInputProps("utilityBillNumber")}
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
          Continue
        </Button>
      </div>
    </form>
  );
}
