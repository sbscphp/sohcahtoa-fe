"use client";

import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { z } from "zod";
import { Alert, Button } from "@mantine/core";
import { Info } from "lucide-react";
import FileUploadInput from "../../../../forms/FileUploadInput";
import { FileWithPath } from "@mantine/dropzone";

const uploadDocumentsSchema = z.object({
  visaFile: z.custom<FileWithPath | null>().refine((file) => file !== null, {
    message: "Valid Visa file is required",
  }),
  returnTicketFile: z.custom<FileWithPath | null>().refine((file) => file !== null, {
    message: "Valid Return Ticket file is required",
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
      visaFile: initialValues?.visaFile ?? null,
      returnTicketFile: initialValues?.returnTicketFile ?? null,
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
          All uploads will be verified before approval. You will be able to
          process your transaction once your documents is approved. Please note
          the maximum you can transact is <strong>$10,000 per transaction</strong>.
        </p>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FileUploadInput
          label="Valid Visa"
          required
          value={form.values.visaFile}
          onChange={(file) => form.setFieldValue("visaFile", file)}
          error={form.errors.visaFile as string}
        />

        <FileUploadInput
          label="Valid Return Ticket"
          required
          value={form.values.returnTicketFile}
          onChange={(file) => form.setFieldValue("returnTicketFile", file)}
          error={form.errors.returnTicketFile as string}
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
