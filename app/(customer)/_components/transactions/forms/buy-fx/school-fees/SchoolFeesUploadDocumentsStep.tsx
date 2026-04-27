"use client";

import { formAIdSchema } from "@/app/(customer)/_lib/form-a-id-schema";
import { passportNumberSchema, validatePassportDates } from "@/app/(customer)/_utils/input-validation";
import { ChevronDown } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert, Button, Select, TextInput } from "@mantine/core";
import { FileWithPath } from "@mantine/dropzone";
import { useForm } from "@mantine/form";
import { Info } from "lucide-react";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { useState } from "react";
import { z } from "zod";
import OtherForm from './components/OtherForm';
import PostgraduateForm from './components/PostgraduateForm';
import UndergraduateForm from './components/UndergraduateForm';

const uploadDocumentsSchema = z
  .object({
    admissionType: z.string().min(1, "Admission type is required"),
    formAId: formAIdSchema,
    evidenceOfAdmissionFile: z.custom<FileWithPath | null>().optional(),
    schoolInvoiceFile: z.custom<FileWithPath | null>().optional(),
    schoolInvoiceNumber: z.string().max(50, "School Invoice Number is too long").optional(),
    passportFile: z.custom<FileWithPath | null>().optional(),
    passportDocumentNumber: z.string().optional(),
    passportIssueDate: z.string().optional(),
    passportExpiryDate: z.string().optional(),
    statementOfResultFile: z.custom<FileWithPath | null>().optional(),
    statementOfResultsNumber: z.string().max(50, "Statement of Results Number is too long").optional(),
    firstDegreeCertificateFile: z.custom<FileWithPath | null>().optional(),
    transactionFile: z.custom<FileWithPath | null>().optional(),
    transactionDescription: z.string().max(1000, "Transaction Description is too long").optional(),
  })
  .superRefine((data, ctx) => {
    const requireFile = (
      path:
        | "evidenceOfAdmissionFile"
        | "schoolInvoiceFile"
        | "passportFile"
        | "statementOfResultFile"
        | "firstDegreeCertificateFile"
        | "transactionFile",
      message: string
    ) => {
      const value = data[path] as FileWithPath | null | undefined;
      if (!value) {
        ctx.addIssue({ code: "custom", path: [path], message });
      }
    };

    const requireText = (
      path:
        | "passportDocumentNumber"
        | "schoolInvoiceNumber"
        | "statementOfResultsNumber"
        | "transactionDescription"
        | "passportIssueDate"
        | "passportExpiryDate",
      message: string
    ) => {
      const value = (data[path] ?? "").toString().trim();
      if (!value) {
        ctx.addIssue({ code: "custom", path: [path], message });
      }
    };

    if (data.admissionType === "Undergraduate") {
      requireFile("evidenceOfAdmissionFile", "Evidence of Admission is required");
      requireFile("schoolInvoiceFile", "School Invoice is required");
      requireFile("passportFile", "International Passport file is required");

      const passportResult = passportNumberSchema.safeParse(
        (data.passportDocumentNumber ?? "").toString().trim()
      );
      if (!passportResult.success) {
        ctx.addIssue({
          code: "custom",
          path: ["passportDocumentNumber"],
          message: passportResult.error.issues[0]?.message ?? "International Passport Number is required",
        });
      }
      return;
    }

    if (data.admissionType === "Postgraduate") {
      requireFile("schoolInvoiceFile", "School Invoice is required");
      requireText("schoolInvoiceNumber", "School Invoice Number is required");
      requireFile("passportFile", "International Passport file is required");
      requireText("passportIssueDate", "Passport Issued Date is required");
      requireText("passportExpiryDate", "Passport Expiry Date is required");
      requireFile("statementOfResultFile", "Statement of Result is required");
      requireText("statementOfResultsNumber", "Statement of Results Number is required");
      requireFile("firstDegreeCertificateFile", "First Degree Certificate is required");

      validatePassportDates(
        {
          passportIssueDate: (data.passportIssueDate ?? "").toString(),
          passportExpiryDate: (data.passportExpiryDate ?? "").toString(),
        },
        ctx
      );
      return;
    }

    if (data.admissionType === "Other") {
      requireFile("transactionFile", "Transaction Document is required");
      requireText("transactionDescription", "Transaction Description is required");
    }
  });

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
    mode: "controlled",
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
          {/* {APPROVAL_BEFORE_PAYMENT_MESSAGE} */}
          Please note the maximum you can
          transact is <strong>$10,000 per year</strong>.
        </p>
        {/* <p className="text-body-text-200 mt-2">
          {REVIEW_TIMELINE_MESSAGE}
        </p> */}
      </Alert>

      <TextInput
        label="Form A ID"
        required
        size="md"
        placeholder="Enter Form A ID"
        maxLength={10}
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
          evidenceOfAdmissionFile={form.values.evidenceOfAdmissionFile ?? null}
          schoolInvoiceFile={form.values.schoolInvoiceFile ?? null}
          passportFile={form.values.passportFile ?? null}
          passportDocumentNumber={form.values.passportDocumentNumber || ""}
          onEvidenceOfAdmissionChange={(file) => form.setFieldValue("evidenceOfAdmissionFile", file)}
          onSchoolInvoiceChange={(file) => form.setFieldValue("schoolInvoiceFile", file)}
          onPassportChange={(file) => form.setFieldValue("passportFile", file)}
          onPassportNumberChange={(value) => {
            const normalized = value.replaceAll(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 9);
            form.setFieldValue("passportDocumentNumber", normalized);
            form.validateField("passportDocumentNumber");
          }}
          evidenceOfAdmissionError={form.errors.evidenceOfAdmissionFile as string}
          schoolInvoiceError={form.errors.schoolInvoiceFile as string}
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
