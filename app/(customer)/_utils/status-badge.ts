import type { CSSProperties } from "react";

/**
 * Status badge colors by status key (normalized lowercase).
 * Align keys with `normalizeStatus(getTransactionStatusLabel(...))` (lowercase + underscores).
 */
const STATUS_COLORS: Record<string, { bg: string; textColor: string }> = {
  open: { bg: "#ECFDF3", textColor: "#027A48" },
  closed: { bg: "#FEF2F2", textColor: "#B91C1C" },
  approved: { bg: "#ECFDF3", textColor: "#027A48" },
  verified: { bg: "#ECFDF3", textColor: "#027A48" },
  success: { bg: "#ECFDF3", textColor: "#027A48" },
  completed: { bg: "#ECFDF3", textColor: "#027A48" },
  pending: { bg: "#FEF3C7", textColor: "#B45309" },
  in_progress: { bg: "#EFF6FF", textColor: "#1D4ED8" },
  rejected: { bg: "#FEF2F2", textColor: "#B91C1C" },
  failed: { bg: "#FEF2F2", textColor: "#B91C1C" },
  // API transaction statuses (see TRANSACTION_STATUS_LABELS)
  draft: { bg: "#F3F4F6", textColor: "#4D4B4B" },
  awaiting_verification: { bg: "#FEF3C7", textColor: "#B45309" },
  verification_in_progress: { bg: "#EFF6FF", textColor: "#1D4ED8" },
  verification_completed: { bg: "#ECFDF3", textColor: "#027A48" },
  awaiting_deposit: { bg: "#FEF3C7", textColor: "#B45309" },
  deposit_pending: { bg: "#FEF3C7", textColor: "#B45309" },
  deposit_confirmed: { bg: "#ECFDF3", textColor: "#027A48" },
  compliance_review: { bg: "#F4E8FF", textColor: "#7C3AED" },
  admin_approval_pending: { bg: "#FEF3C7", textColor: "#B45309" },
  disbursement_in_progress: { bg: "#EFF6FF", textColor: "#1D4ED8" },
  pending_record_validation: { bg: "#FEF3C7", textColor: "#B45309" },
  cancelled: { bg: "#F3F4F6", textColor: "#6B7280" },

  under_review: { bg: "#D1FADF", textColor: "#027A48" },
  awaiting_disbursement: { bg: "#1D4ED8", textColor: "#FFFFFF" },
  transaction_settled: { bg: "#D1FADF", textColor: "#027A48" },
  settled: { bg: "#D1FADF", textColor: "#027A48" },
  resubmit_document: { bg: "#F4E8FF", textColor: "#7C3AED" },
  request_more_info: { bg: "#F4E8FF", textColor: "#7C3AED" },
  requires_manual_review: { bg: "#F4E8FF", textColor: "#7C3AED" },
};

export function normalizeStatus(status: string): string {
  return status.trim().toLowerCase().replace(/\s+/g, "_");
}

/**
 * Returns background and text color for a status. Use for custom UI or with getStatusBadge.
 */
export function getStatusColor(status: string): { bg: string; textColor: string } {
  const key = normalizeStatus(status);
  return (
    STATUS_COLORS[key] ?? {
      bg: "#F3F4F6",
      textColor: "#4D4B4B",
    }
  );
}

/**
 * Style object for a status pill. At most two lines, then ellipsis (…).
 */
export function getStatusBadge(status: string): CSSProperties {
  const { bg, textColor } = getStatusColor(status);
  return {
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 2,
    overflow: "hidden",
    textOverflow: "ellipsis",
    boxSizing: "border-box",
    width: "fit-content",
    maxWidth: "100%",
    padding: "4px 8px",
    background: bg,
    borderRadius: 16,
    fontFamily: "'IBM Plex Sans', sans-serif",
    fontWeight: 500,
    fontSize: 12,
    lineHeight: "16px",
    textAlign: "center",
    letterSpacing: "0.04px",
    color: textColor,
    wordBreak: "break-word",
  };
}
