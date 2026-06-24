export function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : fallback;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

export function formatCreatedAt(createdAt: string): {
  dateCreated: string;
  timeCreated: string;
} {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) {
    return { dateCreated: "--", timeCreated: "--" };
  }
  return {
    dateCreated: date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    timeCreated: date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
  };
}

export function formatLedgerDateTime(createdAt: string): { date: string; time: string } {
  const { dateCreated, timeCreated } = formatCreatedAt(createdAt);
  return { date: dateCreated, time: timeCreated };
}

export type LedgerMatchDisplayStatus = "Matched" | "Unmatched";

export function normalizeMatchStatus(
  value: string | null | undefined
): LedgerMatchDisplayStatus {
  if (!value) return "Unmatched";
  return value.toLowerCase() === "matched" ? "Matched" : "Unmatched";
}

export function formatApiStatusLabel(value: string | null | undefined): string {
  const source = value?.trim();
  if (!source) return "--";
  return source
    .replace(/[_-]+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function mapLedgerType(type: "DEBIT" | "CREDIT"): "Debit" | "Credit" {
  return type === "CREDIT" ? "Credit" : "Debit";
}

const INVALID_LINK_TRANSACTION_STATUSES = new Set([
  "cancelled",
  "rejected",
  "declined",
]);

/** FX transactions in these states should not be linked (or warrant re-linking). */
export function isLinkableTransactionStatus(
  status: string | null | undefined
): boolean {
  const normalized = status?.trim().toLowerCase();
  if (!normalized) return true;
  return !INVALID_LINK_TRANSACTION_STATUSES.has(normalized);
}

export function isInvalidLinkedTransactionStatus(
  status: string | null | undefined
): boolean {
  if (!status?.trim()) return false;
  return !isLinkableTransactionStatus(status);
}

function hasLedgerWorkflowStatus(value: string | null | undefined): boolean {
  return Boolean(value?.trim());
}

export function hasActiveLedgerLink(
  linkedTransactionId: string | null | undefined
): boolean {
  return Boolean(linkedTransactionId?.trim());
}

export type LedgerLinkedTransactionRef = {
  id?: string | null;
  status?: string | null;
} | null | undefined;

/** Entry is associated with an FX transaction via id and/or `linkedTransaction` payload. */
export function hasLedgerLinkedTransaction(
  linkedTransactionId: string | null | undefined,
  linkedTransaction: LedgerLinkedTransactionRef
): boolean {
  if (hasActiveLedgerLink(linkedTransactionId)) return true;
  return Boolean(linkedTransaction?.id?.trim());
}

/**
 * Link when there is no active `linkedTransactionId` and any `linkedTransaction`
 * snapshot is not in a terminal state (cancelled / rejected / declined).
 */
export function canLinkLedgerEntry(
  linkedTransactionId: string | null | undefined,
  linkedTransaction: LedgerLinkedTransactionRef
): boolean {
  if (hasActiveLedgerLink(linkedTransactionId)) return false;

  if (linkedTransaction?.id?.trim()) {
    return isLinkableTransactionStatus(linkedTransaction.status);
  }

  return true;
}

/** Unlink clears an active link before payout/refund workflows start. */
export function canUnlinkLedgerEntry(
  linkedTransactionId: string | null | undefined,
  refundStatus: string | null | undefined,
  disbursementStatus: string | null | undefined
): boolean {
  return (
    hasActiveLedgerLink(linkedTransactionId) &&
    !hasLedgerWorkflowStatus(refundStatus) &&
    !hasLedgerWorkflowStatus(disbursementStatus)
  );
}

/** Disburse only on an actively linked credit with a valid FX transaction. */
export function canDisburseLedgerEntry(
  linkedTransactionId: string | null | undefined,
  isCreditEntry: boolean,
  linkedTransactionStatus: string | null | undefined,
  disbursementStatus: string | null | undefined
): boolean {
  return (
    hasActiveLedgerLink(linkedTransactionId) &&
    isCreditEntry &&
    isLinkableTransactionStatus(linkedTransactionStatus) &&
    !hasLedgerWorkflowStatus(disbursementStatus)
  );
}

/** Refund applies to actively linked credits without a refund workflow yet. */
export function canRefundLedgerEntry(
  linkedTransactionId: string | null | undefined,
  isCreditEntry: boolean,
  refundStatus: string | null | undefined
): boolean {
  return (
    hasActiveLedgerLink(linkedTransactionId) &&
    isCreditEntry &&
    !hasLedgerWorkflowStatus(refundStatus)
  );
}
