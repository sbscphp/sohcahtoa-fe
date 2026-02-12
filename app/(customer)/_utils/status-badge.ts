import type { CSSProperties } from "react";

/**
 * Status badge colors by status key (normalized lowercase).
 * Success/50 bg, Success/700 text per design.
 */
const STATUS_COLORS: Record<string, { bg: string; textColor: string }> = {
  approved: { bg: "#ECFDF3", textColor: "#027A48" },
  success: { bg: "#ECFDF3", textColor: "#027A48" },
  completed: { bg: "#ECFDF3", textColor: "#027A48" },
  pending: { bg: "#FEF3C7", textColor: "#B45309" },
  in_progress: { bg: "#EFF6FF", textColor: "#1D4ED8" },
  rejected: { bg: "#FEF2F2", textColor: "#B91C1C" },
  failed: { bg: "#FEF2F2", textColor: "#B91C1C" },
  // Detail page display statuses
  under_review: { bg: "#D1FADF", textColor: "#027A48" },
  awaiting_disbursement: { bg: "#1D4ED8", textColor: "#FFFFFF" },
  transaction_settled: { bg: "#D1FADF", textColor: "#027A48" },
  settled: { bg: "#D1FADF", textColor: "#027A48" },
  resubmit_document: { bg: "#F4E8FF", textColor: "#7C3AED" },
};

function normalizeStatus(status: string): string {
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
 * Returns style object for a status badge pill (div). Pass to a wrapper div.
 * Design: flex center, padding 2px 8px, height 20px, rounded 16px,
 * IBM Plex Sans 500 12px, letter-spacing 0.04px. Width fits content.
 */
export function getStatusBadge(status: string): CSSProperties {
  const { bg, textColor } = getStatusColor(status);
  return {
    display: "inline-flex",
    width: "fit-content",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: "2px 8px",
    height: 20,
    background: bg,
    borderRadius: 16,
    fontFamily: "'IBM Plex Sans', sans-serif",
    fontWeight: 500,
    fontSize: 12,
    lineHeight: "16px",
    textAlign: "center",
    letterSpacing: "0.04px",
    color: textColor,
    flex: "none",
    flexGrow: 0,
  };
}
