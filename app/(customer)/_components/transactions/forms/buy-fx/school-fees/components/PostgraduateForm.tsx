"use client";

import { FileWithPath } from "@mantine/dropzone";
import TransactionFileUploadInput from "../../../../../forms/TransactionFileUploadInput";

interface PostgraduateFormProps {
  evidenceOfAdmissionFile: FileWithPath | null;
  schoolInvoiceFile: FileWithPath | null;
  statementOfResultFile: FileWithPath | null;
  firstDegreeCertificateFile: FileWithPath | null;
  passportFile: FileWithPath | null;
  onEvidenceOfAdmissionChange: (file: FileWithPath | null) => void;
  onSchoolInvoiceChange: (file: FileWithPath | null) => void;
  onStatementOfResultChange: (file: FileWithPath | null) => void;
  onFirstDegreeCertificateChange: (file: FileWithPath | null) => void;
  onPassportChange: (file: FileWithPath | null) => void;
  evidenceOfAdmissionError?: string;
  schoolInvoiceError?: string;
  statementOfResultError?: string;
  firstDegreeCertificateError?: string;
  passportError?: string;
}

export default function PostgraduateForm({
  evidenceOfAdmissionFile,
  schoolInvoiceFile,
  statementOfResultFile,
  firstDegreeCertificateFile,
  passportFile,
  onEvidenceOfAdmissionChange,
  onSchoolInvoiceChange,
  onStatementOfResultChange,
  onFirstDegreeCertificateChange,
  onPassportChange,
  evidenceOfAdmissionError,
  schoolInvoiceError,
  statementOfResultError,
  firstDegreeCertificateError,
  passportError,
}: Readonly<PostgraduateFormProps>) {
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
        label="First Degree Certificate"
        required
        value={firstDegreeCertificateFile}
        onChange={onFirstDegreeCertificateChange}
        error={firstDegreeCertificateError}
      />

      <TransactionFileUploadInput
        label="Statement of Result"
        required
        value={statementOfResultFile}
        onChange={onStatementOfResultChange}
        error={statementOfResultError}
      />

      <TransactionFileUploadInput
        label="Upload International Passport"
        required
        value={passportFile}
        onChange={onPassportChange}
        error={passportError}
      />
    </>
  );
}
