"use client";

import { CircleAlert } from "lucide-react";

interface PaymentInstructionsCalloutProps {
  paragraphs: string[];
}

export function PaymentInstructionsCallout({
  paragraphs,
}: Readonly<PaymentInstructionsCalloutProps>) {
  if (!paragraphs.length) return null;

  return (
    <div className="flex gap-2 rounded-lg border border-[#B2AFAF] p-3 sm:p-4">
      <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-[#DD4F05]" />
      <div className="min-w-0 flex-1 space-y-3 text-justify text-xs leading-5 text-[#6C6969] sm:text-sm sm:leading-6">
        {paragraphs.map((paragraph, index) => (
          <p key={`${index}-${paragraph.slice(0, 24)}`}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
}
