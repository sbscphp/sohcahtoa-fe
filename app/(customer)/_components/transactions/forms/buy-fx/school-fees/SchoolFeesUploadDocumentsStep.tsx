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
import { Alert, Button, Select, TextInput } from "@mantine/core";
import { FileWithPath } from "@mantine/dropzone";
import { useForm } from "@mantine/form";
import { Info } from "lucide-react";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { useEffect, useState } from "react";
import { z } from "zod";
import PostgraduateForm from "./components/PostgraduateForm";
import SchoolFeesKycFields from "./components/SchoolFeesKycFields";
import UndergraduateForm, {
  OTHER_ADMISSION_DOCUMENT_LABELS,
} from "./components/UndergraduateForm";

function addSchoolFeesKycIssues(
  data: {
    ninNumber?: string;
    passportDocumentNumber?: string;
    passportIssueDate?: string;
    passportExpiryDate?: string;
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
        "International Passport Number is required",
    });
  }

  const requireDate = (path: "passportIssueDate" | "passportExpiryDate", message: string) => {
    if (!(data[path] ?? "").toString().trim()) {
      ctx.addIssue({ code: "custom", path: [path], message });
    }
  };

  requireDate("passportIssueDate", "Passport Issued Date is required");
  requireDate("passportExpiryDate", "Passport Expiry Date is required");
  validatePassportDates(
    {
      passportIssueDate: (data.passportIssueDate ?? "").toString(),
      passportExpiryDate: (data.passportExpiryDate ?? "").toString(),
    },
    ctx
  );
}

function requireUndergraduateStyleFiles(
  data: z.infer<typeof uploadDocumentsBaseSchema>,
  ctx: z.RefinementCtx,
  options?: { enrollmentLabel?: string }
) {
  const enrollmentMessage =
    options?.enrollmentLabel ?? "Evidence of Admission is required";

  const requireFile = (
    path: "evidenceOfAdmissionFile" | "schoolInvoiceFile" | "passportFile",
    message: string
  ) => {
    const value = data[path] as FileWithPath | null | undefined;
    if (!value) {
      ctx.addIssue({ code: "custom", path: [path], message });
    }
  };

  requireFile("evidenceOfAdmissionFile", enrollmentMessage);
  requireFile("schoolInvoiceFile", "School Invoice is required");
  requireFile("passportFile", "International Passport file is required");
}

const uploadDocumentsBaseSchema = z.object({
  studentName: z.string().trim().min(1, "Student name is required"),
  admissionType: z.string().min(1, "Admission type is required"),
  formAId: formAIdSchema,
  evidenceOfAdmissionFile: z.custom<FileWithPath | null>().optional(),
  schoolInvoiceFile: z.custom<FileWithPath | null>().optional(),
  ninNumber: z.string().optional(),
  passportFile: z.custom<FileWithPath | null>().optional(),
  passportDocumentNumber: z.string().optional(),
  passportIssueDate: z.string().optional(),
  passportExpiryDate: z.string().optional(),
  statementOfResultFile: z.custom<FileWithPath | null>().optional(),
  firstDegreeCertificateFile: z.custom<FileWithPath | null>().optional(),
});

const uploadDocumentsSchema = uploadDocumentsBaseSchema.superRefine((data, ctx) => {
  const requireFile = (
    path: "evidenceOfAdmissionFile" | "schoolInvoiceFile" | "passportFile" | "statementOfResultFile" | "firstDegreeCertificateFile",
    message: string
  ) => {
    const value = data[path] as FileWithPath | null | undefined;
    if (!value) {
      ctx.addIssue({ code: "custom", path: [path], message });
    }
  };

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
    requireFile("passportFile", "International Passport file is required");
  }
});

export type SchoolFeesUploadDocumentsFormData = z.infer<typeof uploadDocumentsSchema>;

type SchoolFeesUploadDocumentsFormValues = z.infer<typeof uploadDocumentsBaseSchema>;

interface SchoolFeesUploadDocumentsStepProps {
  initialValues?: Partial<SchoolFeesUploadDocumentsFormValues>;
  onSubmit: (data: SchoolFeesUploadDocumentsFormData) => void;
  onBack?: () => void;
  lockKycPrefill?: boolean;
}

