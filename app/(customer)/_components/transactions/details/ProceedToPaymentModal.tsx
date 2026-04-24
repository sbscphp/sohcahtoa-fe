"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Button, Modal } from "@mantine/core";
import { CircleAlert, Copy, X } from "lucide-react";
import { useFetchSingleData } from "@/app/_lib/api/hooks";
import { customerKeys } from "@/app/_lib/api/query-keys";
import { customerApi } from "@/app/(customer)/_services/customer-api";
import { getCurrencyFlagUrl } from "@/app/(customer)/_lib/currency";
import {
  formatPaymentExpiryCountdown,
  getInstructionsText,
  getStringField,
  parseExpiryToSeconds,
} from "@/app/(customer)/_utils/transaction-payment";

interface ProceedToPaymentModalProps {
  opened: boolean;
  onClose: () => void;
  transactionId: string;
  amountNgn: number;
}

function CountdownText({ initialSeconds, running }: { initialSeconds: number; running: boolean }) {
  const [remaining, setRemaining] = useState(initialSeconds);

  useEffect(() => {
    if (!running || remaining <= 0) return;
    const timer = window.setInterval(() => {
      setRemaining((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [running, remaining]);

  return <>{formatPaymentExpiryCountdown(remaining)}</>;
}

export default function ProceedToPaymentModal({
  opened,
  onClose,
  transactionId,
  amountNgn,
}: ProceedToPaymentModalProps) {
  const flagUrl = getCurrencyFlagUrl("NGN");

  const virtualAccountQuery = useFetchSingleData(
    [...customerKeys.transactions.virtualAccount(transactionId)],
    () => customerApi.transactions.getVirtualAccount(transactionId),
    opened && !!transactionId
  );

  const instructionsQuery = useFetchSingleData(
    [...customerKeys.transactions.depositInstructions(transactionId)],
    () => customerApi.transactions.getDepositInstructions(transactionId),
    opened && !!transactionId
  );

  const depositStatusQuery = useFetchSingleData(
    [...customerKeys.transactions.depositStatus(transactionId)],
    () => customerApi.transactions.getDepositStatus(transactionId),
    opened && !!transactionId
  );

  const accountData = virtualAccountQuery.data?.data;
  const accountNumber = getStringField(accountData, ["accountNumber", "number", "account_no"]) ?? "—";
  const bankName = getStringField(accountData, ["bankName", "bank"]) ?? "—";
  const accountName = getStringField(accountData, ["accountName", "name"]) ?? "—";

  const statusData = depositStatusQuery.data?.data;
  const expiryFromStatus = getStringField(statusData, ["expiresAt", "expiryDate", "expiry"]);
  const expiryFromAccount = getStringField(accountData, ["expiresAt", "expiryDate", "expiry"]);
  const rawExpiry = expiryFromStatus ?? expiryFromAccount ?? "30:00";
  const initialCountdownSeconds = useMemo(() => parseExpiryToSeconds(rawExpiry), [rawExpiry]);

  const infoMessage =
    getInstructionsText(instructionsQuery.data?.data) ??
    "Once approved, 75% of your funds will be sent to your bank account or prepaid card, while the remaining 25% will be available for cash pickup at the nearest branch (passport endorsement required).";

  const formattedAmount = useMemo(
    () => Number(amountNgn || 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    [amountNgn]
  );

  const hasVirtualAccount = virtualAccountQuery.isSuccess;
  const accountUnavailable =
    (virtualAccountQuery.error as { status?: number } | null)?.status === 404 ||
    (instructionsQuery.error as { status?: number } | null)?.status === 404;

  const handleCopy = async (value: string) => {
    if (!value || value === "—") return;
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // no-op
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      withCloseButton={false}
      size="lg"
      radius={24}
      classNames={{ body: "p-0" }}
      styles={{ content: { width: "min(640px, calc(100vw - 24px))" } }}
    >
      <div className="flex flex-col">
        <div className="border-b border-[#F2F4F7] px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-[#4D4B4B] text-xl leading-none font-bold">Pay To</h3>
              <p className="text-[#6C6969] text-base leading-6 mt-2">
                Pay to the account below and confirm once payment is made
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-[#8F8B8B] hover:text-[#4D4B4B] transition-colors"
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="px-4 sm:px-6 py-4 max-h-[58vh] overflow-y-auto">
          <div className="bg-[#F9F9F9] rounded-lg p-4 sm:p-5 flex flex-col items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 text-[#6C6969] text-2xl sm:text-3xl leading-none font-medium">
              <span>Send</span>
              {flagUrl && <Image src={flagUrl} alt="NGN" width={24} height={24} className="shrink-0" />}
              <span>NGN</span>
            </div>
            <div className="text-[#4D4B4B] text-3xl leading-none font-medium">{formattedAmount}</div>
          </div>

          {accountUnavailable && (
            <div className="mt-4 rounded-lg border border-[#E88A58] bg-[#FFF6F1] px-4 py-3 text-sm text-[#6C6969]">
              Virtual account is not available yet for this transaction. Please check back later.
            </div>
          )}

          <div className="mt-4 divide-y divide-[#CCCACA] border-b border-[#CCCACA]">
            <div className="flex items-center justify-between gap-4 py-3">
              <span className="text-[#8F8B8B] text-base sm:text-base">Account Number</span>
              <button
                type="button"
                onClick={() => handleCopy(accountNumber)}
                className="inline-flex items-center gap-2 text-[#131212] text-base sm:text-base"
              >
                {accountNumber}
                <Copy className="w-4 h-4 text-[#8F8B8B]" />
              </button>
            </div>
            <div className="flex items-center justify-between gap-4 py-3">
              <span className="text-[#8F8B8B] text-base sm:text-base">Bank Name</span>
              <span className="text-[#131212] text-base sm:text-base">{bankName}</span>
            </div>
            <div className="flex items-center justify-between gap-4 py-3">
              <span className="text-[#8F8B8B] text-base sm:text-base">Account Name</span>
              <span className="text-[#131212] text-base sm:text-base">{accountName}</span>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-center gap-2 text-[#8F8B8B] text-base">
            <span>Account expires in</span>
            <span className="text-[#323131] text-xl sm:text-2xl leading-none font-bold">
              <CountdownText
                key={`${opened}-${rawExpiry}`}
                initialSeconds={initialCountdownSeconds}
                running={opened}
              />
            </span>
          </div>

          <div className="mt-5 rounded-lg border border-[#B2AFAF] p-3 sm:p-4 flex gap-2">
            <CircleAlert className="w-5 h-5 text-[#DD4F05] shrink-0 mt-0.5" />
            <p className="text-[#6C6969] text-xs leading-4">{infoMessage}</p>
          </div>
        </div>

        <div
          className="px-4 sm:px-6 pt-3 sm:pt-5 flex flex-col sm:flex-row gap-3 sm:gap-4 bg-white border-t border-[#F2F4F7] shrink-0"
        >
          <Button
            variant="outline"
            radius="xl"
            fullWidth
            className="border-[#CCCACA] text-[#4D4B4B] bg-white hover:bg-[#F9F9F9] text-base sm:text-base"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            radius="xl"
            fullWidth
            className="bg-[#DD4F05] hover:bg-[#B84204] text-[#FFF6F1] text-base sm:text-base"
            disabled={!hasVirtualAccount && !accountUnavailable}
          >
            I have sent the money
          </Button>
        </div>
      </div>
    </Modal>
  );
}
