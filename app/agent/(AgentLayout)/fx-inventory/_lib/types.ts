/** UI models for the agent FX Inventory page. Shapes follow the design until the backend responses are final. */

export type InventoryTabValue =
  | "position"
  | "transactions"
  | "pending-settlements"
  | "reconciliation"
  | "history"
  | "cash-lodgement";

export interface InventoryPositionRow {
  currency: string;
  openingBalance: number;
  receivedFromAdmin: number | null;
  purchasedFromCustomers: number | null;
  soldToCustomers: number | null;
  lodgedToHq: number | null;
  adjustments: number;
  closingBalance: number;
  physicalCount: number;
  variance: number;
}

export interface InventoryPositionTotals {
  currency: string;
  openingBalance: number;
  receivedFromAdmin: number;
  purchasedFromCustomers: number;
  soldToCustomers: number;
  lodgedToHq: number;
  adjustments: number;
  closingBalance: number;
  physicalCount: number;
  variance: number;
}

export interface InventoryTransaction {
  id: string;
  customerName: string;
  transactionType: string;
  currencyPair: string;
  /** Signed foreign amount: negative = FX out, positive = FX in. */
  fxAmount: number;
  currency: string;
  rate: number;
  ngnAmount: number;
  date: string;
}

export type SettlementStatus = "Pending" | "Overdue" | "Settled";

export interface PendingSettlement {
  id: string;
  customerName: string;
  transactionType: string;
  currencyPair: string;
  fxAmount: number;
  currency: string;
  ngnAmountOwed: number;
  date: string;
  status: SettlementStatus;
}

export type ReconciliationStatus = "Needs Review" | "Reconciled";

export interface ReconciliationRow {
  currency: string;
  systemClosingBalance: number;
  physicalCount: number;
  variance: number;
  variancePercent: number;
  status: ReconciliationStatus;
  lastUpdated: string;
}

export interface InventoryHistoryEntry {
  id: string;
  transactionId: string;
  currency: string;
  amount: number;
  balanceAfter: number;
  date: string;
}

export type LodgementStatus = "Confirmed" | "Pending Verification" | "Needs Review";

export interface CashLodgement {
  id: string;
  currency: string;
  declaredAmount: number;
  amountReceived: number | null;
  variance: number | null;
  status: LodgementStatus;
  submittedAt: string;
}

export interface CashDisbursementNotice {
  id: string;
  agentName: string;
  currency: string;
  amount: number;
  reference: string;
  purpose: string;
  disbursedBy: string;
  disbursedAt: string;
}

export interface InventorySummary {
  availableFxInventory: number;
  ngnCashAvailable: number;
  pendingSettlements: number;
  inventoryVariance: number;
}
