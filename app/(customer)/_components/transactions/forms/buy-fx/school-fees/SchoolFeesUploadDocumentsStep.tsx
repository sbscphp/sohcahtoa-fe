"use client";

import { useState } from "react";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { z } from "zod";
import { Alert, Button, Select, TextInput } from "@mantine/core";
import { Info } from "lucide-react";
import { FileWithPath } from "@mantine/dropzone";
import { HugeiconsIcon } from "@hugeicons/react";
import { ChevronDown } from "@hugeicons/core-free-icons";
import { APPROVAL_BEFORE_PAYMENT_MESSAGE, REVIEW_TIMELINE_MESSAGE } from "@/app/(customer)/_lib/compliance-messaging";
import UndergraduateForm from './components/UndergraduateForm';
import PostgraduateForm from './components/PostgraduateForm';
import OtherForm from './components/OtherForm';

const undergraduateSchema = z.object({
  admissionType: z.string().min(1, "Admission type is required"),
  formAId: z.string().min(1, "Form A ID is required").max(30, "Form A ID is too long"),
  schoolInvoiceFile: z.custom<FileWithPath | null>().refine((file) => file !== null, {
    message: "School Invoice is required",
  }),
  schoolInvoiceNumber: z.string().min(1, "School Invoice Number is required").max(50, "School Invoice Number is too long"),
  evidenceOfAdmissionFile: z.custom<FileWithPath | null>().refine((file) => file !== null, {
    message: "Evidence of Admission is required",
  }),
  passportFile: z.custom<FileWithPath | null>().refine((file) => file !== null, {
    message: "International Passport file is required",
  }),
  passportDocumentNumber: z.string().min(1, "International Passport Number is required").max(50, "International Passport Number is too long"),
});

const postgraduateSchema = z.object({
  admissionType: z.string().min(1, "Admission type is required"),
  formAId: z.string().min(1, "Form A ID is required").max(30, "Form A ID is too long"),
  schoolInvoiceFile: z.custom<FileWithPath | null>().refine((file) => file !== null, {
    message: "School Invoice is required",
  }),
  schoolInvoiceNumber: z.string().min(1, "School Invoice Number is required").max(50, "School Invoice Number is too long"),
  passportFile: z.custom<FileWithPath | null>().refine((file) => file !== null, {
    message: "International Passport file is required",
  }),
  passportIssueDate: z.string().min(1, "Passport Issued Date is required"),
  passportExpiryDate: z.string().min(1, "Passport Expiry Date is required"),
  statementOfResultFile: z.custom<FileWithPath | null>().refine((file) => file !== null, {
    message: "Statement of Result is required",
  }),
  statementOfResultsNumber: z.string().min(1, "Statement of Results Number is required").max(50, "Statement of Results Number is too long"),
  firstDegreeCertificateFile: z.custom<FileWithPath | null>().refine((file) => file !== null, {
    message: "First Degree Certificate is required",
  }),
});

const otherSchema = z.object({
  admissionType: z.string().min(1, "Admission type is required"),
  formAId: z.string().min(1, "Form A ID is required").max(30, "Form A ID is too long"),
  transactionFile: z.custom<FileWithPath | null>().refine((file) => file !== null, {
    message: "Transaction Document is required",
  }),
  transactionDescription: z.string().min(1, "Transaction Description is required").max(1000, "Transaction Description is too long"),
});

const uploadDocumentsSchema = z.union([undergraduateSchema, postgraduateSchema, otherSchema]).refine(
  (data) => {
    if (data.admissionType === "Postgraduate") {
      return postgraduateSchema.safeParse(data).success;
    }
    if (data.admissionType === "Other") {
      return otherSchema.safeParse(data).success;
    }
    return undergraduateSchema.safeParse(data).success;
  },
  { message: "Please fill all required fields for the selected admission type" }
);

export type SchoolFeesUploadDocumentsFormData = z.infer<typeof uploadDocumentsSchema>;

