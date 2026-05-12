"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Button, Modal } from "@mantine/core";
import { useQueryClient } from "@tanstack/react-query";
import { CircleAlert, X } from "lucide-react";
import { useFetchSingleData } from "@/app/_lib/api/hooks";
import { customerKeys } from "@/app/_lib/api/query-keys";
import { customerApi } from "@/app/(customer)/_services/customer-api";
import { getCurrencyFlagUrl } from "@/app/(customer)/_lib/currency";
import {
  getInstructionsText,
  getStringField,
  getVirtualAccountRemainingSeconds,
} from "@/app/(customer)/_utils/transaction-payment";
import { getVirtualAccountBankStepUiState } from "@/app/(customer)/_utils/virtualAccountBankStepUi";
import { getCustomerApiErrorMessage } from "@/app/(customer)/_utils/customer-api-error-message";
import { notifications } from "@mantine/notifications";
import { DepositConfirmingModal } from "./DepositConfirmingModal";
import { useDepositConfirmationPoll } from "./useDepositConfirmationPoll";
import { VirtualAccountBankPaymentSection } from "./VirtualAccountBankPaymentSection";

interface ProceedToPaymentModalProps {
  opened: boolean;
  onClose: () => void;
  transactionId: string;
  amountNgn: number;
}

function asQueryKey(key: readonly unknown[]): unknown[] {
  return key as unknown[];
}

