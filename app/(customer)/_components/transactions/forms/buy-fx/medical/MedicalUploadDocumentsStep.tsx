"use client";

import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { z } from "zod";
import { Alert, Button, TextInput } from "@mantine/core";
import { Info } from "lucide-react";
import FileUploadInput from "../../../../forms/FileUploadInput";
import { FileWithPath } from "@mantine/dropzone";

const uploadDocumentsSchema = z.object({
  bvn: z.string().regex(/^\d{11}$/, "BVN must be exactly 11 digits"),
  formAId: z.string().min(1, "Form A ID is required").max(30, "Form A ID is too long"),
  formAFile: z.custom<FileWithPath | null>().refine((file) => file !== null, {
    message: "Form A file is required",
  }),
  utilityBillFile: z.custom<FileWithPath | null>().refine((file) => file !== null, {
    message: "Utility Bill file is required",
  }),
  visaFile: z.custom<FileWithPath | null>().refine((file) => file !== null, {
    message: "Valid Visa file is required",
  }),
  ticketFile: z.custom<FileWithPath | null>().refine((file) => file !== null, {
    message: "Valid Ticket file is required",
  }),
  referenceLetterFromDoctorFile: z.custom<FileWithPath | null>().refine((file) => file !== null, {
    message: "Reference Letter from Doctor is required",
  }),
  letterFromOverseasDoctorFile: z.custom<FileWithPath | null>().refine((file) => file !== null, {
    message: "Letter from overseas doctor stating treatment cost is required",
  }),
});

export type MedicalUploadDocumentsFormData = z.infer<typeof uploadDocumentsSchema>;

type MedicalUploadDocumentsFormValues = z.input<typeof uploadDocumentsSchema>;

interface MedicalUploadDocumentsStepProps {
  initialValues?: Partial<MedicalUploadDocumentsFormValues>;
  onSubmit: (data: MedicalUploadDocumentsFormData) => void;
  onBack?: () => void;
}

export default function MedicalUploadDocumentsStep({
  initialValues,
  onSubmit,
  onBack,
}: MedicalUploadDocumentsStepProps) {
  const form = useForm<MedicalUploadDocumentsFormValues>({
    mode: "uncontrolled",
    initialValues: {
      bvn: initialValues?.bvn || "",
      formAId: initialValues?.formAId || "",
      formAFile: initialValues?.formAFile ?? null,
      utilityBillFile: initialValues?.utilityBillFile ?? null,
      visaFile: initialValues?.visaFile ?? null,
      ticketFile: initialValues?.ticketFile ?? null,
      referenceLetterFromDoctorFile: initialValues?.referenceLetterFromDoctorFile ?? null,
      letterFromOverseasDoctorFile: initialValues?.letterFromOverseasDoctorFile ?? null,
    },
    validate: zod4Resolver(uploadDocumentsSchema),
  });

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
          All uploads will be verified before approval. You will be able to process
          your medical fee once your documents is approved. Please note the maximum
          you can transact is <strong>$5,000 per quarter</strong>.
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

        <FileUploadInput
          label="Upload Utility Bill"
          required
          value={form.values.utilityBillFile}
          onChange={(file) => form.setFieldValue("utilityBillFile", file)}
          error={form.errors.utilityBillFile as string}
        />

        <FileUploadInput
          label="Valid Visa"
          required
          value={form.values.visaFile}
          onChange={(file) => form.setFieldValue("visaFile", file)}
          error={form.errors.visaFile as string}
        />

        <FileUploadInput
          label="Valid Ticket"
          required
          value={form.values.ticketFile}
          onChange={(file) => form.setFieldValue("ticketFile", file)}
          error={form.errors.ticketFile as string}
        />

        <FileUploadInput
          label="Reference Letter from Doctor"
          required
          value={form.values.referenceLetterFromDoctorFile}
          onChange={(file) => form.setFieldValue("referenceLetterFromDoctorFile", file)}
          error={form.errors.referenceLetterFromDoctorFile as string}
        />

        <FileUploadInput
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
