"use client";

import { useMemo, useState } from "react";
import { Button, Modal, Select, TextInput, Textarea } from "@mantine/core";
import type { FileWithPath } from "@mantine/dropzone";
import FileUploadInput from "@/app/(customer)/_components/forms/FileUploadInput";
import { agentApi } from "@/app/agent/_services/agent-api";
import { SuccessModal } from "@/app/(customer)/_components/modals/SuccessModal";
import { getAgentApiErrorMessage } from "@/app/agent/_utils/api-error-message";
import { ChevronDown } from "lucide-react";

interface AgentRecordDisbursementModalProps {
  opened: boolean;
  onClose: () => void;
  transactionId: string;
  referenceNumber: string;
  currencyCode: string;
  currencySymbol: string;
  foreignAmount: number;
  onSubmitted?: () => void;
}

export default function AgentRecordDisbursementModal({
  opened,
  onClose,
  transactionId,
  referenceNumber,
  currencyCode,
  currencySymbol,
  foreignAmount,
  onSubmitted,
}: Readonly<AgentRecordDisbursementModalProps>) {
  const [disbursementMethod, setDisbursementMethod] = useState<string>("BANK_TRANSFER");
  const [notes, setNotes] = useState("");
  const [receiptFile, setReceiptFile] = useState<FileWithPath | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const amountDisplay = useMemo(
    () =>
      Number(foreignAmount || 0).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [foreignAmount]
  );

  const resetAndClose = () => {
    setSuccess(false);
    setErrorMessage(null);
    setReceiptFile(null);
    setNotes("");
    setDisbursementMethod("BANK_TRANSFER");
    onClose();
  };

  const handleSubmit = async () => {
    if (!receiptFile) {
      setErrorMessage("Please upload payment receipt.");
      return;
    }
    if (receiptFile.size > 5 * 1024 * 1024) {
      setErrorMessage("Receipt must be 5MB or less.");
      return;
    }

    setErrorMessage(null);
    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("disbursementMethod", disbursementMethod);
      formData.append("totalAmount", String(foreignAmount));
      formData.append("notes", notes.trim());
      formData.append("paymentReceipt", receiptFile);
      await agentApi.transactions.recordDisbursement(transactionId, formData);
      onSubmitted?.();
      setSuccess(true);
    } catch (error) {
      setErrorMessage(getAgentApiErrorMessage(error, "Could not record disbursement."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
    <Modal
      opened={opened && !success}
      closeOnClickOutside={false}
      onClose={resetAndClose}
      centered
      withCloseButton={false}
      size="xl"
      radius={12}
      classNames={{ body: "p-0" }}
      styles={{ content: { width: "min(820px, calc(100vw - 24px))" } }}
    >
        <div className="px-4 sm:px-8 py-8 space-y-8">
          <div className="text-center">
            <h3 className="text-[#323131] text-3xl sm:text-2xl font-semibold">
              Record Disbursement
            </h3>
            <p className="text-[#6C6969] text-base mt-1">
              Record payment made to customer here
            </p>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Disbursement Method"
                required
                data={[
                  { value: "BANK_TRANSFER", label: "Bank Transfer" },
                  { value: "CASH_PICKUP", label: "Cash Pickup" },
                ]}
                value={disbursementMethod}
                onChange={(value) => setDisbursementMethod(value ?? "BANK_TRANSFER")}
                rightSection={<ChevronDown className="w-4 h-4" />}
                size="lg"
              />
              <TextInput
                label="Total Amount to Disburse"
                required
                value={`${amountDisplay} ${currencyCode}`}
                leftSection={<span className="font-semibold text-xl leading-7 text-[#1F1E1E]">{currencySymbol}</span>}
                readOnly
                disabled
                size="lg"
              />
            </div>

            <TextInput
              label="Transaction ID"
              required
              value={referenceNumber}
              readOnly
              size="lg"
              disabled
            />

            <FileUploadInput
              label="Upload Payment Receipt"
              required
              value={receiptFile}
              onChange={(file) => setReceiptFile(file)}
              placeholder="Drop files to upload"
            />

            <Textarea
              label="Add Notes (Optional)"
              value={notes}
              onChange={(e) => setNotes(e.currentTarget.value)}
              placeholder="Add optional notes about payment"
              autosize
              minRows={3}
            />

            {errorMessage ? (
              <p className="text-sm text-red-600">{errorMessage}</p>
            ) : null}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 sm:justify-center">
            <Button
              variant="outline"
              radius="xl"
              className="border-[#CCCACA] text-[#4D4B4B] h-12! sm:min-w-[180px]!"
              onClick={resetAndClose}
            >
              Back
            </Button>
            <Button
              radius="xl"
              className="bg-[#DD4F05] hover:bg-[#B84204] text-[#FFF6F1] h-12! sm:min-w-[220px]!"
              onClick={handleSubmit}
              loading={submitting}
            >
              Record disbursement
            </Button>
          </div>
        </div>
    </Modal>
    <SuccessModal
      opened={opened && success}
      onClose={resetAndClose}
      title="Disbursement Recorded Successfully"
      message="Disbursement has been recorded successfully. The details has been synced to your transaction logs."
      buttonText="View Transaction"
      onButtonClick={resetAndClose}
    />
    </>
  );
}

