/**
 * Shared mock transaction list used by the transactions table and detail page
 * so that overview and documentation match the same row (id, type, stage, status).
 */

export interface TableTransaction {
  id: string;
  date: string;
  type: string;
  stage: string;
  status: "Pending" | "Completed" | "Rejected" | "Request More Info" | "Approved";
  transaction_type: "Buy FX" | "Sell FX" | "Receive FX";
}

/** Map table type code to display label for detail header and sheet */
export function getTransactionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    PTA: "Personal Travel Allowance (PTA)",
    BTA: "Business Travel Allowance (BTA)",
    Medical: "Medical",
    "Professional Body Fee": "Professional Body Fee",
    Tourist: "Tourist",
    "School Fees": "School Fees",
    IMTO: "IMTO",
  };
  return labels[type] ?? type;
}

export const MOCK_TRANSACTIONS: TableTransaction[] = [
  // Clear examples for sheet Overview: Approved (Documentation + Approved) and Rejected (Documentation + Rejected)
  { id: "GHA67AGHA0", date: "2025-11-17T10:00:00", type: "PTA", stage: "Documentation", status: "Approved", transaction_type: "Buy FX" },
  { id: "GHA67AGHA1", date: "2025-11-16T11:00:00", type: "PTA", stage: "Documentation", status: "Pending", transaction_type: "Buy FX" },
  { id: "GHA67AGHA2", date: "2025-11-15T14:30:00", type: "BTA", stage: "Transaction Settlement", status: "Completed", transaction_type: "Buy FX" },
  { id: "GHA67AGHA3", date: "2025-11-14T09:15:00", type: "Medical", stage: "Awaiting Disbursement", status: "Request More Info", transaction_type: "Sell FX" },
  { id: "GHA67AGHA4", date: "2025-11-13T16:45:00", type: "Professional Body Fee", stage: "Documentation", status: "Rejected", transaction_type: "Buy FX" }, // Rejected overview in sheet
  { id: "GHA67AGHA5", date: "2025-11-12T10:20:00", type: "Tourist", stage: "Transaction Settlement", status: "Approved", transaction_type: "Receive FX" },
  { id: "GHA67AGHA6", date: "2025-11-11T13:10:00", type: "School Fees", stage: "Awaiting Disbursement", status: "Pending", transaction_type: "Buy FX" },
  { id: "GHA67AGHA7", date: "2025-11-10T15:30:00", type: "IMTO", stage: "Documentation", status: "Completed", transaction_type: "Sell FX" },
  { id: "GHA67AGHA8", date: "2025-11-09T11:45:00", type: "PTA", stage: "Transaction Settlement", status: "Approved", transaction_type: "Buy FX" },
  { id: "GHA67AGHA9", date: "2025-11-08T08:20:00", type: "BTA", stage: "Documentation", status: "Pending", transaction_type: "Receive FX" },
  { id: "GHA67AGHA10", date: "2025-11-07T12:15:00", type: "Medical", stage: "Transaction Settlement", status: "Completed", transaction_type: "Buy FX" },
  { id: "GHA67AGHA11", date: "2025-11-06T14:45:00", type: "Professional Body Fee", stage: "Awaiting Disbursement", status: "Request More Info", transaction_type: "Sell FX" },
  { id: "GHA67AGHA12", date: "2025-11-05T10:30:00", type: "Tourist", stage: "Documentation", status: "Rejected", transaction_type: "Buy FX" },
  { id: "GHA67AGHA13", date: "2025-11-04T16:20:00", type: "School Fees", stage: "Transaction Settlement", status: "Approved", transaction_type: "Receive FX" },
  { id: "GHA67AGHA14", date: "2025-11-03T09:10:00", type: "IMTO", stage: "Awaiting Disbursement", status: "Pending", transaction_type: "Buy FX" },
  { id: "GHA67AGHA15", date: "2025-11-02T13:40:00", type: "PTA", stage: "Documentation", status: "Completed", transaction_type: "Sell FX" },
  { id: "GHA67AGHA16", date: "2025-11-01T11:25:00", type: "BTA", stage: "Transaction Settlement", status: "Approved", transaction_type: "Buy FX" },
  { id: "GHA67AGHA17", date: "2025-10-31T15:50:00", type: "Medical", stage: "Documentation", status: "Pending", transaction_type: "Receive FX" },
  { id: "GHA67AGHA18", date: "2025-10-30T08:35:00", type: "Professional Body Fee", stage: "Awaiting Disbursement", status: "Request More Info", transaction_type: "Buy FX" },
  { id: "GHA67AGHA19", date: "2025-10-29T12:55:00", type: "Tourist", stage: "Transaction Settlement", status: "Rejected", transaction_type: "Sell FX" },
  { id: "GHA67AGHA20", date: "2025-10-28T10:15:00", type: "School Fees", stage: "Documentation", status: "Completed", transaction_type: "Buy FX" },
  { id: "GHA67AGHA21", date: "2025-10-27T14:20:00", type: "IMTO", stage: "Awaiting Disbursement", status: "Approved", transaction_type: "Receive FX" },
  { id: "GHA67AGHA22", date: "2025-10-26T09:45:00", type: "PTA", stage: "Transaction Settlement", status: "Pending", transaction_type: "Buy FX" },
  { id: "GHA67AGHA23", date: "2025-10-25T16:10:00", type: "BTA", stage: "Documentation", status: "Completed", transaction_type: "Sell FX" },
  { id: "GHA67AGHA24", date: "2025-10-24T11:30:00", type: "Medical", stage: "Transaction Settlement", status: "Request More Info", transaction_type: "Buy FX" },
  { id: "GHA67AGHA25", date: "2025-10-23T13:50:00", type: "Professional Body Fee", stage: "Awaiting Disbursement", status: "Rejected", transaction_type: "Receive FX" },
  { id: "GHA67AGHA26", date: "2025-10-22T08:25:00", type: "Tourist", stage: "Documentation", status: "Approved", transaction_type: "Buy FX" },
  { id: "GHA67AGHA27", date: "2025-10-21T15:40:00", type: "School Fees", stage: "Transaction Settlement", status: "Pending", transaction_type: "Sell FX" },
  { id: "GHA67AGHA28", date: "2025-10-20T10:55:00", type: "IMTO", stage: "Awaiting Disbursement", status: "Completed", transaction_type: "Buy FX" },
];

export function getTransactionById(id: string): TableTransaction | null {
  return MOCK_TRANSACTIONS.find((t) => t.id === id) ?? null;
}