export default function SchoolFeesUploadDocumentsStep({
  initialValues,
  onSubmit,
  onBack,
  lockKycPrefill = false,
}: SchoolFeesUploadDocumentsStepProps) {
  const [admissionType, setAdmissionType] = useState<string>(initialValues?.admissionType || "");
  const kyc = useCustomerProfileBvnNin();
  const ninLocked = shouldLockKycPrefill(
    kyc.hasNinFromProfile,
    initialValues?.ninNumber,
    kyc.defaultNin
  );
  const forceNinLock = lockKycPrefill && Boolean(initialValues?.ninNumber?.trim());

  const form = useForm<SchoolFeesUploadDocumentsFormValues>({
    mode: "controlled",
    initialValues: {
      studentName: initialValues?.studentName || "",
      formAId: initialValues?.formAId || "",
      admissionType: initialValues?.admissionType || "",
      ninNumber: initialValues?.ninNumber || kyc.defaultNin || "",
      evidenceOfAdmissionFile: initialValues?.evidenceOfAdmissionFile ?? null,
      schoolInvoiceFile: initialValues?.schoolInvoiceFile ?? null,
      passportFile: initialValues?.passportFile ?? null,
      passportDocumentNumber: initialValues?.passportDocumentNumber || "",
      passportIssueDate: initialValues?.passportIssueDate || "",
      passportExpiryDate: initialValues?.passportExpiryDate || "",
      statementOfResultFile: initialValues?.statementOfResultFile ?? null,
      firstDegreeCertificateFile: initialValues?.firstDegreeCertificateFile ?? null,
    },
    validate: zod4Resolver(uploadDocumentsSchema),
  });

  useEffect(() => {
    const hasDraftNin =
      initialValues?.ninNumber != null && String(initialValues.ninNumber).trim() !== "";
    if (hasDraftNin || !kyc.defaultNin.trim()) return;
    if ((form.values.ninNumber ?? "").trim() !== "") return;
    form.setFieldValue("ninNumber", kyc.defaultNin);
  }, [kyc.defaultNin, initialValues?.ninNumber, form]);

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

      <Alert icon={<Info size={14} />} title="" className="bg-white! border-gray-300!">
        <p className="text-body-text-200">
          Please note the maximum you can transact is <strong>$10,000 per year</strong>.
        </p>
      </Alert>

      <TextInput
        label="Student Name"
        required
        size="md"
        placeholder="Enter student name"
        autoComplete="off"
        {...form.getInputProps("studentName")}
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
          onNinChange={(value) => form.setFieldValue("ninNumber", value)}
          onPassportNumberChange={(value) => {
            form.setFieldValue("passportDocumentNumber", value);
            form.validateField("passportDocumentNumber");
          }}
          onPassportIssueDateChange={(value) => form.setFieldValue("passportIssueDate", value)}
          onPassportExpiryDateChange={(value) => form.setFieldValue("passportExpiryDate", value)}
          ninDisabled={ninLocked || forceNinLock}
          ninError={form.errors.ninNumber as string}
          passportNumberError={form.errors.passportDocumentNumber as string}
          passportIssueDateError={form.errors.passportIssueDate as string}
          passportExpiryDateError={form.errors.passportExpiryDate as string}
        />
      )}

      {isUndergraduateStyle && (
        <UndergraduateForm
          labels={isOther ? OTHER_ADMISSION_DOCUMENT_LABELS : undefined}
          evidenceOfAdmissionFile={form.values.evidenceOfAdmissionFile ?? null}
          schoolInvoiceFile={form.values.schoolInvoiceFile ?? null}
          passportFile={form.values.passportFile ?? null}
          onEvidenceOfAdmissionChange={(file) => form.setFieldValue("evidenceOfAdmissionFile", file)}
          onSchoolInvoiceChange={(file) => form.setFieldValue("schoolInvoiceFile", file)}
          onPassportChange={(file) => form.setFieldValue("passportFile", file)}
          evidenceOfAdmissionError={form.errors.evidenceOfAdmissionFile as string}
          schoolInvoiceError={form.errors.schoolInvoiceFile as string}
          passportError={form.errors.passportFile as string}
        />
      )}

      {isPostgraduate && (
        <PostgraduateForm
          evidenceOfAdmissionFile={form.values.evidenceOfAdmissionFile ?? null}
          schoolInvoiceFile={form.values.schoolInvoiceFile ?? null}
          statementOfResultFile={form.values.statementOfResultFile ?? null}
          firstDegreeCertificateFile={form.values.firstDegreeCertificateFile ?? null}
          passportFile={form.values.passportFile ?? null}
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
          onPassportChange={(file) => form.setFieldValue("passportFile", file)}
          evidenceOfAdmissionError={form.errors.evidenceOfAdmissionFile as string}
          schoolInvoiceError={form.errors.schoolInvoiceFile as string}
          statementOfResultError={form.errors.statementOfResultFile as string}
          firstDegreeCertificateError={form.errors.firstDegreeCertificateFile as string}
          passportError={form.errors.passportFile as string}
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
