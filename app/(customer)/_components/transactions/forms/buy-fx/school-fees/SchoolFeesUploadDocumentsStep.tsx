"use client";

import { formAIdSchema } from "@/app/(customer)/_lib/form-a-id-schema";
import { kycNinRequiredSchema } from "@/app/(customer)/_lib/kyc-bvn-nin-schema";
import {
  shouldLockKycPrefill,
  useCustomerProfileBvnNin,
} from "@/app/(customer)/_hooks/use-customer-profile-bvn-nin";
import {
  isOtherAdmissionType,
  requiresUndergraduateStyleDocuments,
  SCHOOL_FEES_ADMISSION_OPTIONS,
  SCHOOL_FEES_ADMISSION_UI,
} from "@/app/(customer)/_utils/school-fees-admission";
import { passportNumberSchema, validatePassportDates } from "@/app/(customer)/_utils/input-validation";
import { ChevronDown } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button, Select, TextInput } from "@mantine/core";
import { FileWithPath } from "@mantine/dropzone";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { useEffect, useState } from "react";
import { z } from "zod";
import PostgraduateForm from "./components/PostgraduateForm";
import SchoolFeesKycFields from "./components/SchoolFeesKycFields";
import SchoolFeesStudentPassportFields from "./components/SchoolFeesStudentPassportFields";
import UndergraduateForm, {
  OTHER_ADMISSION_DOCUMENT_LABELS,
} from "./components/UndergraduateForm";

function addSchoolFeesStudentPassportIssues(
  data: {
    studentNinNumber?: string;
    studentPassportDocumentNumber?: string;
    studentPassportIssueDate?: string;
    studentPassportExpiryDate?: string;
  },
  ctx: z.RefinementCtx
) {
  const studentNinResult = kycNinRequiredSchema.safeParse(
    (data.studentNinNumber ?? "").toString().trim()
  );
  if (!studentNinResult.success) {
    ctx.addIssue({
      code: "custom",
      path: ["studentNinNumber"],
      message: studentNinResult.error.issues[0]?.message ?? "Student NIN is required",
    });
  }

  const passportResult = passportNumberSchema.safeParse(
    (data.studentPassportDocumentNumber ?? "").toString().trim()
  );
  if (!passportResult.success) {
    ctx.addIssue({
      code: "custom",
      path: ["studentPassportDocumentNumber"],
      message:
        passportResult.error.issues[0]?.message ??
        "Student International Passport Number is required",
    });
  }

  const requireDate = (
    path: "studentPassportIssueDate" | "studentPassportExpiryDate",
    message: string
  ) => {
    if (!(data[path] ?? "").toString().trim()) {
      ctx.addIssue({ code: "custom", path: [path], message });
    }
  };

  requireDate("studentPassportIssueDate", "Student Passport Issued Date is required");
  requireDate("studentPassportExpiryDate", "Student Passport Expiry Date is required");
  validatePassportDates(
    {
      passportIssueDate: (data.studentPassportIssueDate ?? "").toString(),
      passportExpiryDate: (data.studentPassportExpiryDate ?? "").toString(),
    },
    ctx,
    {
      issueDate: "studentPassportIssueDate",
      expiryDate: "studentPassportExpiryDate",
    }
  );
}

