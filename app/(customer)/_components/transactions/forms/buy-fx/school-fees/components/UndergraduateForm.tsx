"use client";

import { TextInput } from "@mantine/core";
import { FileWithPath } from "@mantine/dropzone";
import TransactionFileUploadInput from '../../../../../forms/TransactionFileUploadInput';

interface UndergraduateFormProps {
  evidenceOfAdmissionFile: FileWithPath | null;
  schoolInvoiceFile: FileWithPath | null;
  passportFile: FileWithPath | null;
  passportDocumentNumber: string;
  onEvidenceOfAdmissionChange: (file: FileWithPath | null) => void;
  onSchoolInvoiceChange: (file: FileWithPath | null) => void;
  onPassportChange: (file: FileWithPath | null) => void;
  onPassportNumberChange: (value: string) => void;
  evidenceOfAdmissionError?: string;
  schoolInvoiceError?: string;
  passportError?: string;
  passportNumberError?: string;
}

export default function UndergraduateForm({
  evidenceOfAdmissionFile,
  schoolInvoiceFile,
  passportFile,
  passportDocumentNumber,
  onEvidenceOfAdmissionChange,
  onSchoolInvoiceChange,
  onPassportChange,
  onPassportNumberChange,
  evidenceOfAdmissionError,
  schoolInvoiceError,
  passportError,
  passportNumberError,
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
    </>
  );
}
