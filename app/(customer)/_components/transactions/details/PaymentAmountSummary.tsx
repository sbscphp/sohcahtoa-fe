"use client";

import Image from "next/image";
import { getCurrencyFlagUrl } from "@/app/(customer)/_lib/currency";
import type { DepositPaymentAmountViewModel } from "@/app/(customer)/_utils/transaction-payment";

export type PaymentAmountActionLabel = "Send" | "Collect";

interface PaymentAmountSummaryProps {
  actionLabel: PaymentAmountActionLabel;
  amount: DepositPaymentAmountViewModel;
  /** Slightly smaller label row (agent modal). */
  compactLabel?: boolean;
}

function AmountSkeleton() {
  return (
    <div
      className="mx-auto h-9 w-44 max-w-full animate-pulse rounded bg-[#E8E6E6] sm:h-10 sm:w-52"
      aria-hidden
    />
  );
}

export function PaymentAmountSummary({
  actionLabel,
  amount,
  compactLabel = false,
}: Readonly<PaymentAmountSummaryProps>) {
  const flagUrl = getCurrencyFlagUrl("NGN");
  const labelClass = compactLabel
    ? "text-sm font-medium text-[#6C6969] "
    : "text-lg font-medium leading-none text-[#6C6969] sm:text-2xl md:text-3xl";

  return (
    <div className="flex w-full max-w-full flex-col items-center gap-2 rounded-lg bg-[#F9F9F9] p-4 sm:gap-3 sm:p-5">
      <div className={`flex items-center gap-2 ${labelClass}`}>
        <span>{actionLabel}</span>
        {flagUrl ? (
          <Image src={flagUrl} alt="NGN" width={24} height={24} className="shrink-0" />
        ) : null}
        <span>NGN</span>
      </div>

      {amount.isLoading ? (
        <AmountSkeleton />
      ) : (
        <div
          className="w-full max-w-full px-1 text-center text-2xl font-medium leading-tight text-[#4D4B4B] tabular-nums break-all sm:text-3xl md:text-4xl"
          aria-live="polite"
        >
          {amount.formattedAmount ?? "—"}
        </div>
      )}

      {!amount.isLoading && amount.feeNote ? (
        <p className="text-center text-xs leading-snug text-[#6C6969] sm:text-sm">
          {amount.feeNote}
        </p>
      ) : null}
    </div>
  );
}
