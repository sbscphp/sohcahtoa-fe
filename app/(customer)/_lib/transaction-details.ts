/**
 * Transaction type / display name come from the API.
 * Do not derive or map transaction type labels on the frontend.
 */

export type DetailViewStatus = "under_review" | "awaiting_disbursement" | "transaction_settled" | "approved" | "rejected";

/**
 * Derives which detail view to show from stage/status.
 * - Under Review: only Transaction Details + Required Documents; show "View Updates".
 * - Awaiting Disbursement: above + Payment Details; show "View Updates".
 * - Transaction Settled: all four sections; show "Download Receipt".
 */
export function getDetailViewStatus(
  stage: string,
  status: string
): DetailViewStatus {
  const stageLower = stage.trim().toLowerCase();
  const statusLower = status.trim().toLowerCase();
  
  // Check for explicit admin actions first
  if (statusLower === "rejected" || statusLower.includes("reject")) {
    return "rejected";
  }
  if (statusLower === "approved" && !stageLower.includes("settlement")) {
    return "approved";
  }
  
  if (
    stageLower.includes("settlement") ||
    statusLower === "completed"
  ) {
    return "transaction_settled";
  }
  if (
    stageLower.includes("disbursement") ||
    stageLower.includes("awaiting")
  ) {
    return "awaiting_disbursement";
  }
  return "under_review";
}

const DETAIL_VIEW_STATUS_LABELS: Record<DetailViewStatus, string> = {
  under_review: "Under Review",
  awaiting_disbursement: "Awaiting Disbursement",
  transaction_settled: "Transaction Settled",
  approved: "Request Approved",
  rejected: "Request Rejected",
};

export function getDetailViewStatusLabel(viewStatus: DetailViewStatus): string {
  return DETAIL_VIEW_STATUS_LABELS[viewStatus];
}
