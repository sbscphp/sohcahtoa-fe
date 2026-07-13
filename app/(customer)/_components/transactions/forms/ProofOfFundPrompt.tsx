"use client";

import { PROOF_OF_FUNDS_TEMPLATE_URL } from "@/app/(customer)/_lib/constants";
import { Anchor } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { DEFAULT_PROOF_OF_FUNDS_THRESHOLD } from "./amount-step-utils";

function formatThresholdLabel(amount: number, currency: string): string {
  const code = currency.trim().toUpperCase() || "USD";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString("en-US")} ${code}`;
  }
}

export interface ProofOfFundPromptProps {
  /** When true, shows the message and upload link. */
  show: boolean;
  onUploadClick: () => void;
  /** Threshold amount in the selected FX currency (e.g. 10000). */
  threshold?: number;
  /** Selected foreign currency code used for the threshold label (e.g. USD, EUR). */
  currency?: string;
  /** Overrides {@link PROOF_OF_FUNDS_TEMPLATE_URL} when the template URL is flow-specific. */
  templateDownloadUrl?: string;
}

/**
 * Shown when transaction amount is greater than the flow threshold.
 * Prompts user to upload proof of fund; clicking the link typically opens ProofOfFundModal.
 */
export default function ProofOfFundPrompt({
  show,
  onUploadClick,
  threshold = DEFAULT_PROOF_OF_FUNDS_THRESHOLD,
  currency = "USD",
  templateDownloadUrl,
}: Readonly<ProofOfFundPromptProps>) {
  if (!show) return null;

  const label = formatThresholdLabel(threshold, currency);
  const templateUrl = templateDownloadUrl?.trim() || PROOF_OF_FUNDS_TEMPLATE_URL.trim();

  const handleTemplateDownload = () => {
    if (templateUrl) return;
    notifications.show({
      title: "Coming soon",
      message: "Proof of funds template download will be available shortly.",
      color: "orange",
    });
  };

  const linkClassName = "font-normal! text-[#0C090D]!";

  return (
    <div className="flex w-full flex-col gap-1 text-left">
      <p className="text-error-700 text-sm leading-5">
        <span>Amount is higher than {label}. Please </span>
        <Anchor
          component="button"
          type="button"
          onClick={onUploadClick}
          size="sm"
          underline="always"
          className={linkClassName}
        >
          Upload a proof of fund
        </Anchor>
      </p>
      <p className="text-error-700 text-sm leading-5">
        <span>Need help? You can </span>
        {templateUrl ? (
          <Anchor
            href={templateUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            size="sm"
            underline="always"
            className={linkClassName}
          >
            Download our Proof of Funds Template
          </Anchor>
        ) : (
          <Anchor
            component="button"
            type="button"
            onClick={handleTemplateDownload}
            size="sm"
            underline="always"
            className={linkClassName}
          >
            Download our Proof of Funds Template
          </Anchor>
        )}
        <span>
          {" "}
          to ensure your documentation meets the necessary requirements.
        </span>
      </p>
    </div>
  );
}
