"use client";

import { FileWithPath } from "@mantine/dropzone";
import TransactionFileUploadInput from "../../../../../forms/TransactionFileUploadInput";

interface PostgraduateFormProps {
  evidenceOfAdmissionFile: FileWithPath | null;
  schoolInvoiceFile: FileWithPath | null;
  statementOfResultFile: FileWithPath | null;
  firstDegreeCertificateFile: FileWithPath | null;
  studentPassportFile: FileWithPath | null;
  onEvidenceOfAdmissionChange: (file: FileWithPath | null) => void;
  onSchoolInvoiceChange: (file: FileWithPath | null) => void;
  onStatementOfResultChange: (file: FileWithPath | null) => void;
  onFirstDegreeCertificateChange: (file: FileWithPath | null) => void;
  onStudentPassportChange: (file: FileWithPath | null) => void;
  evidenceOfAdmissionError?: string;
  schoolInvoiceError?: string;
  statementOfResultError?: string;
  firstDegreeCertificateError?: string;
  studentPassportError?: string;
}

export default function PostgraduateForm({
  evidenceOfAdmissionFile,
  schoolInvoiceFile,
  statementOfResultFile,
  firstDegreeCertificateFile,
  studentPassportFile,
  onEvidenceOfAdmissionChange,
  onSchoolInvoiceChange,
  onStatementOfResultChange,
  onFirstDegreeCertificateChange,
  onStudentPassportChange,
  evidenceOfAdmissionError,
  schoolInvoiceError,
  statementOfResultError,
  firstDegreeCertificateError,
  studentPassportError,
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
        label="Student International Passport (scan)"
        required
        value={studentPassportFile}
        onChange={onStudentPassportChange}
        error={studentPassportError}
      />
    </>
  );
}
