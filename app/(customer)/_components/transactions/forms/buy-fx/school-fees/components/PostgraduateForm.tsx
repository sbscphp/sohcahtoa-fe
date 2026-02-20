"use client";

import { TextInput } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { FileWithPath } from "@mantine/dropzone";
import { HugeiconsIcon } from "@hugeicons/react";
import { CalendarIcon } from "@hugeicons/core-free-icons";
import TransactionFileUploadInput from '../../../../../forms/TransactionFileUploadInput';

interface PostgraduateFormProps {
  passportFile: FileWithPath | null;
  passportIssueDate: string;
  passportExpiryDate: string;
  statementOfResultFile: FileWithPath | null;
  statementOfResultsNumber: string;
  schoolInvoiceFile: FileWithPath | null;
  schoolInvoiceNumber: string;
  firstDegreeCertificateFile: FileWithPath | null;
  onPassportChange: (file: FileWithPath | null) => void;
  onPassportIssueDateChange: (value: string) => void;
  onPassportExpiryDateChange: (value: string) => void;
  onStatementOfResultChange: (file: FileWithPath | null) => void;
  onStatementOfResultsNumberChange: (value: string) => void;
  onSchoolInvoiceChange: (file: FileWithPath | null) => void;
  onSchoolInvoiceNumberChange: (value: string) => void;
  onFirstDegreeCertificateChange: (file: FileWithPath | null) => void;
  passportError?: string;
  passportIssueDateError?: string;
  passportExpiryDateError?: string;
  statementOfResultError?: string;
  statementOfResultsNumberError?: string;
  schoolInvoiceError?: string;
  schoolInvoiceNumberError?: string;
  firstDegreeCertificateError?: string;
}

export default function PostgraduateForm({
  passportFile,
  passportIssueDate,
  passportExpiryDate,
  statementOfResultFile,
  statementOfResultsNumber,
  schoolInvoiceFile,
  schoolInvoiceNumber,
  firstDegreeCertificateFile,
  onPassportChange,
  onPassportIssueDateChange,
  onPassportExpiryDateChange,
  onStatementOfResultChange,
  onStatementOfResultsNumberChange,
  onSchoolInvoiceChange,
  onSchoolInvoiceNumberChange,
  onFirstDegreeCertificateChange,
  passportError,
  passportIssueDateError,
  passportExpiryDateError,
  statementOfResultError,
  statementOfResultsNumberError,
  schoolInvoiceError,
  schoolInvoiceNumberError,
  firstDegreeCertificateError,
}: PostgraduateFormProps) {
  return (
    <>
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
          required
          size="md"
          value={passportIssueDate && passportIssueDate.trim() ? new Date(passportIssueDate) : null}
          onChange={(value: string | null) => {
            if (value === null) {
              onPassportIssueDateChange("");
            } else {
              const date = new Date(value);
              onPassportIssueDateChange(date.toISOString().split('T')[0]);
            }
          }}
          error={passportIssueDateError}
          rightSection={<HugeiconsIcon icon={CalendarIcon} size={20} className="text-text-300!" />}
        />
        <DateInput
          placeholder="Select"
          label="Passport Expiry Date"
          required
          size="md"
          value={passportExpiryDate && passportExpiryDate.trim() ? new Date(passportExpiryDate) : null}
          onChange={(value: string | null) => {
            if (value === null) {
              onPassportExpiryDateChange("");
            } else {
              const date = typeof value === 'string' ? new Date(value) : value;
              onPassportExpiryDateChange(date instanceof Date ? date.toISOString().split('T')[0] : value);
            }
          }}
          error={passportExpiryDateError}
          rightSection={<HugeiconsIcon icon={CalendarIcon} size={20} className="text-text-300!" />}
        />
      </div>

      <TransactionFileUploadInput
        label="Statement of Result"
        required
        value={statementOfResultFile}
        onChange={onStatementOfResultChange}
        error={statementOfResultError}
      />

      <TextInput
        label="Statement of Results Number"
        required
        size="md"
        placeholder="Enter Number"
        maxLength={50}
        autoComplete="off"
        value={statementOfResultsNumber}
        onChange={(e) => onStatementOfResultsNumberChange(e.target.value)}
        error={statementOfResultsNumberError}
      />

      <TransactionFileUploadInput
        label="School Invoice"
        required
        value={schoolInvoiceFile}
        onChange={onSchoolInvoiceChange}
        error={schoolInvoiceError}
      />

      <TextInput
        label="School Invoice Number"
        required
        size="md"
        placeholder="Enter Number"
        maxLength={50}
        autoComplete="off"
        value={schoolInvoiceNumber}
        onChange={(e) => onSchoolInvoiceNumberChange(e.target.value)}
        error={schoolInvoiceNumberError}
      />

      <TransactionFileUploadInput
        label="First Degree Certificate"
        required
        value={firstDegreeCertificateFile}
        onChange={onFirstDegreeCertificateChange}
        error={firstDegreeCertificateError}
      />
    </>
  );
}
