/**
 * Transaction type.
 */

export const TRANSACTION_STATUS_LABELS = {
  DRAFT: "Draft",
  AWAITING_VERIFICATION: "Awaiting verification",
  VERIFICATION_IN_PROGRESS: "Verification in progress",
  VERIFICATION_COMPLETED: "Verification completed",
  AWAITING_DEPOSIT: "Awaiting deposit",
  DEPOSIT_PENDING: "Deposit pending",
  DEPOSIT_CONFIRMED: "Deposit confirmed",
  COMPLIANCE_REVIEW: "Compliance review",
  ADMIN_APPROVAL_PENDING: "Admin approval pending",
  APPROVED: "Approved",
  DISBURSEMENT_IN_PROGRESS: "Disbursement in progress",
  PENDING_RECORD_VALIDATION: "Pending record validation",
  COMPLETED: "Completed",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
} as const;

export type TransactionStatus = keyof typeof TRANSACTION_STATUS_LABELS;

export function normalizeTransactionStatus(raw: string | null | undefined): string {
  return (raw ?? "").trim().toUpperCase();
}

/** Label for badges, timeline titles, etc. Title-cases unknown API values. */
export function getTransactionStatusLabel(status: string | null | undefined): string {
  const key = normalizeTransactionStatus(status) as TransactionStatus;
  if (key && key in TRANSACTION_STATUS_LABELS) {
    return TRANSACTION_STATUS_LABELS[key];
  }
  const s = (status ?? "").trim();
  if (!s) return s;
  return s
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
