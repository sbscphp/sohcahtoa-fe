import { describe, expect, it } from "vitest";
import type { TransactionListItem } from "@/app/_lib/api/types";
import {
  normalizeBalances,
  normalizeDisbursements,
  normalizeLodgements,
  normalizeTransactions,
} from "../normalize";

/** Shapes captured from the dev API (agent fx-inventory and agent transactions list). */
describe("fx-inventory normalisers", () => {
  it("maps a real lodgment row", () => {
    const rows = normalizeLodgements([
      {
        id: "ec4253b1",
        referenceNumber: "FXL-1",
        currency: "USD",
        statedAmount: 12000,
        confirmedAmount: null,
        varianceAmount: null,
        notes: "Please review",
        status: "PENDING_VERIFICATION",
        submittedAt: "2026-11-06T09:39:16.542Z",
        decisionReason: null,
      },
    ]);
    expect(rows).toEqual([
      {
        id: "ec4253b1",
        currency: "USD",
        declaredAmount: 12000,
        amountReceived: null,
        variance: null,
        status: "Pending Verification",
        submittedAt: "2026-11-06T09:39:16.542Z",
      },
    ]);
  });

  it("reads disbursement dates and treats an agent-rejected receipt as Rejected, not awaiting", () => {
    const base = {
      currency: "NGN",
      amount: 10000,
      purpose: "Test 1",
      initiatedBy: "ffffffff-0000-0000-0000-000000000001",
      initiatedAt: "2026-11-12T10:57:21.871Z",
      canConfirmReceipt: true,
    };
    const [pending, rejected, completed] = normalizeDisbursements([
      { ...base, id: "a", referenceNumber: "FXD-A", status: "APPROVED", receiptRejectedAt: null },
      {
        ...base,
        id: "b",
        referenceNumber: "FXD-B",
        status: "APPROVED",
        receiptRejectedAt: "2026-11-12T11:27:12.991Z",
        receiptRejectionReason: "Done",
      },
      {
        ...base,
        id: "c",
        referenceNumber: "FXD-C",
        status: "COMPLETED",
        canConfirmReceipt: false,
        receiptConfirmedAt: "2026-11-12T11:01:56.847Z",
      },
    ]);

    expect(pending).toMatchObject({ status: "Pending", awaitingConfirmation: true, date: base.initiatedAt, resolvedAt: null });
    expect(rejected).toMatchObject({ status: "Rejected", awaitingConfirmation: false, resolvedAt: "2026-11-12T11:27:12.991Z" });
    expect(completed).toMatchObject({ status: "Confirmed", awaitingConfirmation: false, resolvedAt: "2026-11-12T11:01:56.847Z" });
    // initiatedBy is only a user id, so no name is shown.
    expect(pending.disbursedBy).toBe("—");
  });

  it("handles empty balances and disbursements", () => {
    expect(normalizeBalances([])).toEqual({});
    expect(normalizeDisbursements([])).toEqual([]);
  });

  it("maps agent transactions list rows (snake_case, mode SELL/BUY)", () => {
    const items = [
      {
        transaction_id: "6d382b61",
        transaction_date: "2026-09-23T12:51:41.328Z",
        transaction_type: "RESIDENT_FX",
        transaction_status: "AWAITING_VERIFICATION",
        referenceNumber: "TXN-1",
        currency: "EUR",
        foreignAmount: "10001",
        mode: "SELL",
        customer_email: "ch*********@yopmail.com",
      },
      {
        transaction_id: "3d8cea17",
        transaction_date: "2026-09-16T19:30:40.620Z",
        transaction_type: "PTA",
        transaction_status: "COMPLETED",
        referenceNumber: "TXN-2",
        currency: "USD",
        foreignAmount: "123",
        mode: "BUY",
      },
    ] as unknown as TransactionListItem[];

    const [sell, buy] = normalizeTransactions(items);
    expect(sell).toMatchObject({ id: "TXN-1", fxAmount: 10001, transactionType: "Sell FX", currencyPair: "EUR-NGN", status: "Overdue" });
    expect(sell.date).toBe("2026-09-23T12:51:41.328Z");
    expect(buy).toMatchObject({ id: "TXN-2", fxAmount: -123, transactionType: "PTA", status: "Settled" });
  });
});
