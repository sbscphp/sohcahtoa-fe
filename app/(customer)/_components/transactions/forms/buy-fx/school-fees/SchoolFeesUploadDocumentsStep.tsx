"use client";

import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { z } from "zod";
import { Alert, Button, Select, TextInput } from "@mantine/core";
import { Info } from "lucide-react";
import FileUploadInput from "../../../../forms/FileUploadInput";
import { FileWithPath } from "@mantine/dropzone";
import { HugeiconsIcon } from "@hugeicons/react";
import { ChevronDown } from "@hugeicons/core-free-icons";

const uploadDocumentsSchema = z.object({
  formAId: z.string().min(1, "Form A ID is required").max(30, "Form A ID is too long"),
  formAFile: z.custom<FileWithPath | null>().refine((file) => file !== null, {
    message: "Form A file is required",
  }),
  admissionType: z.string().min(1, "Admission type is required"),
});

export type SchoolFeesUploadDocumentsFormData = z.infer<typeof uploadDocumentsSchema>;

type SchoolFeesUploadDocumentsFormValues = z.input<typeof uploadDocumentsSchema>;

const ADMISSION_TYPES = ["Undergraduate", "Postgraduate", "Other"];

interface SchoolFeesUploadDocumentsStepProps {
  initialValues?: Partial<SchoolFeesUploadDocumentsFormValues>;
  onSubmit: (data: SchoolFeesUploadDocumentsFormData) => void;
  onBack?: () => void;
}

export default function SchoolFeesUploadDocumentsStep({
  initialValues,
  onSubmit,
  onBack,
}: SchoolFeesUploadDocumentsStepProps) {
  const form = useForm<SchoolFeesUploadDocumentsFormValues>({
    mode: "uncontrolled",
    initialValues: {
      formAId: initialValues?.formAId || "",
      formAFile: initialValues?.formAFile ?? null,
      admissionType: initialValues?.admissionType || "",
    },
    validate: zod4Resolver(uploadDocumentsSchema),
  });

  const handleSubmit = form.onSubmit((values) => {
    onSubmit(values as SchoolFeesUploadDocumentsFormData);
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex text-center flex-col items-center justify-center">
        <h2 className="text-body-heading-300 text-2xl font-semibold mb-1">
          Fill in all required information
        </h2>
        <p className="text-body-text-200 text-base max-w-md">
          Create a new school fees transaction and get access to foreign exchange
          for school fees.
        </p>
      </div>

      <Alert
        icon={<Info size={14} />}
        title=""
        className="bg-white! border-gray-300!"
      >
        <p className="text-body-text-200">
          All details will be verified before approval. You will be able to process
          your school fees once your documents is approved. Please note the maximum
          you can transact is <strong>$10,000 per year</strong>.
        </p>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextInput
          label="Form A"
          required
          size="md"
          placeholder="Enter Form A ID"
          maxLength={30}
          autoComplete="off"
          {...form.getInputProps("formAId")}
        />
        <FileUploadInput
          label="Upload Form A"
          required
          value={form.values.formAFile}
          onChange={(file) => form.setFieldValue("formAFile", file)}
          error={form.errors.formAFile as string}
        />
      </div>

      <Select
        label="Admission Type"
        required
        placeholder="Select an Option"
        data={ADMISSION_TYPES}
        size="md"
        rightSection={<HugeiconsIcon icon={ChevronDown} size={20} className="text-text-300" />}
        {...form.getInputProps("admissionType")}
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
