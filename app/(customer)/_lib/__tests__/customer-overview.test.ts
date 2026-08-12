import { describe, expect, it } from "vitest";
import {
  customerCanProceedToPayment,
  filterCustomerVisibleComments,
  getCustomerOverviewStatusLabel,
  hasCustomerDocumentReuploadRequest,
} from "../customer-overview";
import type { TransactionDetailComment } from "@/app/_lib/api/types";

function comment(
  partial: Partial<TransactionDetailComment> & Pick<TransactionDetailComment, "id" | "action">
): TransactionDetailComment {
  return {
    message: partial.message ?? "Please reupload",
    createdAt: partial.createdAt ?? "2026-01-01T00:00:00.000Z",
    ...partial,
  };
}

describe("customer-overview", () => {
  it("maps statuses to customer-safe labels", () => {
    expect(getCustomerOverviewStatusLabel("AWAITING_DEPOSIT")).toBe("Approved");
    expect(getCustomerOverviewStatusLabel("REJECTED")).toBe("Rejected");
    expect(getCustomerOverviewStatusLabel("COMPLIANCE_REVIEW")).toBe("Pending");
    expect(
      getCustomerOverviewStatusLabel("COMPLIANCE_REVIEW", {
        hasDocumentReuploadRequest: true,
      })
    ).toBe("Document re-upload");
  });

  it("only exposes reupload-related comments", () => {
    const comments = [
      comment({ id: "1", action: "DOCUMENT_APPROVED", message: "Looks good" }),
      comment({ id: "2", action: "REQUEST_MORE_INFO", message: "Reupload passport" }),
    ];
    expect(filterCustomerVisibleComments(comments)).toHaveLength(1);
    expect(filterCustomerVisibleComments(comments)[0]?.id).toBe("2");
  });

  it("detects reupload from document statuses", () => {
    expect(hasCustomerDocumentReuploadRequest([], ["Resubmit Document"])).toBe(true);
    expect(hasCustomerDocumentReuploadRequest([], ["Approved"])).toBe(false);
  });

  it("gates Make Payment to payable statuses", () => {
    expect(customerCanProceedToPayment("APPROVED")).toBe(true);
    expect(customerCanProceedToPayment("AWAITING_DEPOSIT")).toBe(true);
    expect(customerCanProceedToPayment("DEPOSIT_PENDING")).toBe(true);
    expect(customerCanProceedToPayment("COMPLETED")).toBe(false);
    expect(customerCanProceedToPayment("COMPLIANCE_REVIEW")).toBe(false);
  });
});
