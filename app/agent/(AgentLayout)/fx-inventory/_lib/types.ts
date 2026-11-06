/** UI models for the agent FX Inventory page (normalised from the API in `normalize.ts`). */

export type InventoryTabValue = "position" | "transactions" | "received" | "cash-lodgement";

export type PositionStatus = "Reconciled" | "Variance";

export interface PositionRow {
  currency: string;
  openingBalance: number | null;
  disbursedFromAdmin: number | null;
  purchasedFromCustomers: number | null;
  soldToCustomers: number | null;
  lodgedToHq: number | null;
  closingBalance: number | null;
  physicalCount: number | null;
  variance: number | null;
  status: PositionStatus;
}

export type TransactionSettlementStatus = "Pending" | "Overdue" | "Settled" | "Rejected";

export interface InventoryTransaction {
  key: string;
  id: string;
  customerName: string;
  transactionType: string;
  currencyPair: string;
  /** Signed foreign amount: positive = FX acquired from a customer, negative = FX given out. */
  fxAmount: number | null;
  currency: string;
  rate: number | null;
  ngnAmount: number | null;
  date: string;
  status: TransactionSettlementStatus;
}

export type DisbursementDisplayStatus = "Pending" | "Confirmed" | "Rejected";

export interface CashDisbursement {
  id: string;
  reference: string;
  currency: string;
  amount: number | null;
  purpose: string;
  disbursedBy: string;
  date: string;
  resolvedAt: string | null;
  status: DisbursementDisplayStatus;
  /** Admin-approved and waiting for the agent to confirm or reject receipt. */
  awaitingConfirmation: boolean;
}

export type LodgementDisplayStatus = "Confirmed" | "Pending Verification" | "Rejected";

export interface CashLodgement {
  id: string;
  currency: string;
  declaredAmount: number | null;
  amountReceived: number | null;
  variance: number | null;
  status: LodgementDisplayStatus;
  submittedAt: string;
}

export interface InventorySummary {
  availableFxInventory: number | null;
  ngnCashAvailable: number | null;
  pendingSettlements: number;
  cashLodgement: number | null;
}
