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
  AWAITING_DISBURSEMENT: "Awaiting disbursement",
} as const;

export type TransactionStatus = keyof typeof TRANSACTION_STATUS_LABELS;

export function normalizeTransactionStatus(raw: string | null | undefined): string {
  return (raw ?? "").trim().toUpperCase();
}

/** Terminal transaction statuses — no document upload or resubmit. */
const DOCUMENT_UPLOAD_BLOCKED_STATUSES = new Set([
  "REJECTED",
  "COMPLETED",
  "CANCELLED",
]);

/** Whether the customer may upload missing docs or resubmit on this transaction. */
export function transactionAllowsDocumentUpload(
  status: string | null | undefined,
): boolean {
  const normalized = normalizeTransactionStatus(status);
  if (!normalized) return false;
  return !DOCUMENT_UPLOAD_BLOCKED_STATUSES.has(normalized);
}

/** @deprecated Use `transactionAllowsDocumentUpload` — kept for call sites. */
export function transactionAllowsMissingDocumentUpload(
  status: string | null | undefined,
): boolean {
  return transactionAllowsDocumentUpload(status);
}

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
