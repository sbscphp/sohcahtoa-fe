"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Button, Modal, Textarea } from "@mantine/core";
import { CircleAlert, Copy, X } from "lucide-react";
import type { FileWithPath } from "@mantine/dropzone";
import { useFetchSingleData } from "@/app/_lib/api/hooks";
import { agentKeys } from "@/app/_lib/api/query-keys";
import { agentApi } from "@/app/agent/_services/agent-api";
import { getAgentApiErrorMessage } from "@/app/agent/_utils/api-error-message";
import { getCurrencyFlagUrl } from "@/app/(customer)/_lib/currency";
import { getInstructionsText, getStringField } from "@/app/(customer)/_utils/transaction-payment";
import FileUploadInput from "@/app/(customer)/_components/forms/FileUploadInput";
import { SuccessModal } from "@/app/admin/_components/SuccessModal";

type PaymentMethod = "cash" | "bank_transfer";
type ModalStep = "cash" | "bank" | "receipt" | "success";

interface AgentProceedToPaymentModalProps {
  opened: boolean;
  onClose: () => void;
  transactionId: string;
  referenceNumber: string;
  amountNgn: number;
  /** Start directly on cash/bank step (skip method select). */
  initialMethod?: PaymentMethod;
  onSubmitted?: () => void;
}

function parseExpiryToSeconds(expiry: string | null): number {
  if (!expiry) return 30 * 60;
  const mmSsMatch = /^(\d{1,2}):(\d{2})$/.exec(expiry);
  if (mmSsMatch) return Math.max(Number(mmSsMatch[1]) * 60 + Number(mmSsMatch[2]), 0);
  const timestamp = new Date(expiry).getTime();
  if (!Number.isNaN(timestamp)) return Math.max(Math.floor((timestamp - Date.now()) / 1000), 0);
  return 30 * 60;
}

