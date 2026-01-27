"use client";

import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { CoinsSwapFreeIcons } from "@hugeicons/core-free-icons";
import { getCurrencyFlagUrl } from "@/app/(customer)/_lib/currency";

export interface ExchangeSummaryCardProps {
  /** e.g. "$5,000" */
  amountSent: string;
  /** e.g. "NGN 5,000,000.00" - shown below amount sent as equivalent */
  amountSentEquivalent?: string;
  /** e.g. "NGN 5,000,000.00" */
  amountReceive: string;
  /** e.g. "USD1 - NGN1500" */
  exchangeRate: string;
  sentCurrencyCode?: string;
  receiveCurrencyCode?: string;
}

function CurrencyFlag({ currencyCode }: { currencyCode: string }) {
  const url = getCurrencyFlagUrl(currencyCode);
  if (url) {
    return (
      <Image
        src={url}
        alt={currencyCode}
        width={24}
        height={24}
        className="flex-none rounded object-cover bg-gray-200 w-6 h-6"
      />
    );
  }
  return (
    <span className="flex-none w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 font-medium text-xs text-[#6C6969]">
      {currencyCode.slice(0, 2)}
    </span>
  );
}

export default function ExchangeSummaryCard({
  amountSent,
  amountSentEquivalent,
  amountReceive,
  exchangeRate,
  sentCurrencyCode = "USD",
  receiveCurrencyCode = "NGN"
}: ExchangeSummaryCardProps) {
  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-[736px] isolate">
      {/* Amount Sent - top, light gray */}
      <div className="flex flex-col items-center pt-6 gap-6 w-full bg-[#F9F9F9] rounded-[24px] self-stretch">
        <div className="flex flex-row items-center gap-2">
          <span className="text-sm font-medium leading-5 text-[#6C6969]">
            Amount Sent
          </span>
          <div className="flex flex-row items-center gap-1">
            <CurrencyFlag currencyCode={sentCurrencyCode} />
            <span className="text-sm font-medium leading-5 text-[#6C6969]">
              {sentCurrencyCode}
            </span>
          </div>
        </div>
        <div className="flex flex-col justify-center items-center gap-4 pb-6">
          <span className="text-2xl font-medium leading-8 tracking-[-0.032px] text-[#4D4B4B]">
            {amountSent}
          </span>
          {amountSentEquivalent &&
            <span className="text-sm font-normal leading-5 text-[#6C6969]">
              {amountSentEquivalent}
            </span>}
        </div>
        <div className="flex flex-row justify-between items-center w-full px-4 py-4 gap-6 border-t border-gray-100">
          <span className="text-sm font-normal leading-5 text-[#6C6969]">
            Exchange Rate
          </span>
          <span className="text-sm font-normal leading-5 text-[#6C6969]">
            {exchangeRate}
          </span>
        </div>
      </div>

      {/* Center swap icon */}
      <div className="flex justify-center -my-6 relative z-10">
        <div
          className="w-12 h-12 rounded-full bg-black flex items-center justify-center flex-none shrink-0"
          aria-hidden
        >
          <HugeiconsIcon
            icon={CoinsSwapFreeIcons}
            size={24}
            className="text-white"
          />
        </div>
      </div>

      {/* You Receive */}
      <div className="flex flex-col w-full self-stretch rounded-[24px] overflow-hidden bg-[#F9F9F9] text-black">
        <div className=" w-full py-4 px-4 gap-6 space-y-2">
          <h2 className="font-normal text-base leading-6">You Receive</h2>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <CurrencyFlag currencyCode={receiveCurrencyCode} />
              <span className="text-sm font-medium leading-5 text-[#6C6969]">
                {receiveCurrencyCode}
              </span>
            </div>
            <span className="text-2xl font-medium leading-8 tracking-[-0.032px]">
              {amountReceive}
            </span>
          </div>
        </div>
        <div className="flex flex-row justify-between items-center w-full py-4 px-6 gap-6 border-t border-white/10 bg-black">
          <span className="font-normal text-base leading-6 text-white">
            Exchange Rate
          </span>
          <span className="font-normal text-base leading-6 text-white">
            {exchangeRate}
          </span>
        </div>
      </div>
    </div>
  );
}
