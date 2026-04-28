/**
 * Transaction type / display name come from the API.
 * Do not derive or map transaction type labels on the frontend.
 */

export type DetailViewStatus =
  | "under_review"
  | "awaiting_disbursement"
  | "disbursement_in_progress"
  | "transaction_settled"
  | "approved"
  | "rejected"
  | "deposit_confirmed"
  | "compliance_review";

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
  /** Agent records outbound disbursement; show same overview card as approved + Record Disbursement. */
  if (statusLower === "disbursement_in_progress") {
    return "disbursement_in_progress";
  }
  if (statusLower === "approved" && !stageLower.includes("settlement")) {
    return "approved";
  }

  if (stageLower.includes("settlement") || statusLower === "completed") {
    return "transaction_settled";
  }
  if (stageLower.includes("disbursement") || statusLower.includes("awaiting")) {
    return "awaiting_disbursement";
  }
  if (
    stageLower.includes("deposit_confirmation") ||
    statusLower.includes("deposit_confirmed")
  ) {
    return "deposit_confirmed";
  }
  if (stageLower.includes("deposit_info") || statusLower.includes("awaiting_deposit")) {
    return "disbursement_in_progress";
  }
  if (stageLower.includes("document_upload") || statusLower.includes("compliance_review")) {
    return "compliance_review";
  }
  return "under_review";
}

const DETAIL_VIEW_STATUS_LABELS: Record<DetailViewStatus, string> = {
  under_review: "Under Review",
  awaiting_disbursement: "Awaiting Disbursement",
  disbursement_in_progress: "Disbursement in progress",
  transaction_settled: "Transaction Settled",
  approved: "Request Approved",
  rejected: "Request Rejected",
  deposit_confirmed: "Deposit Confirmed",
  compliance_review: "Compliance Review",
};

export function getDetailViewStatusLabel(viewStatus: DetailViewStatus): string {
  return DETAIL_VIEW_STATUS_LABELS[viewStatus];
}

/**
 * Title for the transaction sheet overview (above the comment timeline).
 * Prefer API `status` / `currentStep` when they carry clearer meaning than `viewStatus` alone.
 */
export function getTransactionOverviewTimelineTitle(
  viewStatus: DetailViewStatus,
  options?: { stage?: string | null; status?: string | null }
): string {
  const statusU = (options?.status ?? "").trim().toUpperCase();
  const stageU = (options?.stage ?? "").trim().toUpperCase();

  if (statusU === "DISBURSEMENT_IN_PROGRESS") {
    return "Disbursement in progress";
  }
  if (
    statusU.includes("DEPOSIT") &&
    (statusU.includes("CONFIRM") || statusU.includes("CONFIRMED"))
  ) {
    return getDetailViewStatusLabel("deposit_confirmed");
  }
  if (
    stageU.includes("DEPOSIT") &&
    (stageU.includes("CONFIRM") || stageU.includes("CONFIRMATION"))
  ) {
    return getDetailViewStatusLabel("deposit_confirmed");
  }
  return getDetailViewStatusLabel(viewStatus);
}
