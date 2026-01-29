"use client";

import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { z } from "zod";
import { Alert, Button, TextInput } from "@mantine/core";
import { Info } from "lucide-react";
import FileUploadInput from "@/app/(customer)/_components/forms/FileUploadInput";
import { FileWithPath } from "@mantine/dropzone";

const uploadDocumentsSchema = z.object({
  tinNumber: z.string().min(1, "TIN Number is required"),
  internationalPassportFile: z
    .custom<FileWithPath | null>()
    .refine((file) => file !== null, {
      message: "International Passport is required",
    }),
  utilityBillFile: z.custom<FileWithPath | null>().refine((file) => file !== null, {
    message: "Utility Bill is required",
  }),
});

export type ResidentUploadDocumentsFormData = z.infer<typeof uploadDocumentsSchema>;

type ResidentUploadDocumentsFormValues = z.input<typeof uploadDocumentsSchema>;

interface ResidentUploadDocumentsStepProps {
  initialValues?: Partial<ResidentUploadDocumentsFormValues>;
  onSubmit: (data: ResidentUploadDocumentsFormData) => void;
  onBack?: () => void;
}

export default function ResidentUploadDocumentsStep({
  initialValues,
  onSubmit,
  onBack,
}: ResidentUploadDocumentsStepProps) {
  const form = useForm<ResidentUploadDocumentsFormValues>({
    mode: "uncontrolled",
    initialValues: {
      tinNumber: initialValues?.tinNumber || "",
      internationalPassportFile: initialValues?.internationalPassportFile ?? null,
      utilityBillFile: initialValues?.utilityBillFile ?? null,
    },
    validate: zod4Resolver(uploadDocumentsSchema),
  });

  const handleSubmit = form.onSubmit((values) => {
    onSubmit(values as ResidentUploadDocumentsFormData);
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
          All uploads will be verified before approval. You will be able to process
          your transaction once your documents is approved. Please note the maximum
          you can transact is <strong>$10,000</strong> per transaction.
        </p>
      </Alert>

      <TextInput
        label="TIN Number"
        required
        size="md"
        placeholder="Enter TIN Number"
        {...form.getInputProps("tinNumber")}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FileUploadInput
          label="International Passport"
          required
          value={form.values.internationalPassportFile}
          onChange={(file) => form.setFieldValue("internationalPassportFile", file)}
          error={form.errors.internationalPassportFile as string}
        />
        <FileUploadInput
          label="Utility Bill"
          required
          value={form.values.utilityBillFile}
          onChange={(file) => form.setFieldValue("utilityBillFile", file)}
          error={form.errors.utilityBillFile as string}
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
