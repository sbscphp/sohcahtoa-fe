"use client";

import { Textarea } from "@mantine/core";
import { FileWithPath } from "@mantine/dropzone";
import TransactionFileUploadInput from '../../../../../forms/TransactionFileUploadInput';

interface OtherFormProps {
  transactionFile: FileWithPath | null;
  transactionDescription: string;
  onTransactionFileChange: (file: FileWithPath | null) => void;
  onTransactionDescriptionChange: (value: string) => void;
  transactionFileError?: string;
  transactionDescriptionError?: string;
}

export default function OtherForm({
  transactionFile,
  transactionDescription,
  onTransactionFileChange,
  onTransactionDescriptionChange,
  transactionFileError,
  transactionDescriptionError,
}: OtherFormProps) {
  return (
    <>
      <TransactionFileUploadInput
        label="Transaction Document"
        required
        value={transactionFile}
        onChange={onTransactionFileChange}
        error={transactionFileError}
      />

      <Textarea
        label="Transaction Description"
        required
        size="md"
        placeholder="Enter description"
        minRows={4}
        value={transactionDescription}
        onChange={(e) => onTransactionDescriptionChange(e.target.value)}
        error={transactionDescriptionError}
      />
    </>
  );
}
