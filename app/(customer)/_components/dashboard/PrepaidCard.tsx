"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cardBackground } from "@/app/assets/asset";
import { formatCurrency } from "../../_lib/formatCurrency";
import { useSelectedCurrencyCode } from "../../_lib/selected-currency-atom";

const CARD_DETAILS_VISIBLE_KEY = "sohcahtoa-prepaid-card-details-visible";

type PrepaidCardProps = {
  lastFour?: string;
  validThru?: string;
  balance?: number;
  cardholderName?: string;
};

export default function PrepaidCard({
  lastFour = "0000",
  validThru = "00/00",
  balance = 0,
  cardholderName = "",
}: PrepaidCardProps) {
  const [detailsVisible, setDetailsVisible] = useState(true);
  const currencyCode = useSelectedCurrencyCode();
  const bgSrc = typeof cardBackground === "string" ? cardBackground : (cardBackground as { src: string }).src;
  const panDisplay = detailsVisible ? `.... ${lastFour}` : "•••• ••••";
  const dateDisplay = detailsVisible ? validThru : "••/••";
  const amountDisplay = detailsVisible
    ? formatCurrency(balance, currencyCode).formatted
    : "••••••";

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(CARD_DETAILS_VISIBLE_KEY);
      if (stored === "hidden") setDetailsVisible(false);
      if (stored === "visible") setDetailsVisible(true);
    } catch {
      // ignore storage access
    }
  }, []);

  const toggleDetails = () => {
    setDetailsVisible((current) => {
      const next = !current;
      try {
        window.localStorage.setItem(CARD_DETAILS_VISIBLE_KEY, next ? "visible" : "hidden");
      } catch {
        // ignore storage access
      }
      return next;
    });
  };

  return (
    <div
      className="flex h-[156px] min-w-0 flex-1 flex-col justify-between overflow-hidden rounded-[20px] p-4 text-white filter-[drop-shadow(0_15px_25px_rgba(0,0,0,0.15))] transition-transform duration-200 hover:scale-[1.02]"
      style={{ backgroundImage: `url(${bgSrc})`, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <div className="flex flex-row items-start justify-between gap-2">
        <div className="flex flex-row items-start gap-2.5">
          <div
            className="h-8 w-11 shrink-0 rounded-[5px]"
            style={{
              background: "linear-gradient(115.95deg, #DAAA00 0%, #FFF9CF 51.04%, #F0CA00 100%)",
              border: "0.5px solid #A07400",
            }}
            aria-hidden
          />
          <p className="text-xs font-medium leading-[120%] text-[#FAFAFA]">Prepaid card</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleDetails();
            }}
            className="text-[#FAFAFA] hover:opacity-80"
            aria-label={detailsVisible ? "Hide card details" : "Show card details"}
          >
            {detailsVisible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
          </button>
          <p className="text-sm font-bold tracking-wider text-[#FAFAFA]">VISA</p>
        </div>
      </div>

      <div className="flex flex-row items-end justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <p className="font-mono text-base font-medium leading-[120%] text-[#FAFAFA]">{panDisplay}</p>
          <div className="flex flex-row items-baseline gap-1">
            <span className="text-[6px] leading-[8px] text-[#FAFAFA]">VALID THRU</span>
            <span className="text-xs leading-[120%] text-[#FAFAFA]">{dateDisplay}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <p className="text-base font-medium leading-[120%] text-[#FAFAFA]">{amountDisplay}</p>
          <p className="text-xs font-medium leading-[120%] text-[#FAFAFA]">{cardholderName}</p>
        </div>
      </div>
    </div>
  );
}