function addSchoolFeesKycIssues(
  data: {
    ninNumber?: string;
    passportDocumentNumber?: string;
    passportIssueDate?: string;
    passportExpiryDate?: string;
    passportFile?: FileWithPath | null;
  },
  ctx: z.RefinementCtx
) {
  const ninResult = kycNinRequiredSchema.safeParse((data.ninNumber ?? "").toString().trim());
  if (!ninResult.success) {
    ctx.addIssue({
      code: "custom",
      path: ["ninNumber"],
      message: ninResult.error.issues[0]?.message ?? "NIN is required",
    });
  }

  const passportResult = passportNumberSchema.safeParse(
    (data.passportDocumentNumber ?? "").toString().trim()
  );
  if (!passportResult.success) {
    ctx.addIssue({
      code: "custom",
      path: ["passportDocumentNumber"],
      message:
        passportResult.error.issues[0]?.message ??
        "Applicant International Passport Number is required",
    });
  }

  const requireDate = (path: "passportIssueDate" | "passportExpiryDate", message: string) => {
    if (!(data[path] ?? "").toString().trim()) {
      ctx.addIssue({ code: "custom", path: [path], message });
    }
  };

  requireDate("passportIssueDate", "Applicant Passport Issued Date is required");
  requireDate("passportExpiryDate", "Applicant Passport Expiry Date is required");
  validatePassportDates(
    {
      passportIssueDate: (data.passportIssueDate ?? "").toString(),
      passportExpiryDate: (data.passportExpiryDate ?? "").toString(),
    },
    ctx
  );

  if (!data.passportFile) {
    ctx.addIssue({
      code: "custom",
      path: ["passportFile"],
      message: "Applicant International Passport file is required",
    });
  }
}

function requireUndergraduateStyleFiles(
  data: z.infer<typeof uploadDocumentsBaseSchema>,
  ctx: z.RefinementCtx,
  options?: { enrollmentLabel?: string }
) {
  const enrollmentMessage =
    options?.enrollmentLabel ?? "Evidence of Admission is required";

  const requireFile = (
    path: "evidenceOfAdmissionFile" | "schoolInvoiceFile" | "studentPassportFile",
    message: string
  ) => {
    const value = data[path] as FileWithPath | null | undefined;
    if (!value) {
      ctx.addIssue({ code: "custom", path: [path], message });
    }
  };

  requireFile("evidenceOfAdmissionFile", enrollmentMessage);
  requireFile("schoolInvoiceFile", "School Invoice is required");
  requireFile("studentPassportFile", "Student International Passport file is required");
}

const uploadDocumentsBaseSchema = z.object({
  studentName: z.string().trim().min(1, "Student name is required"),
  studentNinNumber: z.string().optional(),
  studentPassportDocumentNumber: z.string().optional(),
  studentPassportIssueDate: z.string().optional(),
  studentPassportExpiryDate: z.string().optional(),
  admissionType: z.string().min(1, "Admission type is required"),
  formAId: formAIdSchema,
  evidenceOfAdmissionFile: z.custom<FileWithPath | null>().optional(),
  schoolInvoiceFile: z.custom<FileWithPath | null>().optional(),
  ninNumber: z.string().optional(),
  passportFile: z.custom<FileWithPath | null>().optional(),
  studentPassportFile: z.custom<FileWithPath | null>().optional(),
  passportDocumentNumber: z.string().optional(),
  passportIssueDate: z.string().optional(),
  passportExpiryDate: z.string().optional(),
  statementOfResultFile: z.custom<FileWithPath | null>().optional(),
  firstDegreeCertificateFile: z.custom<FileWithPath | null>().optional(),
});

const uploadDocumentsSchema = uploadDocumentsBaseSchema.superRefine((data, ctx) => {
  const requireFile = (
    path:
      | "evidenceOfAdmissionFile"
      | "schoolInvoiceFile"
      | "studentPassportFile"
      | "statementOfResultFile"
      | "firstDegreeCertificateFile",
    message: string
  ) => {
    const value = data[path] as FileWithPath | null | undefined;
    if (!value) {
      ctx.addIssue({ code: "custom", path: [path], message });
    }
  };

  addSchoolFeesStudentPassportIssues(data, ctx);
  addSchoolFeesKycIssues(data, ctx);

  if (requiresUndergraduateStyleDocuments(data.admissionType)) {
    requireUndergraduateStyleFiles(data, ctx, {
      enrollmentLabel: isOtherAdmissionType(data.admissionType)
        ? "Evidence of Enrollment is required"
        : undefined,
    });
    return;
  }

  if (data.admissionType === SCHOOL_FEES_ADMISSION_UI.POSTGRADUATE) {
    requireFile("evidenceOfAdmissionFile", "Evidence of Admission is required");
    requireFile("schoolInvoiceFile", "School Invoice is required");
    requireFile("firstDegreeCertificateFile", "First Degree Certificate is required");
    requireFile("statementOfResultFile", "Statement of Result is required");
    requireFile("studentPassportFile", "Student International Passport file is required");
  }
});

