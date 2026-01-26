"use client";

import Image from "next/image";
import { getCurrencyFlagUrl } from "@/app/(customer)/_lib/currency";
import { getStatusBadge } from "@/app/(customer)/_utils/status-badge";
import { Download } from "lucide-react";

const labelClass =
  "font-normal text-base leading-6 text-[#8F8B8B]";
const valueClass =
  "font-medium text-base leading-6 text-[#4D4B4B]";

export interface LabelTextProps {
  label: string;
  value?: React.ReactNode;
  /** Plain string value (ignored if value is provided) */
  text?: string;
  /** Currency code for amount with flag (e.g. NGN, USD). Renders flag + "CODE amount" */
  amount?: { code: string; formatted: string };
  /** Document link: filename + optional onDownload */
  document?: { filename: string; onDownload?: () => void };
  /** Status string for badge (e.g. "Completed") */
  statusBadge?: string;
  /** Multi-line value (e.g. "Line1\nLine2") */
  multiline?: string;
  className?: string;
}

export default function LabelText({
  label,
  value,
  text,
  amount,
  document: doc,
  statusBadge,
  multiline,
  className = "",
}: LabelTextProps) {
  const renderValue = () => {
    if (value !== undefined && value !== null) return value;
    if (statusBadge !== undefined) {
      return (
        <div style={getStatusBadge(statusBadge)}>
          {statusBadge}
        </div>
      );
    }
    if (amount) {
      const flagUrl = getCurrencyFlagUrl(amount.code);
      return (
        <span className="flex items-center gap-2">
          {flagUrl && (
            <Image
              src={flagUrl}
              alt={amount.code}
              width={16}
              height={16}
              className="shrink-0"
            />
          )}
          <span className={valueClass}>
            {amount.code} {amount.formatted}
          </span>
        </span>
      );
    }
    if (doc) {
      return (
        <button
          type="button"
          onClick={doc.onDownload}
          className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <span className={valueClass}>{doc.filename}</span>
          <Download className="shrink-0 w-4 h-4 text-[#98A2B3]" aria-hidden />
        </button>
      );
    }
    if (multiline !== undefined) {
      return (
        <span className={`${valueClass} whitespace-pre-line block`}>
          {multiline}
        </span>
      );
    }
    if (text !== undefined) return <span className={valueClass}>{text}</span>;
    return null;
  };

  return (
    <div
      className={`flex flex-col justify-center items-start gap-2 flex-1 min-w-0 ${className}`}
    >
      <span className={labelClass}>{label}</span>
      {renderValue()}
    </div>
  );
}
