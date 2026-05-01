"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Button, Modal, Textarea } from "@mantine/core";
import { useQueryClient } from "@tanstack/react-query";
import { CircleAlert, X } from "lucide-react";
import type { FileWithPath } from "@mantine/dropzone";
import { useFetchSingleData } from "@/app/_lib/api/hooks";
import { agentKeys } from "@/app/_lib/api/query-keys";
import { agentApi } from "@/app/agent/_services/agent-api";
import { getAgentApiErrorMessage } from "@/app/agent/_utils/api-error-message";
import { getCurrencyFlagUrl } from "@/app/(customer)/_lib/currency";
import {
  getInstructionsText,
  getStringField,
  getVirtualAccountRemainingSeconds,
} from "@/app/(customer)/_utils/transaction-payment";
import FileUploadInput from "@/app/(customer)/_components/forms/FileUploadInput";
import { AgentDepositConfirmingModal } from "@/app/agent/_components/transactions/details/AgentDepositConfirmingModal";
import { AgentVirtualAccountBankPaymentSection } from "@/app/agent/_components/transactions/details/AgentVirtualAccountBankPaymentSection";
import { useAgentDepositConfirmationPoll } from "@/app/agent/_components/transactions/details/useAgentDepositConfirmationPoll";
import { getVirtualAccountBankStepUiState } from "@/app/agent/_utils/virtualAccountBankStepUi";
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