function formatCountdown(totalSeconds: number): string {
  const safe = Math.max(totalSeconds, 0);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function CountdownText({ initialSeconds, running }: Readonly<{ initialSeconds: number; running: boolean }>) {
  const [remaining, setRemaining] = useState(initialSeconds);
  useEffect(() => {
    if (!running || remaining <= 0) return;
    const timer = globalThis.setInterval(() => {
      setRemaining((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => globalThis.clearInterval(timer);
  }, [running, remaining]);
  return <>{formatCountdown(remaining)}</>;
}

export default function AgentProceedToPaymentModal({
  opened,
  onClose,
  transactionId,
  referenceNumber,
  amountNgn,
  initialMethod,
  onSubmitted,
}: Readonly<AgentProceedToPaymentModalProps>) {
  const [step, setStep] = useState<ModalStep>("cash");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("cash");
  const [notes, setNotes] = useState("");
  const [receiptFile, setReceiptFile] = useState<FileWithPath | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!opened) {
      setStep("cash");
      setNotes("");
      setReceiptFile(null);
      setErrorMessage(null);
      return;
    }
    const method = initialMethod ?? "cash";
    const nextStep: ModalStep = method === "cash" ? "cash" : "bank";
    setSelectedMethod(method);
    setStep(nextStep);
    setNotes("");
    setReceiptFile(null);
    setErrorMessage(null);
  }, [opened, initialMethod]);

  useEffect(() => {
    if (!opened || step !== "bank") return;
    agentApi.transactions.createVirtualAccount(transactionId).catch(() => null);
  }, [opened, step, transactionId]);

  const virtualAccountQuery = useFetchSingleData(
    agentKeys.transactions.virtualAccount(transactionId) as unknown as unknown[],
    () => agentApi.transactions.getVirtualAccount(transactionId),
    opened && step === "bank" && !!transactionId
  );
  const instructionsQuery = useFetchSingleData(
    agentKeys.transactions.depositInstructions(transactionId) as unknown as unknown[],
    () => agentApi.transactions.getDepositInstructions(transactionId),
    opened && step === "bank" && !!transactionId
  );
  const depositStatusQuery = useFetchSingleData(
    agentKeys.transactions.depositStatus(transactionId) as unknown as unknown[],
    () => agentApi.transactions.getDepositStatus(transactionId),
    opened && step === "bank" && !!transactionId
  );

  const accountData = virtualAccountQuery.data?.data;
  const accountNumber = getStringField(accountData, ["accountNumber", "number", "account_no"]) ?? "—";
  const bankName = getStringField(accountData, ["bankName", "bank"]) ?? "—";
  const accountName = getStringField(accountData, ["accountName", "name"]) ?? "—";
  const expiryFromStatus = getStringField(depositStatusQuery.data?.data, ["expiresAt", "expiryDate", "expiry"]);
  const expiryFromAccount = getStringField(accountData, ["expiresAt", "expiryDate", "expiry"]);
  const initialCountdownSeconds = useMemo(
    () => parseExpiryToSeconds(expiryFromStatus ?? expiryFromAccount ?? "30:00"),
    [expiryFromAccount, expiryFromStatus]
  );
  const instructionsText =
    getInstructionsText(instructionsQuery.data?.data) ??
    "Once approved, 75% of your funds will be sent to customer bank account or prepaid card, while the remaining 25% will be available for cash pickup.";
  const formattedAmount = useMemo(
    () =>
      Number(amountNgn || 0).toLocaleString("en-NG", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [amountNgn]
  );

  const flagUrl = getCurrencyFlagUrl("NGN");

  const submitReceipt = async () => {
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
      formData.append("method", "CASH_PICKUP");
      formData.append("amount", String(amountNgn));
      formData.append("notes", notes.trim());
      formData.append("paymentReceipt", receiptFile);
      await agentApi.transactions.recordPayment(transactionId, formData);
      onSubmitted?.();
      setStep("success");
    } catch (error) {
      setErrorMessage(
        getAgentApiErrorMessage(error, "Could not submit payment receipt.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const commonHeader = (title: string, subtitle: string) => (
    <div className="border-b border-[#E1E0E0] px-6 py-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[#323131] text-[30px] sm:text-[20px] font-bold leading-tight">{title}</h3>
          <p className="text-[#6C6969] text-lg mt-1">{subtitle}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-[#8F8B8B] hover:text-[#4D4B4B]"
          aria-label="Close"
        >
          <X className="w-7 h-7" />
        </button>
      </div>
    </div>
  );

  const cashOrBankBody = (
    <div className="px-6 py-4 max-h-[55vh] overflow-y-auto space-y-5">
      <div className="bg-[#F1F1F1] rounded-lg py-6 flex flex-col items-center gap-3">
        <div className="flex items-center gap-2 text-[#6C6969] text-sm font-medium">
          <span>{selectedMethod === "cash" ? "Collect" : "Send"}</span>
          {flagUrl && <Image src={flagUrl} alt="NGN" width={24} height={24} />}
          <span>NGN</span>
        </div>
        <div className="text-[#4D4B4B] text-5xl sm:text-4xl font-medium">{formattedAmount}</div>
      </div>
      {selectedMethod === "bank_transfer" && (
        <>
          <div className="divide-y divide-[#CCCACA] border-b border-[#CCCACA]">
            <div className="flex items-center justify-between py-3">
              <span className="text-[#8F8B8B]">Account Number</span>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(accountNumber).catch(() => null)}
                className="inline-flex items-center gap-2 text-[#131212]"
              >
                {accountNumber}
                <Copy className="w-4 h-4 text-[#8F8B8B]" />
              </button>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-[#8F8B8B]">Bank Name</span>
              <span className="text-[#131212]">{bankName}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-[#8F8B8B]">Account Name</span>
              <span className="text-[#131212]">{accountName}</span>
            </div>
          </div>
          <div className="text-center text-[#8F8B8B]">
            Account expires in{" "}
            <span className="text-[#323131] text-2xl font-bold">
              <CountdownText
                key={`${opened}-${expiryFromStatus ?? expiryFromAccount ?? "30:00"}`}
                initialSeconds={initialCountdownSeconds}
                running={opened}
              />
            </span>
          </div>
        </>
      )}
      <div className="rounded-lg border border-[#B2AFAF] p-3 flex gap-2">
        <CircleAlert className="w-5 h-5 text-[#DD4F05] mt-0.5 shrink-0" />
        <p className="text-[#6C6969] text-base">{instructionsText}</p>
      </div>
    </div>
  );

  const cashOrBankFooter = (
    <div className="px-6 py-5 border-t border-[#F2F4F7] flex flex-col sm:flex-row gap-4">
      <Button
        variant="outline"
        radius="xl"
        fullWidth
        className="border-[#CCCACA] text-[#4D4B4B] h-12!"
        onClick={onClose}
      >
        Cancel
      </Button>
      <Button
        radius="xl"
        fullWidth
        className="bg-[#DD4F05] hover:bg-[#B84204] text-[#FFF6F1] h-12!"
        onClick={() => {
          if (selectedMethod === "cash") {
            setStep("receipt");
            return;
          }
          onClose();
        }}
      >
        {selectedMethod === "cash" ? "I have collected the money" : "I have sent the money"}
      </Button>
    </div>
  );

  const receiptModal = (
    <div>
      {commonHeader("Transaction Receipt", "Please upload evidence of cash payment")}
      <div className="px-6 py-5 space-y-5">
        <p className="text-sm text-[#6C6969]">
          Reference: <span className="font-medium text-[#323131]">{referenceNumber}</span>
        </p>
        <p className="text-sm text-[#6C6969]">
          Amount (NGN): <span className="font-medium text-[#323131]">{formattedAmount}</span>
        </p>
        <Textarea
          label="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.currentTarget.value)}
          placeholder="Add note about this cash collection"
          autosize
          minRows={2}
        />
        <div>
          <FileUploadInput
            label="Upload Payment Receipt"
            required
            value={receiptFile}
            onChange={(file) => setReceiptFile(file)}
            placeholder="Drop files to upload"
          />
        </div>
        {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}
      </div>
      <div className="px-6 pb-6 pt-2 flex flex-col sm:flex-row gap-4">
        <Button
          variant="outline"
          radius="xl"
          fullWidth
          className="border-[#E88A58] text-[#DD4F05] h-12!"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          radius="xl"
          fullWidth
          className="bg-[#DD4F05] hover:bg-[#B84204] text-[#FFF6F1] h-12!"
          onClick={submitReceipt}
          loading={submitting}
        >
          Submit
        </Button>
      </div>
    </div>
  );

  const handlePaymentSuccessClose = () => {
    onClose();
  };

  const content = (() => {
    if (step === "receipt") return receiptModal;
    return (
      <div>
        {commonHeader(
          step === "cash" ? "Collect Cash" : "Pay To",
          step === "cash"
            ? "Collect cash equivalent from customer and confirm once payment is made"
            : "Pay to the account below and confirm once payment is made"
        )}
        {cashOrBankBody}
        {cashOrBankFooter}
      </div>
    );
  })();

  return (
    <>
      <Modal
        opened={opened && step !== "success"}
        onClose={onClose}
        centered
        withCloseButton={false}
        size="lg"
        radius={24}
        classNames={{ body: "p-0" }}
        styles={{ content: { width: "min(780px, calc(100vw - 24px))" } }}
      >
        {content}
      </Modal>
      <SuccessModal
        opened={opened && step === "success"}
        onClose={handlePaymentSuccessClose}
        title="Payment Successful"
        message="Your payment has been received and your funds will be released soon."
        primaryButtonText="View Transaction"
        onPrimaryClick={handlePaymentSuccessClose}
        secondaryButtonText="No, Close"
        onSecondaryClick={handlePaymentSuccessClose}
      />
    </>
  );
}

