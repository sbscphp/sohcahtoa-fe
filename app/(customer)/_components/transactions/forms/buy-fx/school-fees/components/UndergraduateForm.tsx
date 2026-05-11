"use client";

import { TextInput } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { FileWithPath } from "@mantine/dropzone";
import { HugeiconsIcon } from "@hugeicons/react";
import { CalendarIcon } from "@hugeicons/core-free-icons";
import { formatDateToIso } from "@/app/(customer)/_utils/input-validation";
import TransactionFileUploadInput from "../../../../../forms/TransactionFileUploadInput";

interface UndergraduateFormProps {
  evidenceOfAdmissionFile: FileWithPath | null;
  schoolInvoiceFile: FileWithPath | null;
  passportFile: FileWithPath | null;
  passportDocumentNumber: string;
  passportIssueDate: string;
  passportExpiryDate: string;
  onEvidenceOfAdmissionChange: (file: FileWithPath | null) => void;
  onSchoolInvoiceChange: (file: FileWithPath | null) => void;
  onPassportChange: (file: FileWithPath | null) => void;
  onPassportNumberChange: (value: string) => void;
  onPassportIssueDateChange: (isoDate: string) => void;
  onPassportExpiryDateChange: (isoDate: string) => void;
  evidenceOfAdmissionError?: string;
  schoolInvoiceError?: string;
  passportError?: string;
  passportNumberError?: string;
  passportIssueDateError?: string;
  passportExpiryDateError?: string;
}

export default function UndergraduateForm({
  evidenceOfAdmissionFile,
  schoolInvoiceFile,
  passportFile,
  passportDocumentNumber,
  passportIssueDate,
  passportExpiryDate,
  onEvidenceOfAdmissionChange,
  onSchoolInvoiceChange,
  onPassportChange,
  onPassportNumberChange,
  onPassportIssueDateChange,
  onPassportExpiryDateChange,
  evidenceOfAdmissionError,
  schoolInvoiceError,
  passportError,
  passportNumberError,
  passportIssueDateError,
  passportExpiryDateError,
}: UndergraduateFormProps) {
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

      <TextInput
        label="International Passport Number"
        required
        size="md"
        placeholder="Up to 9 letters and numbers (e.g. A12345678)"
        maxLength={9}
        autoComplete="off"
        value={passportDocumentNumber}
        onChange={(e) => onPassportNumberChange(e.target.value)}
        error={passportNumberError}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DateInput
          placeholder="Select"
          label="Passport Issued Date"
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
          size="md"
          minDate={new Date()}
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
