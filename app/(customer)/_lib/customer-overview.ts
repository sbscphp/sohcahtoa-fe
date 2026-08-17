import type { TransactionDetailComment } from "@/app/_lib/api/types";
import { normalizeTransactionStatus } from "@/app/(customer)/_lib/transaction-details";

/** Customer-facing overview statuses from the outstanding-functionalities review. */
export type CustomerOverviewStatus =
  | "Approved"
  | "Rejected"
  | "Pending"
  | "Document re-upload";

const APPROVED_STATUSES = new Set([
  "APPROVED",
  "AWAITING_DEPOSIT",
  "DEPOSIT_PENDING",
  "DEPOSIT_CONFIRMED",
  "DISBURSEMENT_IN_PROGRESS",
  "AWAITING_DISBURSEMENT",
  "COMPLETED",
]);

const REJECTED_STATUSES = new Set(["REJECTED", "CANCELLED"]);

/** Statuses where the sheet shows Proceed to Payment for customers. */
const PAYMENT_AVAILABLE_STATUSES = new Set([
  "APPROVED",
  "AWAITING_DEPOSIT",
  "DEPOSIT_PENDING",
]);

export function isCustomerDocumentReuploadAction(action: string | null | undefined): boolean {
  const normalized = (action ?? "").trim().toUpperCase();
  if (!normalized) return false;
  return (
    normalized.includes("MORE_INFO") ||
    normalized.includes("RESUBMIT") ||
    normalized.includes("REUPLOAD") ||
    normalized.includes("RE_UPLOAD") ||
    normalized.includes("REQUEST_INFO") ||
    (normalized.includes("REQUEST") && normalized.includes("INFO"))
  );
}

/** Only re-upload / request-more-info comments are safe to show customers. */
export function isCustomerVisibleComment(comment: TransactionDetailComment): boolean {
  return isCustomerDocumentReuploadAction(comment.action);
}

export function filterCustomerVisibleComments(
  comments: TransactionDetailComment[] | undefined
): TransactionDetailComment[] {
  return (comments ?? []).filter(isCustomerVisibleComment);
}

export function hasCustomerDocumentReuploadRequest(
  comments: TransactionDetailComment[] | undefined,
  documentStatuses: string[] | undefined = []
): boolean {
  if (filterCustomerVisibleComments(comments).length > 0) return true;
  return (documentStatuses ?? []).some((status) => {
    const normalized = status.trim().toLowerCase();
    return (
      normalized.includes("resubmit") ||
      normalized.includes("re-upload") ||
      normalized.includes("reupload") ||
      normalized.includes("more info") ||
      normalized.includes("request more")
    );
  });
}

export function getCustomerOverviewStatusLabel(
  status: string | null | undefined,
  options?: { hasDocumentReuploadRequest?: boolean }
): CustomerOverviewStatus {
  if (options?.hasDocumentReuploadRequest) return "Document re-upload";

  const normalized = normalizeTransactionStatus(status);
  if (REJECTED_STATUSES.has(normalized)) return "Rejected";
  if (APPROVED_STATUSES.has(normalized)) return "Approved";
  return "Pending";
}

/** Same gate as OverviewDetail payment CTA (when `onProceedToPayment` is wired). */
export function customerCanProceedToPayment(status: string | null | undefined): boolean {
  return PAYMENT_AVAILABLE_STATUSES.has(normalizeTransactionStatus(status));
}