export default function ProceedToPaymentModal({
  opened,
  onClose,
  transactionId,
  amountNgn,
}: Readonly<ProceedToPaymentModalProps>) {
  const queryClient = useQueryClient();
  const flagUrl = getCurrencyFlagUrl("NGN");
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const pollStartedAtRef = useRef<number | null>(null);
  const onCloseRef = useRef(onClose);
  const [generatingVa, setGeneratingVa] = useState(false);
  const [vaError, setVaError] = useState<string | null>(null);
  const [liveRemainingSec, setLiveRemainingSec] = useState(0);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const handleDepositVerified = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: [...customerKeys.transactions.detail(transactionId)],
    });
    await queryClient.invalidateQueries({
      queryKey: [...customerKeys.transactions.depositStatus(transactionId)],
    });
    setConfirmingPayment(false);
    onCloseRef.current();
  }, [queryClient, transactionId]);

  const { confirmTimedOut, setConfirmTimedOut } = useDepositConfirmationPoll({
    transactionId,
    opened,
    confirmingPayment,
    pollStartedAtRef,
    fetchDepositStatus: (id) => customerApi.transactions.getDepositStatus(id),
    onVerified: handleDepositVerified,
  });

  const handleCloseAll = useCallback(() => {
    setConfirmingPayment(false);
    setConfirmTimedOut(false);
    pollStartedAtRef.current = null;
    onClose();
  }, [onClose, setConfirmTimedOut]);

  useEffect(() => {
    if (!opened) {
      pollStartedAtRef.current = null;
      const id = globalThis.setTimeout(() => {
        setConfirmingPayment(false);
        setConfirmTimedOut(false);
        setGeneratingVa(false);
        setVaError(null);
        setLiveRemainingSec(0);
      }, 0);
      return () => globalThis.clearTimeout(id);
    }
  }, [opened, setConfirmTimedOut]);

  const virtualAccountQuery = useFetchSingleData(
    asQueryKey(customerKeys.transactions.virtualAccount(transactionId)),
    () => customerApi.transactions.getVirtualAccount(transactionId),
    opened && !!transactionId
  );
  const instructionsQuery = useFetchSingleData(
    asQueryKey(customerKeys.transactions.depositInstructions(transactionId)),
    () => customerApi.transactions.getDepositInstructions(transactionId),
    opened && !!transactionId
  );
  const depositStatusQuery = useFetchSingleData(
    asQueryKey(customerKeys.transactions.depositStatus(transactionId)),
    () => customerApi.transactions.getDepositStatus(transactionId),
    opened && !!transactionId && !confirmingPayment
  );

  const accountData = virtualAccountQuery?.data?.data;
  const expiryFromAccount = getStringField(accountData, ["expiresAt", "expiryDate", "expiry"]);
  const statusData = depositStatusQuery?.data?.data;
  const expiryFromStatus = getStringField(statusData, ["expiresAt", "expiryDate", "expiry"]);
  const fallbackExpiryForCountdown = expiryFromAccount ? null : (expiryFromStatus ?? "30:00");
  const remainingSnapshot = useMemo(
    () => getVirtualAccountRemainingSeconds(accountData, fallbackExpiryForCountdown),
    [accountData, fallbackExpiryForCountdown]
  );

  const bankUi = useMemo(
    () =>
      getVirtualAccountBankStepUiState({
        isBankTransfer: true,
        va: {
          isPending: virtualAccountQuery.isPending,
          isError: virtualAccountQuery.isError,
          error: virtualAccountQuery.error,
          accountData,
        },
        liveRemainingSec,
      }),
    [
      virtualAccountQuery.isPending,
      virtualAccountQuery.isError,
      virtualAccountQuery.error,
      accountData,
      liveRemainingSec,
    ]
  );

  const bankLoadErrorMessage = useMemo(() => {
    if (!bankUi.fatalLoadError) return null;
    return getCustomerApiErrorMessage(
      virtualAccountQuery.error,
      "Could not load virtual account."
    );
  }, [bankUi.fatalLoadError, virtualAccountQuery.error]);

  useEffect(() => {
    if (!opened || !transactionId) return;
    setLiveRemainingSec(remainingSnapshot);
  }, [opened, transactionId, remainingSnapshot]);

  const handleGenerateAccount = useCallback(async () => {
    setVaError(null);
    try {
      setGeneratingVa(true);
      await customerApi.transactions.createVirtualAccount(transactionId);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [...customerKeys.transactions.virtualAccount(transactionId)],
        }),
        queryClient.invalidateQueries({
          queryKey: [...customerKeys.transactions.depositInstructions(transactionId)],
        }),
        queryClient.invalidateQueries({
          queryKey: [...customerKeys.transactions.depositStatus(transactionId)],
        }),
      ]);
    } catch (e) {
      setVaError(getCustomerApiErrorMessage(e, "Could not generate a new account."));
    } finally {
      setGeneratingVa(false);
    }
  }, [queryClient, transactionId]);

  const accountNumber =
    getStringField(accountData, ["accountNumber", "number", "account_no"]) ?? "—";
  const bankName = getStringField(accountData, ["bankName", "bank"]) ?? "—";
  const accountName = getStringField(accountData, ["accountName", "name"]) ?? "—";
  const infoMessage =
    getInstructionsText(instructionsQuery.data?.data) ??
    "Once approved, 75% of your funds will be sent to your bank account or prepaid card, while the remaining 25% will be available for cash pickup at the nearest branch (passport endorsement required).";

  const formattedAmount = useMemo(
    () => Number(amountNgn || 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    [amountNgn]
  );

  const handleCopy = async (value: string) => {
    if (!value || value === "—") return;
    try {
      await navigator.clipboard.writeText(value);
      notifications.show({
        title: "Copied to clipboard",
        message: "The account number has been copied to your clipboard.",
        color: "green",
        withCloseButton: true,
      });
    } catch {
      // no-op
    }
  };

  const showInstructionsCallout = bankUi.activeVa;
  const showFooterPrimary = !bankUi.fatalLoadError;
  let footerPrimaryLabel = "I have sent the money";
  if (bankUi.renewalUx) {
    footerPrimaryLabel = "Generate account";
  }

  const primaryDisabled =
    confirmingPayment ||
    (bankUi.renewalUx ? generatingVa : !bankUi.activeVa);

  return (
    <>
      <Modal
        opened={opened && !confirmingPayment}
        onClose={confirmingPayment ? () => {} : handleCloseAll}
        centered
        withCloseButton={false}
        size="lg"
        radius={24}
        classNames={{ body: "p-0" }}
        styles={{
          content: {
            width: "min(640px, calc(100vw - 16px))",
            maxWidth: "100%",
            boxSizing: "border-box",
          },
        }}
        closeOnClickOutside={false}
      >
        <div className="flex min-w-0 max-w-full flex-col overflow-x-hidden">
          <div className="border-b border-[#F2F4F7] px-4 py-4 sm:px-6 sm:py-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-xl leading-none font-bold text-[#4D4B4B]">Pay To</h3>
                <p className="mt-2 text-base leading-6 text-[#6C6969]">
                  Pay to the account below and confirm once payment is made
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseAll}
                disabled={confirmingPayment}
                className="text-[#8F8B8B] transition-colors hover:text-[#4D4B4B] disabled:opacity-40"
                aria-label="Close"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="max-h-[58vh] space-y-5 overflow-y-auto overflow-x-hidden px-4 py-4 sm:px-6">
            <div className="flex w-full max-w-full flex-col items-center gap-2 rounded-lg bg-[#F9F9F9] p-4 sm:gap-3 sm:p-5">
              <div className="flex items-center gap-2 text-lg font-medium leading-none text-[#6C6969] sm:text-2xl md:text-3xl">
                <span>Send</span>
                {flagUrl && <Image src={flagUrl} alt="NGN" width={24} height={24} className="shrink-0" />}
                <span>NGN</span>
              </div>
              <div className="w-full max-w-full px-1 text-center text-2xl font-medium leading-tight text-[#4D4B4B] tabular-nums break-all sm:text-3xl md:text-4xl">
                {formattedAmount}
              </div>
            </div>

            <VirtualAccountBankPaymentSection
              ui={bankUi}
              accountNumber={accountNumber}
              bankName={bankName}
              accountName={accountName}
              expiryFromAccount={expiryFromAccount}
              fallbackExpiryForCountdown={fallbackExpiryForCountdown}
              countdownActive={opened && !!transactionId && !confirmingPayment && bankUi.activeVa}
              vaError={vaError}
              loadErrorMessage={bankLoadErrorMessage}
              onRemainingSecChange={setLiveRemainingSec}
              onSoonBannerGenerate={() => {
                void handleGenerateAccount();
              }}
              soonBannerGenerateLoading={generatingVa}
              onCopyAccountNumber={handleCopy}
            />

            {showInstructionsCallout ? (
              <div className="flex gap-2 rounded-lg border border-[#B2AFAF] p-3 sm:p-4">
                <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-[#DD4F05]" />
                <p className="text-xs leading-4 text-[#6C6969] sm:text-sm">{infoMessage}</p>
              </div>
            ) : null}
          </div>

          <div className="flex shrink-0 flex-col gap-3 border-t border-[#F2F4F7] bg-white px-4 pt-3 sm:flex-row sm:gap-4 sm:px-6 sm:pt-5">
            <Button
              variant="outline"
              radius="xl"
              fullWidth
              className="h-12! border-[#CCCACA] bg-white text-base text-[#4D4B4B] hover:bg-[#F9F9F9] sm:text-base!"
              onClick={handleCloseAll}
              disabled={confirmingPayment}
            >
              Cancel
            </Button>
            {showFooterPrimary ? (
              <Button
                radius="xl"
                fullWidth
                className="h-12! bg-[#DD4F05] text-base text-[#FFF6F1] hover:bg-[#B84204] sm:text-base!"
                disabled={primaryDisabled}
                loading={bankUi.renewalUx && generatingVa}
                onClick={() => {
                  if (bankUi.renewalUx) {
                    void handleGenerateAccount();
                    return;
                  }
                  setConfirmTimedOut(false);
                  pollStartedAtRef.current = null;
                  setConfirmingPayment(true);
                }}
              >
                {footerPrimaryLabel}
              </Button>
            ) : null}
          </div>
        </div>
      </Modal>

      <DepositConfirmingModal
        opened={confirmingPayment}
        confirmTimedOut={confirmTimedOut}
        onClose={handleCloseAll}
      />
    </>
  );
}
