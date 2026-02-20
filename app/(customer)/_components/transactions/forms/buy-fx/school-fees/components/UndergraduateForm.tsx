"use client";

import { TextInput } from "@mantine/core";
import { FileWithPath } from "@mantine/dropzone";
import TransactionFileUploadInput from '../../../../../forms/TransactionFileUploadInput';

interface UndergraduateFormProps {
  evidenceOfAdmissionFile: FileWithPath | null;
  schoolInvoiceFile: FileWithPath | null;
  schoolInvoiceNumber: string;
  passportFile: FileWithPath | null;
  passportDocumentNumber: string;
  onEvidenceOfAdmissionChange: (file: FileWithPath | null) => void;
  onSchoolInvoiceChange: (file: FileWithPath | null) => void;
  onSchoolInvoiceNumberChange: (value: string) => void;
  onPassportChange: (file: FileWithPath | null) => void;
  onPassportNumberChange: (value: string) => void;
  evidenceOfAdmissionError?: string;
  schoolInvoiceError?: string;
  schoolInvoiceNumberError?: string;
  passportError?: string;
  passportNumberError?: string;
}

export default function UndergraduateForm({
  evidenceOfAdmissionFile,
  schoolInvoiceFile,
  schoolInvoiceNumber,
  passportFile,
  passportDocumentNumber,
  onEvidenceOfAdmissionChange,
  onSchoolInvoiceChange,
  onSchoolInvoiceNumberChange,
  onPassportChange,
  onPassportNumberChange,
  evidenceOfAdmissionError,
  schoolInvoiceError,
  schoolInvoiceNumberError,
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
        placeholder="Enter Number"
        maxLength={50}
        autoComplete="off"
        value={passportDocumentNumber}
        onChange={(e) => onPassportNumberChange(e.target.value)}
        error={passportNumberError}
      />
    </>
  );
}
