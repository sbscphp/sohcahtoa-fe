"use client";

import { Anchor } from "@mantine/core";

export interface ProofOfFundPromptProps {
  /** When true, shows the message and upload link. */
  show: boolean;
  onUploadClick: () => void;
}

/**
 * Shown when transaction amount (USD) is $10,000 or above.
 * Prompts user to upload proof of fund; clicking the link typically opens ProofOfFundModal.
 */
export default function ProofOfFundPrompt({
  show,
  onUploadClick,
}: Readonly<ProofOfFundPromptProps>) {
  if (!show) return null;

  return (
    <div className="text-body-text-200 text-sm text-right">
      <span>Amount is $10,000 or above. Please </span>
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
