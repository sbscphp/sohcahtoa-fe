"use client";

import { FileWithPath } from "@mantine/dropzone";
import TransactionFileUploadInput from "../../../../../forms/TransactionFileUploadInput";

export interface SchoolFeesCoreDocumentLabels {
  evidenceOfAdmission: string;
  schoolInvoice: string;
  passport: string;
}

const DEFAULT_LABELS: SchoolFeesCoreDocumentLabels = {
  evidenceOfAdmission: "Evidence of Admission",
  schoolInvoice: "School Invoice",
  passport: "International Passport",
};

export const OTHER_ADMISSION_DOCUMENT_LABELS: SchoolFeesCoreDocumentLabels = {
  evidenceOfAdmission: "Evidence of Enrollment",
  schoolInvoice: "School Invoice",
  passport: "International Passport",
};

interface UndergraduateFormProps {
  evidenceOfAdmissionFile: FileWithPath | null;
  schoolInvoiceFile: FileWithPath | null;
  passportFile: FileWithPath | null;
  onEvidenceOfAdmissionChange: (file: FileWithPath | null) => void;
  onSchoolInvoiceChange: (file: FileWithPath | null) => void;
  onPassportChange: (file: FileWithPath | null) => void;
  evidenceOfAdmissionError?: string;
  schoolInvoiceError?: string;
  passportError?: string;
  labels?: SchoolFeesCoreDocumentLabels;
}

export default function UndergraduateForm({
  evidenceOfAdmissionFile,
  schoolInvoiceFile,
  passportFile,
  onEvidenceOfAdmissionChange,
  onSchoolInvoiceChange,
  onPassportChange,
  evidenceOfAdmissionError,
  schoolInvoiceError,
  passportError,
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
        label={labels.passport}
        required
        value={passportFile}
        onChange={onPassportChange}
        error={passportError}
      />
    </>
  );
}
