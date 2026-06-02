"use client";

import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { z } from "zod";
import { Alert, Button, TextInput } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { Info } from "lucide-react";
import { FileWithPath } from "@mantine/dropzone";
import TransactionFileUploadInput from '../../../../forms/TransactionFileUploadInput';
import VisaDocumentUploadInput from '../../../../forms/VisaDocumentUploadInput';
import { HugeiconsIcon } from "@hugeicons/react";
import { CalendarIcon } from "@hugeicons/core-free-icons";
import {
  formatDateToIso,
  passportNumberSchema,
  requiredIsoDateSchema,
  validatePassportDates,
} from "@/app/(customer)/_utils/input-validation";
import { formAIdSchema } from "@/app/(customer)/_lib/form-a-id-schema";

const uploadDocumentsSchema = z.object({
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
  receiptForInitialNairaPurchaseFile: z.custom<FileWithPath | null>().refine((file) => file !== null, {
    message: "Receipt for Initial Naira Purchase file is required",
  }),
}).superRefine(validatePassportDates);

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
}: Readonly<TouristUploadDocumentsStepProps>) {
  const form = useForm<TouristUploadDocumentsFormValues>({
    mode: "uncontrolled",
    initialValues: {
      formAId: initialValues?.formAId || "",
      passportDocumentNumber: initialValues?.passportDocumentNumber || "",
      passportIssueDate: initialValues?.passportIssueDate || "",
      passportExpiryDate: initialValues?.passportExpiryDate || "",
      passportFile: initialValues?.passportFile ?? null,
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
          Please note the maximum you can
          transact is <strong>$10,000 per transaction</strong>.
        </p>
      </Alert>

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
          placeholder="Enter Passport Number"
          maxLength={9}
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
          rightSectionPointerEvents="all"
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
          rightSectionPointerEvents="all"
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
