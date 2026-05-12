"use client";

import { Anchor } from "@mantine/core";

function formatUsdThreshold(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export interface ProofOfFundPromptProps {
  /** When true, shows the message and upload link. */
  show: boolean;
  onUploadClick: () => void;
  /** USD threshold for the copy (e.g. 4000 for PTA/BTA, 10000 for school fees). */
  thresholdUsd?: number;
}

/**
 * Shown when transaction amount (USD) meets or exceeds the flow threshold.
 * Prompts user to upload proof of fund; clicking the link typically opens ProofOfFundModal.
 */
export default function ProofOfFundPrompt({
  show,
  onUploadClick,
  thresholdUsd = 10_000,
}: Readonly<ProofOfFundPromptProps>) {
  if (!show) return null;

  const label = formatUsdThreshold(thresholdUsd);

  return (
    <div className="text-body-text-200 text-sm text-right">
      <span>Amount is {label} or above. Please </span>
      <Anchor
        component="button"
        type="button"
        onClick={onUploadClick}
        size="sm"
        underline="always"
      >
        Upload a proof of fund
      </Anchor>
    </div>
  );
}
