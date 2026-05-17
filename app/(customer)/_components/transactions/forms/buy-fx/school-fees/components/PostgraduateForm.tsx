"use client";

import { DateInput } from "@mantine/dates";
import { FileWithPath } from "@mantine/dropzone";
import { HugeiconsIcon } from "@hugeicons/react";
import { CalendarIcon } from "@hugeicons/core-free-icons";
import { formatDateToIso } from "@/app/(customer)/_utils/input-validation";
import TransactionFileUploadInput from "../../../../../forms/TransactionFileUploadInput";

interface PostgraduateFormProps {
  evidenceOfAdmissionFile: FileWithPath | null;
  schoolInvoiceFile: FileWithPath | null;
  statementOfResultFile: FileWithPath | null;
  firstDegreeCertificateFile: FileWithPath | null;
  passportFile: FileWithPath | null;
  passportIssueDate: string;
  passportExpiryDate: string;
  onEvidenceOfAdmissionChange: (file: FileWithPath | null) => void;
  onSchoolInvoiceChange: (file: FileWithPath | null) => void;
  onStatementOfResultChange: (file: FileWithPath | null) => void;
  onFirstDegreeCertificateChange: (file: FileWithPath | null) => void;
  onPassportChange: (file: FileWithPath | null) => void;
  onPassportIssueDateChange: (isoDate: string) => void;
  onPassportExpiryDateChange: (isoDate: string) => void;
  evidenceOfAdmissionError?: string;
  schoolInvoiceError?: string;
  statementOfResultError?: string;
  firstDegreeCertificateError?: string;
  passportError?: string;
  passportIssueDateError?: string;
  passportExpiryDateError?: string;
}

export default function PostgraduateForm({
  evidenceOfAdmissionFile,
  schoolInvoiceFile,
  statementOfResultFile,
  firstDegreeCertificateFile,
  passportFile,
  passportIssueDate,
  passportExpiryDate,
  onEvidenceOfAdmissionChange,
  onSchoolInvoiceChange,
  onStatementOfResultChange,
  onFirstDegreeCertificateChange,
  onPassportChange,
  onPassportIssueDateChange,
  onPassportExpiryDateChange,
  evidenceOfAdmissionError,
  schoolInvoiceError,
  statementOfResultError,
  firstDegreeCertificateError,
  passportError,
  passportIssueDateError,
  passportExpiryDateError,
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DateInput
          placeholder="Select"
          label="Passport Issued Date"
          rightSectionPointerEvents="all"
          required
          size="md"
          value={passportIssueDate?.trim() ? new Date(passportIssueDate) : null}
          onChange={(value) => {
            onPassportIssueDateChange(formatDateToIso(value));
          }}
          error={passportIssueDateError}
          rightSection={<HugeiconsIcon icon={CalendarIcon} size={20} className="text-text-300!" />}
        />
        <DateInput
          placeholder="Select"
          label="Passport Expiry Date"
          required
          rightSectionPointerEvents="all"
          minDate={new Date()}
          size="md"
          value={passportExpiryDate?.trim() ? new Date(passportExpiryDate) : null}
          onChange={(value) => {
            onPassportExpiryDateChange(formatDateToIso(value));
          }}
          error={passportExpiryDateError}
          rightSection={<HugeiconsIcon icon={CalendarIcon} size={20} className="text-text-300!" />}
        />
      </div>
    </>
  );
}
