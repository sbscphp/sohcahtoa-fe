"use client";

import { Info } from "lucide-react";

export function IMTOAlert() {
  return (
    <div className="flex  gap-2 p-2 min-h-[40px] w-full max-w-[330px] border border-[#B2AFAF] rounded-lg">
      <span className="flex-none w-6 h-6 shrink-0" aria-hidden>
        <Info size={24} className="text-primary-400" strokeWidth={2} />
      </span>
      <p className="flex-1 font-normal text-base leading-6 text-[#323131]">
        Maximum USD cash pickup is <strong>$500</strong>
      </p>
    </div>
  );
}
