import type {
  CashDisbursementNotice,
  CashLodgement,
  InventoryHistoryEntry,
  InventoryPositionRow,
  InventoryPositionTotals,
  InventoryTransaction,
  PendingSettlement,
  ReconciliationRow,
} from "./types";

/** Placeholder data matching the design. Replace with API responses once the endpoints are final. */

export const MOCK_POSITION_ROWS: InventoryPositionRow[] = [
  {
    currency: "USD",
    openingBalance: 20000,
    receivedFromAdmin: 10000,
    purchasedFromCustomers: 5000,
    soldToCustomers: -1000,
    lodgedToHq: -3000,
    adjustments: 0,
    closingBalance: 10000,
    physicalCount: 20000,
    variance: 0,
  },
  {
    currency: "GBP",
    openingBalance: 5000,
    receivedFromAdmin: null,
    purchasedFromCustomers: 1000,
    soldToCustomers: -1000,
    lodgedToHq: null,
    adjustments: 0,
    closingBalance: 3000,
    physicalCount: 3000,
    variance: -30,
  },
  {
    currency: "EUR",
    openingBalance: 8000,
    receivedFromAdmin: null,
    purchasedFromCustomers: 2000,
    soldToCustomers: -2000,
    lodgedToHq: null,
    adjustments: 0,
    closingBalance: 7000,
    physicalCount: 7000,
    variance: 0,
  },
];

export const MOCK_POSITION_TOTALS: InventoryPositionTotals = {
  currency: "NGN",
  openingBalance: 45135000,
  receivedFromAdmin: 5135000,
  purchasedFromCustomers: 5135000,
  soldToCustomers: -5000000,
  lodgedToHq: -5135000,
  adjustments: 0,
  closingBalance: 5135000,
  physicalCount: 5135000,
  variance: -50000,
};

export const MOCK_TRANSACTIONS: InventoryTransaction[] = [
  { id: "LDG-55218", customerName: "Lodgment to HQ", transactionType: "Lodged to HQ", currencyPair: "USD", fxAmount: -1000, currency: "USD", rate: 1435, ngnAmount: 1380000, date: "2025-11-16T11:00:00" },
  { id: "TXN-55218", customerName: "Eberechi Saka", transactionType: "Sell FX", currencyPair: "USD-NGN", fxAmount: 1000, currency: "USD", rate: 1438, ngnAmount: 1380000, date: "2025-11-21T16:30:00" },
  { id: "TXN-55218", customerName: "Noni Nwaneri", transactionType: "School fees", currencyPair: "EUR-NGN", fxAmount: -1000, currency: "EUR", rate: 1425, ngnAmount: 1380000, date: "2025-11-17T12:30:00" },
  { id: "LDG-55218", customerName: "Lodgment to HQ", transactionType: "Lodged to HQ", currencyPair: "JPY", fxAmount: -1000, currency: "EUR", rate: 1358, ngnAmount: 1380000, date: "2025-11-20T09:00:00" },
  { id: "TXN-55218", customerName: "Mikel Osimhen", transactionType: "Sell FX", currencyPair: "USD-NGN", fxAmount: 1000, currency: "USD", rate: 1435, ngnAmount: 1380000, date: "2025-11-22T10:00:00" },
  { id: "TXN-55218", customerName: "Chloe Kelly", transactionType: "BTA", currencyPair: "CAD-NGN", fxAmount: -1200, currency: "USD", rate: 1501, ngnAmount: 1380000, date: "2025-11-19T15:45:00" },
  { id: "TXN-55218", customerName: "Samuel Franklin", transactionType: "School fees", currencyPair: "EUR-NGN", fxAmount: -1000, currency: "EUR", rate: 1430, ngnAmount: 1380000, date: "2025-11-18T14:15:00" },
  { id: "TXN-55218", customerName: "Expatriate", transactionType: "Sell FX", currencyPair: "USD-NGN", fxAmount: 1000, currency: "USD", rate: 1433, ngnAmount: 1380000, date: "2025-11-16T11:00:00" },
];

export const MOCK_TRANSACTION_STATS = {
  totalFxPurchased: 18650,
  totalFxSold: 41200,
  transactionsThisPeriod: 248,
};

