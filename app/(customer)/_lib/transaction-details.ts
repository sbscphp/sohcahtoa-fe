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

/** Label for badges, timeline titles, etc. Title-cases unknown API values. */
/** Transaction statuses where customer may upload docs that were never submitted (`uploaded: null`). */
const MISSING_DOCUMENT_UPLOAD_STATUSES = new Set([
  "DRAFT",
  "AWAITING_VERIFICATION",
  "VERIFICATION_IN_PROGRESS",
  "REJECTED",
]);

export function transactionAllowsMissingDocumentUpload(
  status: string | null | undefined,
): boolean {
  return MISSING_DOCUMENT_UPLOAD_STATUSES.has(normalizeTransactionStatus(status));
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
