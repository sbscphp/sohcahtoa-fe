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
  formAId: z.string().min(1, "Form A ID is required").max(30, "Form A ID is too long"),
  passportDocumentNumber: z.string().min(1, "International Passport Number is required").max(50, "International Passport Number is too long"),
  passportIssueDate: z.string().min(1, "Passport Issued Date is required"),
  passportExpiryDate: z.string().min(1, "Passport Expiry Date is required"),
  passportFile: z.custom<FileWithPath | null>().refine((file) => file !== null, {
    message: "International Passport file is required",
  }),
  visaDocumentNumber: z.string().min(1, "Valid Visa Number is required").max(50, "Valid Visa Number is too long"),
  visaFile: z.custom<FileWithPath | null>().refine((file) => file !== null, {
    message: "Valid Visa file is required",
  }),
  returnTicketFile: z.custom<FileWithPath | null>().refine((file) => file !== null, {
    message: "Return Ticket file is required",
  }),
  receiptForInitialNairaPurchaseFile: z.custom<FileWithPath | null>().refine((file) => file !== null, {
    message: "Receipt for Initial Naira Purchase file is required",
  }),
});

export type TouristUploadDocumentsFormData = z.infer<typeof uploadDocumentsSchema>;

type TouristUploadDocumentsFormValues = z.input<typeof uploadDocumentsSchema>;

interface TouristUploadDocumentsStepProps {
  initialValues?: Partial<TouristUploadDocumentsFormValues>;
  onSubmit: (data: TouristUploadDocumentsFormData) => void;
  onBack?: () => void;
}

export default function TouristUploadDocumentsStep({
  initialValues,
  onSubmit,
  onBack,
}: TouristUploadDocumentsStepProps) {
  const form = useForm<TouristUploadDocumentsFormValues>({
    mode: "uncontrolled",
    initialValues: {
      bvn: initialValues?.bvn || "",
      ninNumber: initialValues?.ninNumber || "",
      formAId: initialValues?.formAId || "",
      passportDocumentNumber: initialValues?.passportDocumentNumber || "",
      passportIssueDate: initialValues?.passportIssueDate || "",
      passportExpiryDate: initialValues?.passportExpiryDate || "",
      passportFile: initialValues?.passportFile ?? null,
      visaDocumentNumber: initialValues?.visaDocumentNumber || "",
      visaFile: initialValues?.visaFile ?? null,
      returnTicketFile: initialValues?.returnTicketFile ?? null,
      receiptForInitialNairaPurchaseFile: initialValues?.receiptForInitialNairaPurchaseFile ?? null,
    },
    validate: zod4Resolver(uploadDocumentsSchema),
  });

  const handleSubmit = form.onSubmit((values) => {
    onSubmit(values as TouristUploadDocumentsFormData);
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex text-center flex-col items-center justify-center">
        <h2 className="text-body-heading-300 text-2xl font-semibold mb-1">
          Fill in all required information
        </h2>
        <p className="text-body-text-200 text-base max-w-md">
          Create a tourist transaction and get access to Naira as a tourist in
          Nigeria.
        </p>
      </div>

      <Alert
        icon={<Info size={14} />}
        title=""
        className="bg-white! border-gray-300!"
      >
        <p className="text-body-text-200">
          {APPROVAL_BEFORE_PAYMENT_MESSAGE} Please note the maximum you can
          transact is <strong>$10,000 per transaction</strong>.
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
          placeholder="Enter NIN"
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
          label="Form A ID"
          required
          size="md"
          placeholder="Enter Form A ID"
          maxLength={30}
          autoComplete="off"
          {...form.getInputProps("formAId")}
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
      </div>

      <TransactionFileUploadInput
        label="International Passport"
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
          {...form.getInputProps("passportIssueDate")}
          rightSection={<HugeiconsIcon icon={CalendarIcon} size={20} className="text-text-300!" />}
        />
        <DateInput
          placeholder="Select"
          label="Passport Expiry Date"
          required
          size="md"
          {...form.getInputProps("passportExpiryDate")}
          rightSection={<HugeiconsIcon icon={CalendarIcon} size={20} className="text-text-300!" />}
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
        placeholder="Enter Number"
        maxLength={50}
        autoComplete="off"
        {...form.getInputProps("visaDocumentNumber")}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TransactionFileUploadInput
          label="Return Ticket"
          required
          value={form.values.returnTicketFile}
          onChange={(file) => form.setFieldValue("returnTicketFile", file)}
          error={form.errors.returnTicketFile as string}
        />
        <TransactionFileUploadInput
          label="Receipt for Initial Naira Purchase"
          required
          value={form.values.receiptForInitialNairaPurchaseFile}
          onChange={(file) => form.setFieldValue("receiptForInitialNairaPurchaseFile", file)}
          error={form.errors.receiptForInitialNairaPurchaseFile as string}
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
