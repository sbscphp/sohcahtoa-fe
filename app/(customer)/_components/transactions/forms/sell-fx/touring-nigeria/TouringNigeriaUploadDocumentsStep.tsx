"use client";

import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { z } from "zod";
import { Alert, Button, TextInput } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { Info } from "lucide-react";
import { FileWithPath } from "@mantine/dropzone";
import TransactionFileUploadInput from '../../../../forms/TransactionFileUploadInput';
import { HugeiconsIcon } from "@hugeicons/react";
import { CalendarIcon } from "@hugeicons/core-free-icons";

const uploadDocumentsSchema = z.object({
  passportDocumentNumber: z.string().min(1, "International Passport Number is required").max(50, "International Passport Number is too long"),
  passportFile: z.custom<FileWithPath | null>().refine((file) => file !== null, {
    message: "International Passport file is required",
  }),
  passportIssueDate: z.string().min(1, "Passport Issued Date is required"),
  passportExpiryDate: z.string().min(1, "Passport Expiry Date is required"),
  visaFile: z.custom<FileWithPath | null>().refine((file) => file !== null, {
    message: "Valid Visa file is required",
  }),
  visaDocumentNumber: z.string().min(1, "Valid Visa Number is required").max(50, "Valid Visa Number is too long"),
  returnTicketFile: z
    .custom<FileWithPath | null>()
    .refine((file) => file !== null, {
      message: "Return Ticket file is required",
    }),
  returnTicketDocumentNumber: z.string().min(1, "Return Ticket Number is required").max(50, "Return Ticket Number is too long"),
  receiptForInitialNairaPurchaseFile: z.custom<FileWithPath | null>().refine((file) => file !== null, {
    message: "Receipt for Initial Naira Purchase is required",
  }),
});

export type TouringNigeriaUploadDocumentsFormData = z.infer<
  typeof uploadDocumentsSchema
>;

type TouringNigeriaUploadDocumentsFormValues = z.input<typeof uploadDocumentsSchema>;

interface TouringNigeriaUploadDocumentsStepProps {
  initialValues?: Partial<TouringNigeriaUploadDocumentsFormValues>;
  onSubmit: (data: TouringNigeriaUploadDocumentsFormData) => void;
  onBack?: () => void;
}

export default function TouringNigeriaUploadDocumentsStep({
  initialValues,
  onSubmit,
  onBack,
}: TouringNigeriaUploadDocumentsStepProps) {
  const form = useForm<TouringNigeriaUploadDocumentsFormValues>({
    mode: "uncontrolled",
    initialValues: {
      passportDocumentNumber: initialValues?.passportDocumentNumber || "",
      passportFile: initialValues?.passportFile ?? null,
      passportIssueDate: initialValues?.passportIssueDate || "",
      passportExpiryDate: initialValues?.passportExpiryDate || "",
      visaFile: initialValues?.visaFile ?? null,
      visaDocumentNumber: initialValues?.visaDocumentNumber || "",
      returnTicketFile: initialValues?.returnTicketFile ?? null,
      returnTicketDocumentNumber: initialValues?.returnTicketDocumentNumber || "",
      receiptForInitialNairaPurchaseFile: initialValues?.receiptForInitialNairaPurchaseFile ?? null,
    },
    validate: zod4Resolver(uploadDocumentsSchema),
  });

  const handleSubmit = form.onSubmit((values) => {
    onSubmit(values as TouringNigeriaUploadDocumentsFormData);
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
          All uploads will be verified before approval. You will be able to
          process your transaction once your documents is approved. Please note
          the maximum you can transact is{" "}
          <strong>$10,000 per transaction</strong>.
        </p>
      </Alert>

      <TextInput
        label="International Passport Number"
        required
        size="md"
        placeholder="Enter Passport Number"
        maxLength={50}
        autoComplete="off"
        {...form.getInputProps("passportDocumentNumber")}
      />

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
        placeholder="Enter Number"
        maxLength={50}
        autoComplete="off"
        {...form.getInputProps("returnTicketDocumentNumber")}
      />

      <TransactionFileUploadInput
        label="Receipt for Initial Naira Purchase"
        required
        value={form.values.receiptForInitialNairaPurchaseFile}
        onChange={(file) => form.setFieldValue("receiptForInitialNairaPurchaseFile", file)}
        error={form.errors.receiptForInitialNairaPurchaseFile as string}
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
