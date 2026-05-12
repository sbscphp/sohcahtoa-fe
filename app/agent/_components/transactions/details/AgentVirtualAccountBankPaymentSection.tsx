"use client";

import { CircleAlert, Copy } from "lucide-react";
import { PaymentExpiryCountdown } from "@/app/(customer)/_components/transactions/details/PaymentExpiryCountdown";
import { SOON_THRESHOLD_SECONDS } from "@/app/(customer)/_utils/transaction-payment";
import type { VirtualAccountBankStepUiState } from "@/app/agent/_utils/virtualAccountBankStepUi";

export type AgentVirtualAccountBankPaymentSectionProps = {
  ui: VirtualAccountBankStepUiState;
  accountNumber: string;
  bankName: string;
  accountName: string;
  expiryFromAccount: string | null;
  fallbackExpiryForCountdown: string | null;
  countdownActive: boolean;
  vaError: string | null;
  loadErrorMessage: string | null;
  onRemainingSecChange: (seconds: number) => void;
  onSoonBannerGenerate: () => void;
  soonBannerGenerateLoading?: boolean;
  onCopyAccountNumber?: (value: string) => void | Promise<void>;
};

function RenewalBanner() {
  return (
    <div className="flex gap-2 rounded-lg border border-[#F5C4A8] bg-[#FFF6F1] p-3">
      <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-[#DD4F05]" />
      <p className="min-w-0 text-sm leading-snug text-[#4D4B4B] sm:text-base">
        This payment window has expired or is unavailable. Tap <span className="font-medium">Generate account</span>{" "}
        for fresh bank details.
      </p>
    </div>
  );
}

function BankSkeleton() {
  return (
    <div className="space-y-3 border-b border-[#CCCACA] py-2">
      <div className="h-4 w-[75%] animate-pulse rounded bg-[#E8E6E6]" />
      <div className="h-4 w-full animate-pulse rounded bg-[#E8E6E6]" />
      <div className="h-4 w-[83%] animate-pulse rounded bg-[#E8E6E6]" />
    </div>
  );
}

function SoonBanner({
  onGenerateClick,
  loading,
}: Readonly<{ onGenerateClick: () => void; loading: boolean }>) {
  return (
    <div className="flex gap-2 rounded-lg border border-amber-200/90 bg-amber-50 p-2.5">
      <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-800" />
      <div className="min-w-0 text-xs leading-snug text-amber-950 sm:text-sm">
        Less than {SOON_THRESHOLD_SECONDS} seconds left on this account. You can{" "}
        <button
          type="button"
          onClick={onGenerateClick}
          disabled={loading}
          className="font-medium text-[#DD4F05] underline decoration-[#DD4F05]/50 underline-offset-2 hover:text-[#B84204] disabled:cursor-wait disabled:opacity-50 disabled:no-underline"
        >
          generate a new account
        </button>{" "}
        before this one expires.
      </div>
    </div>
  );
}

type AccountBlockProps = {
  activeVa: boolean;
  accountNumber: string;
  bankName: string;
  accountName: string;
  expiryFromAccount: string | null;
  fallbackExpiryForCountdown: string | null;
  countdownActive: boolean;
  onRemainingSecChange: (seconds: number) => void;
  onCopyAccountNumber?: (value: string) => void | Promise<void>;
};

function AccountRowsAndCountdown({
  activeVa,
  accountNumber,
  bankName,
  accountName,
  expiryFromAccount,
  fallbackExpiryForCountdown,
  countdownActive,
  onRemainingSecChange,
  onCopyAccountNumber,
}: Readonly<AccountBlockProps>) {
  const handleCopyAccount = () => {
    if (onCopyAccountNumber) void onCopyAccountNumber(accountNumber);
    else void navigator.clipboard.writeText(accountNumber).catch(() => null);
  };

  return (
    <>
      <div className="divide-y divide-[#CCCACA] border-b border-[#CCCACA]">
        <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <span className="shrink-0 text-sm text-[#8F8B8B] sm:text-base">Account Number</span>
          {activeVa ? (
            <button
              type="button"
              onClick={handleCopyAccount}
              className="inline-flex min-w-0 max-w-full cursor-pointer items-center justify-end gap-2 break-all text-left text-sm text-[#131212] sm:max-w-[55%] sm:text-base"
            >
              <span className="min-w-0">{accountNumber}</span>
              <Copy className="h-4 w-4 shrink-0 text-[#8F8B8B]" />
            </button>
          ) : (
            <span className="text-right text-sm text-[#8F8B8B] sm:text-base">—</span>
          )}
        </div>
        <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <span className="shrink-0 text-sm text-[#8F8B8B] sm:text-base">Bank Name</span>
          <span
            className={`min-w-0 wrap-break-word text-right text-sm sm:text-base ${
              activeVa ? "text-[#131212]" : "text-[#8F8B8B]"
            }`}
          >
            {activeVa ? bankName : "—"}
          </span>
        </div>
        <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <span className="shrink-0 text-sm text-[#8F8B8B] sm:text-base">Account Name</span>
          <span
            className={`min-w-0 wrap-break-word text-right text-sm sm:text-base ${
              activeVa ? "text-[#131212]" : "text-[#8F8B8B]"
            }`}
          >
            {activeVa ? accountName : "—"}
          </span>
        </div>
      </div>
      {activeVa ? (
        <div className="flex flex-wrap items-baseline justify-center gap-x-2 gap-y-1 text-center text-sm text-[#8F8B8B] sm:text-base">
          <span>Account expires in</span>
          <span className="text-lg font-bold leading-none text-[#323131] sm:text-2xl">
            <PaymentExpiryCountdown
              expiresAtIso={expiryFromAccount}
              fallbackExpiry={fallbackExpiryForCountdown}
              active={countdownActive}
              onRemainingChange={onRemainingSecChange}
            />
          </span>
        </div>
      ) : null}
    </>
  );
}

export function AgentVirtualAccountBankPaymentSection({
  ui,
  accountNumber,
  bankName,
  accountName,
  expiryFromAccount,
  fallbackExpiryForCountdown,
  countdownActive,
  vaError,
  loadErrorMessage,
  onRemainingSecChange,
  onSoonBannerGenerate,
  soonBannerGenerateLoading,
  onCopyAccountNumber,
}: Readonly<AgentVirtualAccountBankPaymentSectionProps>) {
  const { renewalUx, vaInitialPending, activeVa, fatalLoadError, activeVaExpiringSoon } = ui;
  const vaReady = !vaInitialPending;

  return (
    <>
      {renewalUx ? <RenewalBanner /> : null}
      {vaInitialPending ? <BankSkeleton /> : null}
      {fatalLoadError && loadErrorMessage ? (
        <p className="text-sm text-red-600">{loadErrorMessage}</p>
      ) : null}
      {renewalUx && vaError ? <p className="text-sm text-red-600">{vaError}</p> : null}
      {activeVaExpiringSoon ? (
        <SoonBanner
          onGenerateClick={onSoonBannerGenerate}
          loading={!!soonBannerGenerateLoading}
        />
      ) : null}
      {vaReady ? (
        <AccountRowsAndCountdown
          activeVa={activeVa}
          accountNumber={accountNumber}
          bankName={bankName}
          accountName={accountName}
          expiryFromAccount={expiryFromAccount}
          fallbackExpiryForCountdown={fallbackExpiryForCountdown}
          countdownActive={countdownActive}
          onRemainingSecChange={onRemainingSecChange}
          onCopyAccountNumber={onCopyAccountNumber}
        />
      ) : null}
    </>
  );
}