export const MOCK_PENDING_SETTLEMENTS: PendingSettlement[] = [
  { id: "TXN-55218", customerName: "Bukayo Eze", transactionType: "PTA", currencyPair: "USD-NGN", fxAmount: -1000, currency: "USD", ngnAmountOwed: 1380000, date: "2025-11-16T11:00:00", status: "Pending" },
  { id: "TXN-55219", customerName: "Eberechi Saka", transactionType: "Sell FX", currencyPair: "USD-NGN", fxAmount: 1000, currency: "USD", ngnAmountOwed: 1380000, date: "2025-11-21T16:30:00", status: "Overdue" },
  { id: "TXN-55220", customerName: "Noni Nwaneri", transactionType: "School fees", currencyPair: "EUR-NGN", fxAmount: -1000, currency: "EUR", ngnAmountOwed: 1380000, date: "2025-11-17T12:30:00", status: "Settled" },
  { id: "TXN-55221", customerName: "Ethan Madueke", transactionType: "Medical", currencyPair: "JPY-NGN", fxAmount: -1000, currency: "EUR", ngnAmountOwed: 1380000, date: "2025-11-20T09:00:00", status: "Overdue" },
  { id: "TXN-55222", customerName: "Mikel Osimhen", transactionType: "Sell FX", currencyPair: "USD-NGN", fxAmount: 1000, currency: "USD", ngnAmountOwed: 1380000, date: "2025-11-22T10:00:00", status: "Settled" },
  { id: "TXN-55223", customerName: "Chloe Kelly", transactionType: "BTA", currencyPair: "CAD-NGN", fxAmount: -1200, currency: "USD", ngnAmountOwed: 1380000, date: "2025-11-19T15:45:00", status: "Overdue" },
  { id: "TXN-55224", customerName: "Samuel Franklin", transactionType: "School fees", currencyPair: "EUR-NGN", fxAmount: -1000, currency: "EUR", ngnAmountOwed: 1380000, date: "2025-11-18T14:15:00", status: "Pending" },
  { id: "TXN-55225", customerName: "Expatriate", transactionType: "Sell FX", currencyPair: "USD-NGN", fxAmount: 1000, currency: "USD", ngnAmountOwed: 1380000, date: "2025-11-16T11:00:00", status: "Settled" },
];

export const MOCK_RECONCILIATION_ROWS: ReconciliationRow[] = [
  { currency: "USD", systemClosingBalance: 10000, physicalCount: 10000, variance: 0, variancePercent: 0, status: "Needs Review", lastUpdated: "2026-11-05T11:00:00" },
  { currency: "GBP", systemClosingBalance: 4200, physicalCount: 3000, variance: -1200, variancePercent: -1.25, status: "Needs Review", lastUpdated: "2025-11-21T16:30:00" },
  { currency: "EUR", systemClosingBalance: 7000, physicalCount: 6500, variance: -500, variancePercent: -1, status: "Reconciled", lastUpdated: "2025-11-17T12:30:00" },
];

export const MOCK_HISTORY: InventoryHistoryEntry[] = [
  { id: "h1", transactionId: "TXN-55218", currency: "USD", amount: -1000, balanceAfter: 10000, date: "2025-11-16T11:00:00" },
  { id: "h2", transactionId: "TXN-55218", currency: "USD", amount: 1000, balanceAfter: 21000, date: "2025-11-21T16:30:00" },
  { id: "h3", transactionId: "TXN-55218", currency: "EUR", amount: -1000, balanceAfter: 10000, date: "2025-11-17T12:30:00" },
  { id: "h4", transactionId: "TXN-55218", currency: "EUR", amount: -1000, balanceAfter: 15000, date: "2025-11-20T09:00:00" },
  { id: "h5", transactionId: "TXN-55218", currency: "USD", amount: 1000, balanceAfter: 11000, date: "2025-11-22T10:00:00" },
  { id: "h6", transactionId: "TXN-55218", currency: "USD", amount: -1200, balanceAfter: 21200, date: "2025-11-19T15:45:00" },
  { id: "h7", transactionId: "TXN-55218", currency: "EUR", amount: -1000, balanceAfter: 12000, date: "2025-11-18T14:15:00" },
  { id: "h8", transactionId: "TXN-55218", currency: "USD", amount: 1000, balanceAfter: 10000, date: "2025-11-16T11:00:00" },
];

export const MOCK_LODGEMENTS: CashLodgement[] = [
  { id: "l1", currency: "USD", declaredAmount: 10000, amountReceived: 10000, variance: 0, status: "Confirmed", submittedAt: "2026-11-05T11:00:00" },
  { id: "l2", currency: "GBP", declaredAmount: 4200, amountReceived: 3000, variance: -1200, status: "Pending Verification", submittedAt: "2025-11-21T16:30:00" },
  { id: "l3", currency: "EUR", declaredAmount: 7000, amountReceived: 6500, variance: -500, status: "Needs Review", submittedAt: "2025-11-17T12:30:00" },
];

export const MOCK_DISBURSEMENT_NOTICE: CashDisbursementNotice = {
  id: "dsb-2026-021",
  agentName: "Michael Smith",
  currency: "USD",
  amount: 2000,
  reference: "DSB-2026-021",
  purpose: "Weekly float top-up",
  disbursedBy: "Tolu Bankole (Ops Officer)",
  disbursedAt: "2026-09-09T08:30:00",
};

export const MOCK_NGN_CASH_AVAILABLE = 5135000;
export const MOCK_AVAILABLE_FX: Record<string, number> = {
  USD: 20000,
  EUR: 7000,
  GBP: 3000,
  NGN: 0,
};
