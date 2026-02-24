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

const uploadDocumentsSchema = z.object({
  bvn: z.string().regex(/^\d{11}$/, "BVN must be exactly 11 digits"),
  ninNumber: z.string().regex(/^\d{11}$/, "NIN must be exactly 11 digits"),
  passportDocumentNumber: z.string().min(1, "International Passport Number is required").max(50, "International Passport Number is too long"),
  workPermitNumber: z.string().min(1, "Work Permit Number is required").max(50, "Work Permit Number is too long"),
  internationalPassportFile: z
    .custom<FileWithPath | null>()
    .refine((file) => file !== null, {
      message: "International Passport is required",
    }),
  workPermitFile: z.custom<FileWithPath | null>().refine((file) => file !== null, {
    message: "Work Permit is required",
  }),
  passportIssueDate: z.string().min(1, "Passport Issued Date is required"),
  passportExpiryDate: z.string().min(1, "Passport Expiry Date is required"),
  utilityBillFile: z.custom<FileWithPath | null>().refine((file) => file !== null, {
    message: "Utility Bill is required",
  }),
  utilityBillNumber: z.string().min(1, "Utility Bill Number is required").max(50, "Utility Bill Number is too long"),
});

export type ExpatriateUploadDocumentsFormData = z.infer<typeof uploadDocumentsSchema>;

type ExpatriateUploadDocumentsFormValues = z.input<typeof uploadDocumentsSchema>;

interface ExpatriateUploadDocumentsStepProps {
  initialValues?: Partial<ExpatriateUploadDocumentsFormValues>;
  onSubmit: (data: ExpatriateUploadDocumentsFormData) => void;
  onBack?: () => void;
}

export default function ExpatriateUploadDocumentsStep({
  initialValues,
  onSubmit,
  onBack,
}: ExpatriateUploadDocumentsStepProps) {
  const form = useForm<ExpatriateUploadDocumentsFormValues>({
    mode: "uncontrolled",
    initialValues: {
      bvn: initialValues?.bvn || "",
      ninNumber: initialValues?.ninNumber || "",
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
          {APPROVAL_BEFORE_PAYMENT_MESSAGE} Please note the maximum you can
          transact is <strong>$10,000</strong> per transaction.
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
          label="NIN"
          required
          size="md"
          placeholder="Enter TIN Number"
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
        <TextInput
          label="International Passport Number"
          required
          size="md"
          placeholder="Enter Passport Number"
          maxLength={50}
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
          value={form.values.passportIssueDate && form.values.passportIssueDate.trim() ? new Date(form.values.passportIssueDate) : null}
          onChange={(value: string | null) => {
            if (value === null) {
              form.setFieldValue("passportIssueDate", "");
            } else {
              const date = new Date(value);
              form.setFieldValue("passportIssueDate", date.toISOString().split('T')[0]);
            }
          }}
          error={form.errors.passportIssueDate as string}
          rightSection={<HugeiconsIcon icon={CalendarIcon} size={20} className="text-text-300!" />}
        />
        <DateInput
          placeholder="Select"
          label="Passport Expiry Date"
          required
          size="md"
          value={form.values.passportExpiryDate && form.values.passportExpiryDate.trim() ? new Date(form.values.passportExpiryDate) : null}
          onChange={(value: string | null) => {
            if (value === null) {
              form.setFieldValue("passportExpiryDate", "");
            } else {
              const date = new Date(value);
              form.setFieldValue("passportExpiryDate", date.toISOString().split('T')[0]);
            }
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
