"use client";

import { Group, Stack } from "@mantine/core";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import {
  formatApiStatusLabel,
  type LedgerMatchDisplayStatus,
} from "../hooks/walletUtils";

export interface LedgerStatusBadgesProps {
  entryStatus?: string | null;
  matchDisplayStatus?: LedgerMatchDisplayStatus | null;
  isFlagged?: boolean;
  linkedTransactionStatus?: string | null;
  disbursementStatus?: string | null;
  refundStatus?: string | null;
  layout?: "inline" | "stacked";
}

function resolveBadgeColor(status: string): string | undefined {
  const normalized = status.toLowerCase();
  if (
    normalized === "flagged" ||
    normalized.includes("cancelled") ||
    normalized.includes("reversed") ||
    normalized.includes("rejected")
  ) {
    return "red";
  }
  if (normalized === "unmatched") {
    return "#B54708";
  }
  if (
    normalized === "matched" ||
    normalized.includes("completed") ||
    normalized.includes("success")
  ) {
    return "#027A48";
  }
  return undefined;
}

export default function LedgerStatusBadges({
  entryStatus,
  matchDisplayStatus,
  isFlagged = false,
  linkedTransactionStatus,
  disbursementStatus,
  refundStatus,
  layout = "inline",
}: Readonly<LedgerStatusBadgesProps>) {
  const badges: string[] = [];

  if (entryStatus?.trim()) {
    badges.push(formatApiStatusLabel(entryStatus));
  }
  if (matchDisplayStatus) {
    badges.push(matchDisplayStatus);
  }
  if (isFlagged) {
    badges.push("Flagged");
  }
  if (linkedTransactionStatus?.trim()) {
    badges.push(`Linked TX: ${formatApiStatusLabel(linkedTransactionStatus)}`);
  }
  if (disbursementStatus?.trim()) {
    badges.push(`Disbursed: ${formatApiStatusLabel(disbursementStatus)}`);
  }
  if (refundStatus?.trim()) {
    badges.push(`Refund: ${formatApiStatusLabel(refundStatus)}`);
  }

  if (badges.length === 0) return null;

  const content = badges.map((status) => (
    <StatusBadge key={status} status={status} color={resolveBadgeColor(status)} />
  ));

  if (layout === "stacked") {
    return <Stack gap={6}>{content}</Stack>;
  }

  return (
    <Group gap={6} wrap="wrap">
      {content}
    </Group>
  );
}
