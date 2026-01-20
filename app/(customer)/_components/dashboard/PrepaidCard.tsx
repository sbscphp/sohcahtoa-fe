"use client";

import { cardBackground } from "@/app/assets/asset";
import { formatCurrency } from "../../_lib/formatCurrency";

type PrepaidCardProps = {
  lastFour?: string;
  validThru?: string;
  balance?: number;
  cardholderName?: string;
};

export default function PrepaidCard({
  lastFour = "7093",
  validThru = "08/27",
  balance = 3048,
  cardholderName = "Emmanuel Israel",
}: PrepaidCardProps) {
  const bgSrc = typeof cardBackground === "string" ? cardBackground : (cardBackground as { src: string }).src;

  return (
    <div
      className="flex h-[156px] min-w-0 flex-1 flex-col justify-between overflow-hidden rounded-[20px] p-4 text-white filter-[drop-shadow(0_15px_25px_rgba(0,0,0,0.15))]"
      style={{ backgroundImage: `url(${bgSrc})`, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      {/* content: chip + "Prepaid card" on left; VISA on right */}
      <div className="flex flex-row items-start justify-between gap-2">
        <div className="flex flex-row items-start gap-2.5">
          {/* chip: 44x32, chip_gold gradient, border 0.5px #A07400, rounded 5px */}
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
        <p className="text-sm font-bold tracking-wider text-[#FAFAFA]">VISA</p>
      </div>

      {/* bottom: .... 7093, VALID THRU 08/27 | $3,048.00, Emmanuel Israel */}
      <div className="flex flex-row items-end justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <p className="font-mono text-base font-medium leading-[120%] text-[#FAFAFA]">.... {lastFour}</p>
          <div className="flex flex-row items-baseline gap-1">
            <span className="text-[6px] leading-[8px] text-[#FAFAFA]">VALID THRU</span>
            <span className="text-xs leading-[120%] text-[#FAFAFA]">{validThru}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <p className="text-base font-medium leading-[120%] text-[#FAFAFA]">{formatCurrency(balance, "USD").formatted}</p>
          <p className="text-xs font-medium leading-[120%] text-[#FAFAFA]">{cardholderName}</p>
        </div>
      </div>
    </div>
  );
}
