"use client";

import { FileWithPath } from "@mantine/dropzone";
import TransactionFileUploadInput from "../../../../../forms/TransactionFileUploadInput";

export interface SchoolFeesCoreDocumentLabels {
  evidenceOfAdmission: string;
  schoolInvoice: string;
  studentPassport: string;
}

const DEFAULT_LABELS: SchoolFeesCoreDocumentLabels = {
  evidenceOfAdmission: "Evidence of Admission",
  schoolInvoice: "School Invoice",
  studentPassport: "Student International Passport (scan)",
};

export const OTHER_ADMISSION_DOCUMENT_LABELS: SchoolFeesCoreDocumentLabels = {
  evidenceOfAdmission: "Evidence of Enrollment",
  schoolInvoice: "School Invoice",
  studentPassport: "Student International Passport (scan)",
};

interface UndergraduateFormProps {
  evidenceOfAdmissionFile: FileWithPath | null;
  schoolInvoiceFile: FileWithPath | null;
  studentPassportFile: FileWithPath | null;
  onEvidenceOfAdmissionChange: (file: FileWithPath | null) => void;
  onSchoolInvoiceChange: (file: FileWithPath | null) => void;
  onStudentPassportChange: (file: FileWithPath | null) => void;
  evidenceOfAdmissionError?: string;
  schoolInvoiceError?: string;
  studentPassportError?: string;
  labels?: SchoolFeesCoreDocumentLabels;
}

export default function UndergraduateForm({
  evidenceOfAdmissionFile,
  schoolInvoiceFile,
  studentPassportFile,
  onEvidenceOfAdmissionChange,
  onSchoolInvoiceChange,
  onStudentPassportChange,
  evidenceOfAdmissionError,
  schoolInvoiceError,
  studentPassportError,
  labels = DEFAULT_LABELS,
}: Readonly<UndergraduateFormProps>) {
  return (
    <>
      <TransactionFileUploadInput
        label={labels.evidenceOfAdmission}
        required
        value={evidenceOfAdmissionFile}
        onChange={onEvidenceOfAdmissionChange}
        error={evidenceOfAdmissionError}
      />

      <TransactionFileUploadInput
        label={labels.schoolInvoice}
        required
        value={schoolInvoiceFile}
        onChange={onSchoolInvoiceChange}
        error={schoolInvoiceError}
      />

      <TransactionFileUploadInput
        label={labels.studentPassport}
        required
        value={studentPassportFile}
        onChange={onStudentPassportChange}
        error={studentPassportError}
      />
    </>
  );
}
