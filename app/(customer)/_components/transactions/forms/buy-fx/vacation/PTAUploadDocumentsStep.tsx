"use client";

import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { z } from "zod";
import { Alert, Button } from "@mantine/core";
import { Info } from "lucide-react";
import FileUploadInput from "../../../../forms/FileUploadInput";
import { TextInput } from "@mantine/core";
import { FileWithPath } from "@mantine/dropzone";

const uploadDocumentsSchema = z.object({
  bvn: z.string().regex(/^\d{11}$/, "BVN must be exactly 11 digits"),
  ninNumber: z.string().regex(/^\d{11}$/, "NIN must be exactly 11 digits"),
  formAId: z.string().min(1, "Form A ID is required").max(30, "Form A ID is too long"),
  formAFile: z.custom<FileWithPath | null>().refine((file) => file !== null, {
    message: "Form A file is required",
  }),
  passportFile: z.custom<FileWithPath | null>().refine((file) => file !== null, {
    message: "International Passport file is required",
  }),
  visaFile: z.custom<FileWithPath | null>().refine((file) => file !== null, {
    message: "Valid Visa file is required",
  }),
  returnTicketFile: z.custom<FileWithPath | null>().refine((file) => file !== null, {
    message: "Return Ticket file is required",
  }),
});

export type UploadDocumentsFormData = z.infer<typeof uploadDocumentsSchema>;

/** Form state allows null for file fields before validation */
type UploadDocumentsFormValues = z.input<typeof uploadDocumentsSchema>;

interface PTAUploadDocumentsStepProps {
  initialValues?: Partial<UploadDocumentsFormValues>;
  onSubmit: (data: UploadDocumentsFormData) => void;
  onBack?: () => void;
}

export default function PTAUploadDocumentsStep({
  initialValues,
  onSubmit,
  onBack,
}: PTAUploadDocumentsStepProps) {
  const form = useForm<UploadDocumentsFormValues>({
    mode: "uncontrolled",
    initialValues: {
      bvn: initialValues?.bvn || "",
      ninNumber: initialValues?.ninNumber || "",
      formAId: initialValues?.formAId || "",
      formAFile: initialValues?.formAFile ?? null,
      passportFile: initialValues?.passportFile ?? null,
      visaFile: initialValues?.visaFile ?? null,
      returnTicketFile: initialValues?.returnTicketFile ?? null,
    },
    validate: zod4Resolver(uploadDocumentsSchema),
  });

  const handleSubmit = form.onSubmit((values) => {
    onSubmit(values as UploadDocumentsFormData);
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex text-center flex-col items-center justify-center">
        <h2 className="text-body-heading-300 text-2xl font-semibold mb-1">
          Fill in all required information
        </h2>
        <p className="text-body-text-200 text-base max-w-md">
          Create a new Personal Travel Allowance (PTA) and get access to foreign
          exchange for personal trips abroad.
        </p>
      </div>

      <Alert
        icon={<Info size={14} />}
        title=""
        className="bg-white! border-gray-300!"
      >
        <p className="text-body-text-200">
          All uploads will be verified before approval. You will be able to process
          your PTA once your documents is approved. Please note the maximum you can
          transact is <strong>$4,000 per quarter</strong>.
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
          label="NIN Number"
          required
          size="md"
          placeholder="Enter 11-digit NIN"
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
      </div>

      <TextInput
        label="Form A ID"
        required
        size="md"
        placeholder="Enter Form A ID"
        maxLength={30}
        autoComplete="off"
        {...form.getInputProps("formAId")}
      />

      <div className="space-y-3 grid grid-cols-1 md:grid-cols-2 gap-4">
        <FileUploadInput
          label="Upload Form A"
          required
          value={form.values.formAFile}
          onChange={(file) => form.setFieldValue("formAFile", file)}
          error={form.errors.formAFile as string}
        />

        <FileUploadInput
          label="Upload International Passport"
          required
          value={form.values.passportFile}
          onChange={(file) => form.setFieldValue("passportFile", file)}
          error={form.errors.passportFile as string}
        />

        <FileUploadInput
          label="Valid Visa"
          required
          value={form.values.visaFile}
          onChange={(file) => form.setFieldValue("visaFile", file)}
          error={form.errors.visaFile as string}
        />

        <FileUploadInput
          label="Upload Return Ticket"
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
          Next
        </Button>
      </div>
    </form>
  );
}