type SchoolFeesUploadDocumentsFormValues = {
  admissionType: string;
  formAId?: string;
  evidenceOfAdmissionFile?: FileWithPath | null;
  schoolInvoiceFile?: FileWithPath | null;
  schoolInvoiceNumber?: string;
  passportFile?: FileWithPath | null;
  passportDocumentNumber?: string;
  passportIssueDate?: string;
  passportExpiryDate?: string;
  statementOfResultFile?: FileWithPath | null;
  statementOfResultsNumber?: string;
  firstDegreeCertificateFile?: FileWithPath | null;
  transactionFile?: FileWithPath | null;
  transactionDescription?: string;
};

const ADMISSION_TYPES = ["Undergraduate", "Postgraduate", "Other"];

interface SchoolFeesUploadDocumentsStepProps {
  initialValues?: Partial<SchoolFeesUploadDocumentsFormValues>;
  onSubmit: (data: SchoolFeesUploadDocumentsFormData) => void;
  onBack?: () => void;
}

type FormValues = SchoolFeesUploadDocumentsFormValues;

export default function SchoolFeesUploadDocumentsStep({
  initialValues,
  onSubmit,
  onBack,
}: SchoolFeesUploadDocumentsStepProps) {
  const [admissionType, setAdmissionType] = useState<string>(initialValues?.admissionType || "");

  const form = useForm<FormValues>({
    mode: "uncontrolled",
    initialValues: {
      formAId: initialValues?.formAId || "",
      admissionType: initialValues?.admissionType || "",
      evidenceOfAdmissionFile: initialValues?.evidenceOfAdmissionFile ?? null,
      schoolInvoiceFile: initialValues?.schoolInvoiceFile ?? null,
      schoolInvoiceNumber: initialValues?.schoolInvoiceNumber || "",
      passportFile: initialValues?.passportFile ?? null,
      passportDocumentNumber: initialValues?.passportDocumentNumber || "",
      passportIssueDate: initialValues?.passportIssueDate || "",
      passportExpiryDate: initialValues?.passportExpiryDate || "",
      statementOfResultFile: initialValues?.statementOfResultFile ?? null,
      statementOfResultsNumber: initialValues?.statementOfResultsNumber || "",
      firstDegreeCertificateFile: initialValues?.firstDegreeCertificateFile ?? null,
      transactionFile: initialValues?.transactionFile ?? null,
      transactionDescription: initialValues?.transactionDescription || "",
    },
    validate: zod4Resolver(uploadDocumentsSchema),
  });

  const handleSubmit = form.onSubmit((values) => {
    onSubmit(values as SchoolFeesUploadDocumentsFormData);
  });

  const isUndergraduate = admissionType === "Undergraduate";
  const isPostgraduate = admissionType === "Postgraduate";
  const isOther = admissionType === "Other";

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
          {APPROVAL_BEFORE_PAYMENT_MESSAGE} Please note the maximum you can
          transact is <strong>$10,000 per year</strong>.
        </p>
        <p className="text-body-text-200 mt-2">
          {REVIEW_TIMELINE_MESSAGE}
        </p>
      </Alert>

      <TextInput
        label="Form A"
        required
        size="md"
        placeholder="Enter Form A ID"
        maxLength={30}
        autoComplete="off"
        {...form.getInputProps("formAId")}
      />

      <Select
        label="Admission Type"
        required
        placeholder="Select an Option"
        data={ADMISSION_TYPES}
        size="md"
        rightSection={<HugeiconsIcon icon={ChevronDown} size={20} className="text-text-300" />}
        value={admissionType}
        onChange={(value) => {
          const selectedValue = value || "";
          setAdmissionType(selectedValue);
          form.setFieldValue("admissionType", selectedValue);
        }}
        error={form.errors.admissionType}
      />

      {isUndergraduate && (
        <UndergraduateForm
          evidenceOfAdmissionFile={(form.values as FormValues).evidenceOfAdmissionFile ?? null}
          schoolInvoiceFile={(form.values as FormValues).schoolInvoiceFile ?? null}
          schoolInvoiceNumber={(form.values as FormValues).schoolInvoiceNumber || ""}
          passportFile={(form.values as FormValues).passportFile ?? null}
          passportDocumentNumber={(form.values as FormValues).passportDocumentNumber || ""}
          onEvidenceOfAdmissionChange={(file) => form.setFieldValue("evidenceOfAdmissionFile", file)}
          onSchoolInvoiceChange={(file) => form.setFieldValue("schoolInvoiceFile", file)}
          onSchoolInvoiceNumberChange={(value) => form.setFieldValue("schoolInvoiceNumber", value)}
          onPassportChange={(file) => form.setFieldValue("passportFile", file)}
          onPassportNumberChange={(value) => form.setFieldValue("passportDocumentNumber", value)}
          evidenceOfAdmissionError={form.errors.evidenceOfAdmissionFile as string}
          schoolInvoiceError={form.errors.schoolInvoiceFile as string}
          schoolInvoiceNumberError={form.errors.schoolInvoiceNumber as string}
          passportError={form.errors.passportFile as string}
          passportNumberError={form.errors.passportDocumentNumber as string}
        />
      )}

      {isPostgraduate && (
        <PostgraduateForm
          passportFile={(form.values as FormValues).passportFile ?? null}
          passportIssueDate={(form.values as FormValues).passportIssueDate || ""}
          passportExpiryDate={(form.values as FormValues).passportExpiryDate || ""}
          statementOfResultFile={(form.values as FormValues).statementOfResultFile ?? null}
          statementOfResultsNumber={(form.values as FormValues).statementOfResultsNumber || ""}
          schoolInvoiceFile={(form.values as FormValues).schoolInvoiceFile ?? null}
          schoolInvoiceNumber={(form.values as FormValues).schoolInvoiceNumber || ""}
          firstDegreeCertificateFile={(form.values as FormValues).firstDegreeCertificateFile ?? null}
          onPassportChange={(file) => form.setFieldValue("passportFile", file)}
          onPassportIssueDateChange={(value) => form.setFieldValue("passportIssueDate", value)}
          onPassportExpiryDateChange={(value) => form.setFieldValue("passportExpiryDate", value)}
          onStatementOfResultChange={(file) => form.setFieldValue("statementOfResultFile", file)}
          onStatementOfResultsNumberChange={(value) => form.setFieldValue("statementOfResultsNumber", value)}
          onSchoolInvoiceChange={(file) => form.setFieldValue("schoolInvoiceFile", file)}
          onSchoolInvoiceNumberChange={(value) => form.setFieldValue("schoolInvoiceNumber", value)}
          onFirstDegreeCertificateChange={(file) => form.setFieldValue("firstDegreeCertificateFile", file)}
          passportError={form.errors.passportFile as string}
          passportIssueDateError={form.errors.passportIssueDate as string}
          passportExpiryDateError={form.errors.passportExpiryDate as string}
          statementOfResultError={form.errors.statementOfResultFile as string}
          statementOfResultsNumberError={form.errors.statementOfResultsNumber as string}
          schoolInvoiceError={form.errors.schoolInvoiceFile as string}
          schoolInvoiceNumberError={form.errors.schoolInvoiceNumber as string}
          firstDegreeCertificateError={form.errors.firstDegreeCertificateFile as string}
        />
      )}

      {isOther && (
        <OtherForm
          transactionFile={(form.values as FormValues).transactionFile ?? null}
          transactionDescription={(form.values as FormValues).transactionDescription || ""}
          onTransactionFileChange={(file) => form.setFieldValue("transactionFile", file)}
          onTransactionDescriptionChange={(value) => form.setFieldValue("transactionDescription", value)}
          transactionFileError={form.errors.transactionFile as string}
          transactionDescriptionError={form.errors.transactionDescription as string}
        />
      )}

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
