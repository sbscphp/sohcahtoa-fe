"use client";

import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { z } from "zod";
import { Alert, Button, TextInput } from "@mantine/core";
import { Info } from "lucide-react";
import { FileWithPath } from "@mantine/dropzone";
import { APPROVAL_BEFORE_PAYMENT_MESSAGE, REVIEW_TIMELINE_MESSAGE } from "@/app/(customer)/_lib/compliance-messaging";
import TransactionFileUploadInput from '../../../../forms/TransactionFileUploadInput';

const uploadDocumentsSchema = z.object({
  bvn: z.string().regex(/^\d{11}$/, "BVN must be exactly 11 digits"),
  ninNumber: z.string().regex(/^\d{11}$/, "NIN must be exactly 11 digits"),
  formAId: z.string().min(1, "Form A ID is required").max(30, "Form A ID is too long"),
  passportDocumentNumber: z.string().min(1, "International Passport Number is required").max(50, "International Passport Number is too long"),
  evidenceOfMembershipFile: z.custom<FileWithPath | null>().refine((file) => file !== null, {
    message: "Evidence of Membership is required",
  }),
  evidenceOfMembershipNumber: z.string().min(1, "Evidence of Membership Number is required").max(50, "Evidence of Membership Number is too long"),
  invoiceFromProfessionalBodyFile: z.custom<FileWithPath | null>().refine((file) => file !== null, {
    message: "Invoice from Professional Body is required",
  }),
  invoiceFromProfessionalBodyNumber: z.string().min(1, "Invoice from Professional Body Number is required").max(50, "Invoice from Professional Body Number is too long"),
});

export type ProfessionalBodyUploadDocumentsFormData = z.infer<typeof uploadDocumentsSchema>;

type ProfessionalBodyUploadDocumentsFormValues = z.input<typeof uploadDocumentsSchema>;

interface ProfessionalBodyUploadDocumentsStepProps {
  initialValues?: Partial<ProfessionalBodyUploadDocumentsFormValues>;
  onSubmit: (data: ProfessionalBodyUploadDocumentsFormData) => void;
  onBack?: () => void;
}

export default function ProfessionalBodyUploadDocumentsStep({
  initialValues,
  onSubmit,
  onBack,
}: ProfessionalBodyUploadDocumentsStepProps) {
  const form = useForm<ProfessionalBodyUploadDocumentsFormValues>({
    mode: "uncontrolled",
    initialValues: {
      bvn: initialValues?.bvn || "",
      ninNumber: initialValues?.ninNumber || "",
      formAId: initialValues?.formAId || "",
      passportDocumentNumber: initialValues?.passportDocumentNumber || "",
      evidenceOfMembershipFile: initialValues?.evidenceOfMembershipFile ?? null,
      evidenceOfMembershipNumber: initialValues?.evidenceOfMembershipNumber || "",
      invoiceFromProfessionalBodyFile: initialValues?.invoiceFromProfessionalBodyFile ?? null,
      invoiceFromProfessionalBodyNumber: initialValues?.invoiceFromProfessionalBodyNumber || "",
    },
    validate: zod4Resolver(uploadDocumentsSchema),
  });

  const handleSubmit = form.onSubmit((values) => {
    onSubmit(values as ProfessionalBodyUploadDocumentsFormData);
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex text-center flex-col items-center justify-center">
        <h2 className="text-body-heading-300 text-2xl font-semibold mb-1">
          Fill in all required information
        </h2>
        <p className="text-body-text-200 text-base max-w-md">
          Create a new professional fee transaction and get access to foreign
          exchange for international membership and professional body fees.
        </p>
      </div>

      <Alert
        icon={<Info size={14} />}
        title=""
        className="bg-white! border-gray-300!"
      >
        <p className="text-body-text-200">
          {APPROVAL_BEFORE_PAYMENT_MESSAGE} Please note the maximum you can
          transact is <strong>$2,000 per quarter</strong>.
        </p>
        <p className="text-body-text-200 mt-2">
          {REVIEW_TIMELINE_MESSAGE}
        </p>
      </Alert>

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </div>

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
        label="Evidence of Membership"
        required
        value={form.values.evidenceOfMembershipFile}
        onChange={(file) => form.setFieldValue("evidenceOfMembershipFile", file)}
        error={form.errors.evidenceOfMembershipFile as string}
      />

      <TextInput
        label="Evidence of Membership Number"
        required
        size="md"
        placeholder="Enter Number"
        maxLength={50}
        autoComplete="off"
        {...form.getInputProps("evidenceOfMembershipNumber")}
      />

      <TransactionFileUploadInput
        label="Invoice from Professional Body"
        required
        value={form.values.invoiceFromProfessionalBodyFile}
        onChange={(file) => form.setFieldValue("invoiceFromProfessionalBodyFile", file)}
        error={form.errors.invoiceFromProfessionalBodyFile as string}
      />

      <TextInput
        label="Invoice from Professional Body"
        required
        size="md"
        placeholder="Enter Invoice Number"
        maxLength={50}
        autoComplete="off"
        {...form.getInputProps("invoiceFromProfessionalBodyNumber")}
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
