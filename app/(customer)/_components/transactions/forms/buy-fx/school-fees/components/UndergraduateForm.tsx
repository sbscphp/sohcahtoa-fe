"use client";

import { FileWithPath } from "@mantine/dropzone";
import TransactionFileUploadInput from "../../../../../forms/TransactionFileUploadInput";

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
}: Readonly<UndergraduateFormProps>) {
  return (
    <>
      <TransactionFileUploadInput
        label="Evidence of Admission"
        required
        value={evidenceOfAdmissionFile}
        onChange={onEvidenceOfAdmissionChange}
        error={evidenceOfAdmissionError}
      />

      <TransactionFileUploadInput
        label="School Invoice"
        required
        value={schoolInvoiceFile}
        onChange={onSchoolInvoiceChange}
        error={schoolInvoiceError}
      />

      <TransactionFileUploadInput
        label="International Passport"
        required
        value={passportFile}
        onChange={onPassportChange}
        error={passportError}
      />
    </>
  );
}