export type SchoolFeesUploadDocumentsFormData = z.infer<typeof uploadDocumentsSchema>;

type SchoolFeesUploadDocumentsFormValues = z.infer<typeof uploadDocumentsBaseSchema>;

type SchoolFeesUploadDocumentsInitialValues = Partial<SchoolFeesUploadDocumentsFormValues>;

interface SchoolFeesUploadDocumentsStepProps {
  initialValues?: SchoolFeesUploadDocumentsInitialValues;
  onSubmit: (data: SchoolFeesUploadDocumentsFormData) => void;
  onBack?: () => void;
  lockKycPrefill?: boolean;
  omitLoggedInUserKyc?: boolean;
}

export default function SchoolFeesUploadDocumentsStep({
  initialValues,
  onSubmit,
  onBack,
  lockKycPrefill = false,
  omitLoggedInUserKyc = false,
}: SchoolFeesUploadDocumentsStepProps) {
  const [admissionType, setAdmissionType] = useState<string>(initialValues?.admissionType || "");
  const kyc = useCustomerProfileBvnNin();
  const ninLocked =
    !omitLoggedInUserKyc &&
    shouldLockKycPrefill(
    kyc.hasNinFromProfile,
    initialValues?.ninNumber,
    kyc.defaultNin
  );
  const forceNinLock = lockKycPrefill && Boolean(initialValues?.ninNumber?.trim());

  const form = useForm<SchoolFeesUploadDocumentsFormValues>({
    mode: "controlled",
    initialValues: {
      studentName: initialValues?.studentName || "",
      studentNinNumber: initialValues?.studentNinNumber || "",
      studentPassportDocumentNumber: initialValues?.studentPassportDocumentNumber || "",
      studentPassportIssueDate: initialValues?.studentPassportIssueDate || "",
      studentPassportExpiryDate: initialValues?.studentPassportExpiryDate || "",
      formAId: initialValues?.formAId || "",
      admissionType: initialValues?.admissionType || "",
      ninNumber:
        initialValues?.ninNumber || (omitLoggedInUserKyc ? "" : kyc.defaultNin) || "",
      evidenceOfAdmissionFile: initialValues?.evidenceOfAdmissionFile ?? null,
      schoolInvoiceFile: initialValues?.schoolInvoiceFile ?? null,
      studentPassportFile: initialValues?.studentPassportFile ?? null,
      passportDocumentNumber: initialValues?.passportDocumentNumber || "",
      passportIssueDate: initialValues?.passportIssueDate || "",
      passportExpiryDate: initialValues?.passportExpiryDate || "",
      passportFile: initialValues?.passportFile ?? null,
      statementOfResultFile: initialValues?.statementOfResultFile ?? null,
      firstDegreeCertificateFile: initialValues?.firstDegreeCertificateFile ?? null,
    },
    validate: zod4Resolver(uploadDocumentsSchema),
  });

  useEffect(() => {
    if (omitLoggedInUserKyc) return;
    const hasDraftNin =
      initialValues?.ninNumber != null && String(initialValues.ninNumber).trim() !== "";
    if (hasDraftNin || !kyc.defaultNin.trim()) return;
    if ((form.values.ninNumber ?? "").trim() !== "") return;
    form.setFieldValue("ninNumber", kyc.defaultNin);
  }, [kyc.defaultNin, initialValues?.ninNumber, form, omitLoggedInUserKyc]);

  useEffect(() => {
    const nextAdmissionType = initialValues?.admissionType?.trim();
    if (!nextAdmissionType) return;
    setAdmissionType(nextAdmissionType);
    if ((form.values.admissionType ?? "").trim() !== nextAdmissionType) {
      form.setFieldValue("admissionType", nextAdmissionType);
    }
  }, [initialValues?.admissionType, form]);

  const handleSubmit = form.onSubmit((values) => {
    onSubmit({
      ...values,
      admissionType: values.admissionType?.trim() || admissionType,
      studentName: form.values.studentName?.trim() ?? values.studentName,
      studentNinNumber: form.values.studentNinNumber ?? values.studentNinNumber,
      studentPassportDocumentNumber:
        form.values.studentPassportDocumentNumber?.trim() ?? values.studentPassportDocumentNumber,
      studentPassportIssueDate:
        form.values.studentPassportIssueDate ?? values.studentPassportIssueDate,
      studentPassportExpiryDate:
        form.values.studentPassportExpiryDate ?? values.studentPassportExpiryDate,
      studentPassportFile: form.values.studentPassportFile ?? values.studentPassportFile ?? null,
      passportDocumentNumber: form.values.passportDocumentNumber?.trim() ?? values.passportDocumentNumber,
      passportIssueDate: form.values.passportIssueDate ?? values.passportIssueDate,
      passportExpiryDate: form.values.passportExpiryDate ?? values.passportExpiryDate,
      passportFile: form.values.passportFile ?? values.passportFile ?? null,
      ninNumber: form.values.ninNumber ?? values.ninNumber,
    } as SchoolFeesUploadDocumentsFormData);
  });

  const isPostgraduate = admissionType === SCHOOL_FEES_ADMISSION_UI.POSTGRADUATE;
  const isUndergraduateStyle = requiresUndergraduateStyleDocuments(admissionType);
  const isOther = isOtherAdmissionType(admissionType);
  const showKycFields = Boolean(admissionType);

  const handleAdmissionTypeChange = (value: string | null) => {
    const selectedValue = value || "";
    setAdmissionType(selectedValue);
    form.setFieldValue("admissionType", selectedValue);

    if (requiresUndergraduateStyleDocuments(selectedValue)) {
      form.setFieldValue("statementOfResultFile", null);
      form.setFieldValue("firstDegreeCertificateFile", null);
    }
  };

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

      <TextInput
        label="Student Name"
        required
        size="md"
        placeholder="Enter student name"
        autoComplete="off"
        {...form.getInputProps("studentName")}
      />

      <TextInput
        label="Student NIN"
        required
        size="md"
        placeholder="Enter student NIN"
        maxLength={11}
        inputMode="numeric"
        autoComplete="off"
        {...form.getInputProps("studentNinNumber")}
        onChange={(e) => {
          const raw = e.currentTarget.value.replaceAll(/\D/g, "").slice(0, 11);
          e.currentTarget.value = raw;
          form.setFieldValue("studentNinNumber", raw);
        }}
        error={form.errors.studentNinNumber as string}
      />

      <SchoolFeesStudentPassportFields
        studentPassportDocumentNumber={form.values.studentPassportDocumentNumber || ""}
        studentPassportIssueDate={form.values.studentPassportIssueDate || ""}
        studentPassportExpiryDate={form.values.studentPassportExpiryDate || ""}
        onPassportNumberChange={(value) => {
          form.setFieldValue("studentPassportDocumentNumber", value);
          form.validateField("studentPassportDocumentNumber");
        }}
        onPassportIssueDateChange={(value) =>
          form.setFieldValue("studentPassportIssueDate", value)
        }
        onPassportExpiryDateChange={(value) =>
          form.setFieldValue("studentPassportExpiryDate", value)
        }
        passportNumberError={form.errors.studentPassportDocumentNumber as string}
        passportIssueDateError={form.errors.studentPassportIssueDate as string}
        passportExpiryDateError={form.errors.studentPassportExpiryDate as string}
      />

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
        data={SCHOOL_FEES_ADMISSION_OPTIONS}
        size="md"
        rightSection={<HugeiconsIcon icon={ChevronDown} size={20} className="text-text-300" />}
        value={admissionType}
        onChange={handleAdmissionTypeChange}
        error={form.errors.admissionType}
      />

      {showKycFields && (
        <SchoolFeesKycFields
          ninNumber={form.values.ninNumber || ""}
          passportDocumentNumber={form.values.passportDocumentNumber || ""}
          passportIssueDate={form.values.passportIssueDate || ""}
          passportExpiryDate={form.values.passportExpiryDate || ""}
          passportFile={form.values.passportFile ?? null}
          onNinChange={(value) => form.setFieldValue("ninNumber", value)}
          onPassportNumberChange={(value) => {
            form.setFieldValue("passportDocumentNumber", value);
            form.validateField("passportDocumentNumber");
          }}
          onPassportIssueDateChange={(value) => form.setFieldValue("passportIssueDate", value)}
          onPassportExpiryDateChange={(value) => form.setFieldValue("passportExpiryDate", value)}
          onPassportFileChange={(file) => form.setFieldValue("passportFile", file)}
          ninDisabled={ninLocked || forceNinLock}
          ninError={form.errors.ninNumber as string}
          passportNumberError={form.errors.passportDocumentNumber as string}
          passportIssueDateError={form.errors.passportIssueDate as string}
          passportExpiryDateError={form.errors.passportExpiryDate as string}
          passportFileError={form.errors.passportFile as string}
        />
      )}

      {isUndergraduateStyle && (
        <UndergraduateForm
          labels={isOther ? OTHER_ADMISSION_DOCUMENT_LABELS : undefined}
          evidenceOfAdmissionFile={form.values.evidenceOfAdmissionFile ?? null}
          schoolInvoiceFile={form.values.schoolInvoiceFile ?? null}
          studentPassportFile={form.values.studentPassportFile ?? null}
          onEvidenceOfAdmissionChange={(file) => form.setFieldValue("evidenceOfAdmissionFile", file)}
          onSchoolInvoiceChange={(file) => form.setFieldValue("schoolInvoiceFile", file)}
          onStudentPassportChange={(file) => form.setFieldValue("studentPassportFile", file)}
          evidenceOfAdmissionError={form.errors.evidenceOfAdmissionFile as string}
          schoolInvoiceError={form.errors.schoolInvoiceFile as string}
          studentPassportError={form.errors.studentPassportFile as string}
        />
      )}

      {isPostgraduate && (
        <PostgraduateForm
          evidenceOfAdmissionFile={form.values.evidenceOfAdmissionFile ?? null}
          schoolInvoiceFile={form.values.schoolInvoiceFile ?? null}
          statementOfResultFile={form.values.statementOfResultFile ?? null}
          firstDegreeCertificateFile={form.values.firstDegreeCertificateFile ?? null}
          studentPassportFile={form.values.studentPassportFile ?? null}
          onEvidenceOfAdmissionChange={(file) =>
            form.setFieldValue("evidenceOfAdmissionFile", file)
          }
          onSchoolInvoiceChange={(file) => form.setFieldValue("schoolInvoiceFile", file)}
          onStatementOfResultChange={(file) =>
            form.setFieldValue("statementOfResultFile", file)
          }
          onFirstDegreeCertificateChange={(file) =>
            form.setFieldValue("firstDegreeCertificateFile", file)
          }
          onStudentPassportChange={(file) => form.setFieldValue("studentPassportFile", file)}
          evidenceOfAdmissionError={form.errors.evidenceOfAdmissionFile as string}
          schoolInvoiceError={form.errors.schoolInvoiceFile as string}
          statementOfResultError={form.errors.statementOfResultFile as string}
          firstDegreeCertificateError={form.errors.firstDegreeCertificateFile as string}
          studentPassportError={form.errors.studentPassportFile as string}
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
