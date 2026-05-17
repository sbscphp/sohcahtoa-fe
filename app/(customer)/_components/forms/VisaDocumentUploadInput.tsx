"use client";

import type { FileWithPath } from "@mantine/dropzone";
import TransactionFileUploadInput from "./TransactionFileUploadInput";

export interface VisaDocumentUploadInputProps {
  value: FileWithPath | null;
  onChange: (file: FileWithPath | null) => void;
  error?: string;
  required?: boolean;
}

/** Valid Visa — file upload only (no document number field). */
export default function VisaDocumentUploadInput({
  value,
  onChange,
  error,
  required = true,
}: Readonly<VisaDocumentUploadInputProps>) {
  return (
    <TransactionFileUploadInput
      label="Valid Visa"
      required={required}
      value={value}
      onChange={onChange}
      error={error}
    />
  );
}