/** `useFetchSingleData` is typed for `unknown[]`; query-key factories return readonly tuples. */
function asQueryKey(key: readonly unknown[]): unknown[] {
  return key as unknown[];
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
  const queryClient = useQueryClient();
  const [step, setStep] = useState<ModalStep>("cash");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("cash");
  const [notes, setNotes] = useState("");
  const [receiptFile, setReceiptFile] = useState<FileWithPath | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generatingVa, setGeneratingVa] = useState(false);
  const [vaError, setVaError] = useState<string | null>(null);
  const [liveRemainingSec, setLiveRemainingSec] = useState(0);
  const [confirmingBankPayment, setConfirmingBankPayment] = useState(false);
  const bankPollStartedAtRef = useRef<number | null>(null);

  const bankQueriesEnabled = opened && step === "bank" && !!transactionId;

  useEffect(() => {
    if (!opened) {
      setStep("cash");
      setNotes("");
      setReceiptFile(null);
      setErrorMessage(null);
      setGeneratingVa(false);
      setVaError(null);
      setLiveRemainingSec(0);
      setConfirmingBankPayment(false);
      bankPollStartedAtRef.current = null;
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

  const virtualAccountQuery = useFetchSingleData(
    asQueryKey(agentKeys.transactions.virtualAccount(transactionId)),
    () => agentApi.transactions.getVirtualAccount(transactionId),
    bankQueriesEnabled
  );
  const instructionsQuery = useFetchSingleData(
    asQueryKey(agentKeys.transactions.depositInstructions(transactionId)),
    () => agentApi.transactions.getDepositInstructions(transactionId),
    bankQueriesEnabled
  );
  const depositStatusQuery = useFetchSingleData(
    asQueryKey(agentKeys.transactions.depositStatus(transactionId)),
    () => agentApi.transactions.getDepositStatus(transactionId),
    bankQueriesEnabled && !confirmingBankPayment
  );

  const accountData = virtualAccountQuery.data?.data;
  const expiryFromAccount = getStringField(accountData, [
    "expiresAt",
    "expiryDate",
    "expiry",
  ]);
  const expiryFromStatus = getStringField(depositStatusQuery.data?.data, [
    "expiresAt",
    "expiryDate",
    "expiry",
  ]);
  const fallbackExpiryForCountdown = expiryFromAccount ? null : (expiryFromStatus ?? "30:00");
  const remainingSnapshot = useMemo(
    () => getVirtualAccountRemainingSeconds(accountData, fallbackExpiryForCountdown),
    [accountData, fallbackExpiryForCountdown]
  );

  const bankUi = useMemo(
    () =>
      getVirtualAccountBankStepUiState({
        isBankTransfer: selectedMethod === "bank_transfer",
        va: {
          isPending: virtualAccountQuery.isPending,
          isError: virtualAccountQuery.isError,
          error: virtualAccountQuery.error,
          accountData,
        },
        liveRemainingSec,
      }),
    [
      selectedMethod,
      virtualAccountQuery.isPending,
      virtualAccountQuery.isError,
      virtualAccountQuery.error,
      accountData,
      liveRemainingSec,
    ]
  );

  const handleBankDepositVerified = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: [...agentKeys.transactions.detail(transactionId)],
    });
    await queryClient.invalidateQueries({
      queryKey: [...agentKeys.transactions.depositStatus(transactionId)],
    });
    setConfirmingBankPayment(false);
    onSubmitted?.();
    onClose();
  }, [queryClient, transactionId, onClose, onSubmitted]);

  const { confirmTimedOut: bankConfirmTimedOut, setConfirmTimedOut: setBankConfirmTimedOut } =
    useAgentDepositConfirmationPoll({
      transactionId,
      opened: opened && selectedMethod === "bank_transfer" && step === "bank",
      confirmingPayment: confirmingBankPayment,
      pollStartedAtRef: bankPollStartedAtRef,
      fetchDepositStatus: (id) => agentApi.transactions.getDepositStatus(id),
      onVerified: handleBankDepositVerified,
    });

  useEffect(() => {
    if (!opened) setBankConfirmTimedOut(false);
  }, [opened, setBankConfirmTimedOut]);

  const bankLoadErrorMessage = useMemo(() => {
    if (!bankUi.fatalLoadError) return null;
    return getAgentApiErrorMessage(
      virtualAccountQuery.error,
      "Could not load virtual account."
    );
  }, [bankUi.fatalLoadError, virtualAccountQuery.error]);

  const accountNumber = getStringField(accountData, ["accountNumber"]) ?? "—";
  const bankName = getStringField(accountData, ["bankName"]) ?? "—";
  const accountName = getStringField(accountData, ["accountName"]) ?? "—";
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

  useEffect(() => {
    if (!opened || step !== "bank" || selectedMethod !== "bank_transfer") return;
    setLiveRemainingSec(remainingSnapshot);
  }, [opened, step, selectedMethod, remainingSnapshot]);

  const handleGenerateAccount = useCallback(async () => {
    setVaError(null);
    try {
      setGeneratingVa(true);
      await agentApi.transactions.createVirtualAccount(transactionId);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [...agentKeys.transactions.virtualAccount(transactionId)],
        }),
        queryClient.invalidateQueries({
          queryKey: [...agentKeys.transactions.depositInstructions(transactionId)],
        }),
        queryClient.invalidateQueries({
          queryKey: [...agentKeys.transactions.depositStatus(transactionId)],
        }),
      ]);
    } catch (e) {
      setVaError(getAgentApiErrorMessage(e, "Could not generate a new account."));
    } finally {
      setGeneratingVa(false);
    }
  }, [queryClient, transactionId]);

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
      setErrorMessage(getAgentApiErrorMessage(error, "Could not submit payment receipt."));
    } finally {
      setSubmitting(false);
    }
  };

  const dismissAgentPaymentFlow = useCallback(() => {
    setConfirmingBankPayment(false);
    setBankConfirmTimedOut(false);
    bankPollStartedAtRef.current = null;
    onClose();
  }, [onClose, setBankConfirmTimedOut]);

  const commonHeader = (title: string, subtitle: string) => (
    <div className="border-b border-[#E1E0E0] px-4 py-4 sm:px-6 sm:py-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 pr-1">
          <h3 className="text-[#323131] text-xl font-bold leading-tight sm:text-2xl">{title}</h3>
          <p className="text-[#6C6969] mt-1 text-sm leading-snug sm:text-base">{subtitle}</p>
        </div>
        <button
          type="button"
          onClick={dismissAgentPaymentFlow}
          className="shrink-0 text-[#8F8B8B] hover:text-[#4D4B4B]"
          aria-label="Close"
        >
          <X className="h-6 w-6 sm:h-7 sm:w-7" />
        </button>
      </div>
    </div>
  );

  const showInstructionsCallout = selectedMethod === "cash" || bankUi.activeVa;

  const cashOrBankBody = (
    <div className="max-h-[55vh] space-y-5 overflow-y-auto overflow-x-hidden px-4 py-4 sm:px-6">
      <div className="flex w-full max-w-full flex-col items-center gap-2 rounded-lg bg-[#F1F1F1] px-3 py-5 sm:gap-3 sm:py-6">
        <div className="flex items-center gap-2 text-sm font-medium text-[#6C6969]">
          <span>{selectedMethod === "cash" ? "Collect" : "Send"}</span>
          {flagUrl && <Image src={flagUrl} alt="NGN" width={24} height={24} className="shrink-0" />}
          <span>NGN</span>
        </div>
        <div className="w-full max-w-full px-1 text-center text-2xl font-medium leading-tight text-[#4D4B4B] tabular-nums break-all sm:text-3xl md:text-4xl">
          {formattedAmount}
        </div>
      </div>

      {selectedMethod === "bank_transfer" ? (
        <AgentVirtualAccountBankPaymentSection
          ui={bankUi}
          accountNumber={accountNumber}
          bankName={bankName}
          accountName={accountName}
          expiryFromAccount={expiryFromAccount}
          fallbackExpiryForCountdown={fallbackExpiryForCountdown}
          countdownActive={
            opened && step === "bank" && bankUi.activeVa && !confirmingBankPayment
          }
          vaError={vaError}
          loadErrorMessage={bankLoadErrorMessage}
          onRemainingSecChange={setLiveRemainingSec}
          onSoonBannerGenerate={() => {
            void handleGenerateAccount();
          }}
          soonBannerGenerateLoading={generatingVa}
        />
      ) : null}

      {showInstructionsCallout ? (
        <div className="flex gap-2 rounded-lg border border-[#B2AFAF] p-3">
          <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-[#DD4F05]" />
          <p className="min-w-0 text-sm leading-snug text-[#6C6969] sm:text-base">{instructionsText}</p>
        </div>
      ) : null}
    </div>
  );

  const showBankFooterPrimary = selectedMethod === "cash" || !bankUi.fatalLoadError;

  let footerPrimaryLabel = "I have sent the money";
  if (selectedMethod === "cash") {
    footerPrimaryLabel = "I have collected the money";
  } else if (bankUi.renewalUx) {
    footerPrimaryLabel = "Generate account";
  }

  const cashOrBankFooter = (
    <div className="flex flex-col gap-4 border-t border-[#F2F4F7] px-4 py-4 sm:flex-row sm:px-6 sm:py-5">
      <Button
        variant="outline"
        radius="xl"
        fullWidth
        className="border-[#CCCACA] text-[#4D4B4B] h-12!"
        onClick={dismissAgentPaymentFlow}
      >
        Cancel
      </Button>
      {showBankFooterPrimary ? (
        <Button
          radius="xl"
          fullWidth
          className="bg-[#DD4F05] hover:bg-[#B84204] text-[#FFF6F1] h-12!"
          loading={selectedMethod === "bank_transfer" && bankUi.renewalUx && generatingVa}
          disabled={
            selectedMethod === "bank_transfer" &&
            (confirmingBankPayment ||
              (bankUi.renewalUx ? generatingVa : !bankUi.activeVa))
          }
          onClick={() => {
            if (selectedMethod === "cash") {
              setStep("receipt");
              return;
            }
            if (bankUi.renewalUx) {
              void handleGenerateAccount();
              return;
            }
            setBankConfirmTimedOut(false);
            bankPollStartedAtRef.current = null;
            setConfirmingBankPayment(true);
          }}
        >
          {footerPrimaryLabel}
        </Button>
      ) : null}
    </div>
  );

  const receiptModal = (
    <div className="min-w-0 max-w-full overflow-x-hidden">
      {commonHeader("Transaction Receipt", "Please upload evidence of cash payment")}
      <div className="space-y-5 px-4 py-5 sm:px-6">
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
      <div className="flex flex-col gap-4 px-4 pb-6 pt-2 sm:flex-row sm:px-6">
        <Button
          variant="outline"
          radius="xl"
          fullWidth
          className="border-[#E88A58] text-[#DD4F05] h-12!"
          onClick={dismissAgentPaymentFlow}
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
    dismissAgentPaymentFlow();
  };

  const mainCashOrBankModal = (
    <div className="min-w-0 max-w-full overflow-x-hidden">
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

  const mainAgentModalOpened =
    opened &&
    step !== "success" &&
    !(selectedMethod === "bank_transfer" && confirmingBankPayment);

  return (
    <>
      <Modal
        opened={mainAgentModalOpened}
        onClose={dismissAgentPaymentFlow}
        centered
        withCloseButton={false}
        size="lg"
        radius={24}
        classNames={{ body: "p-0" }}
        styles={{
          content: {
            width: "min(780px, calc(100vw - 16px))",
            maxWidth: "100%",
            boxSizing: "border-box",
          },
        }}
      >
        {step === "receipt" ? receiptModal : mainCashOrBankModal}
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
      <AgentDepositConfirmingModal
        opened={opened && selectedMethod === "bank_transfer" && confirmingBankPayment}
        confirmTimedOut={bankConfirmTimedOut}
        onClose={dismissAgentPaymentFlow}
      />
    </>
  );
}
