export interface AgentFxInventoryRow {
  id: string;
  agentName: string;
  agentId: string;
  phone: string;
  email: string;
  totalDisbursement: number;
  totalLodgment: number;
}

export const AGENT_FX_INVENTORY_STATS = {
  totalDisbursement: 1627,
  totalLodgments: 240,
  pendingApprovals: 8,
  approvedDisbursement: 24,
} as const;

export const AGENT_FX_INVENTORY_ROWS: AgentFxInventoryRow[] = [
  {
    id: "agent-fx-1",
    agentName: "Tunde Bashorun",
    agentId: "9023",
    phone: "+234 90 2323 4545",
    email: "tunde@eternalglobal.com",
    totalDisbursement: 209,
    totalLodgment: 10,
  },
  {
    id: "agent-fx-2",
    agentName: "Queen Omotola",
    agentId: "9025",
    phone: "+234 90 5858 3939",
    email: "queen@kudimata.com",
    totalDisbursement: 9,
    totalLodgment: 18,
  },
  {
    id: "agent-fx-3",
    agentName: "Samuel Olubanki",
    agentId: "9026",
    phone: "+234 91 2222 4545",
    email: "olubankisamuel@gmail.com",
    totalDisbursement: 120,
    totalLodgment: 16,
  },
  {
    id: "agent-fx-4",
    agentName: "Ibrahim Dantata",
    agentId: "9024",
    phone: "+234 90 5858 3939",
    email: "ibrahim@sultan.com",
    totalDisbursement: 50,
    totalLodgment: 17,
  },
  {
    id: "agent-fx-5",
    agentName: "Mfon Ubot",
    agentId: "9027",
    phone: "+234 90 2323 4545",
    email: "mubot@greenfield.com",
    totalDisbursement: 60,
    totalLodgment: 60,
  },
  {
    id: "agent-fx-6",
    agentName: "Sariki Sudan",
    agentId: "9023",
    phone: "+234 81 0000 3456",
    email: "nagode@gmail.com",
    totalDisbursement: 98,
    totalLodgment: 98,
  },
];

export interface AgentFxInventoryDetail {
  id: string;
  agentName: string;
  agentId: string;
  phone: string;
  email: string;
  dateCreated: string;
  timeCreated: string;
  status: "Active";
  branch: string;
}

export type AmountTone = "default" | "negative" | "muted";

export interface AmountCell {
  text: string;
  tone: AmountTone;
}

export type PositionStatus = "Reconciled" | "Variance";

export interface InventoryPositionRow {
  id: string;
  currency: "USD" | "GBP" | "EUR";
  openingBalance: AmountCell;
  disbursedFromAdmin: AmountCell;
  purchasedFromCustomers: AmountCell;
  soldToCustomers: AmountCell;
  lodgedToHq: AmountCell;
  closingBalance: AmountCell;
  physicalCount: AmountCell;
  variance: AmountCell;
  status: PositionStatus;
}

export interface InventoryPositionTotal {
  label: string;
  openingBalance: AmountCell;
  disbursedFromAdmin: AmountCell;
  purchasedFromCustomers: AmountCell;
  soldToCustomers: AmountCell;
  lodgedToHq: AmountCell;
  closingBalance: AmountCell;
  physicalCount: AmountCell;
  variance: AmountCell;
  flaggedLabel: string;
}

export type TransactionEffect = "Posted" | "Pending" | "Rejected";
export type DisbursementStatus = "Pending" | "Approved" | "Rejected";
export type LodgmentStatus = "Pending" | "Confirmed" | "Rejected";

export interface AgentFxTransactionRow {
  id: string;
  transactionId: string;
  date: string;
  time: string;
  type: string;
  value: string;
  effect: TransactionEffect;
}

export interface AgentFxDisbursementRow {
  id: string;
  reference: string;
  currency: string;
  amount: string;
  date: string;
  time: string;
  workflowStage: string;
  status: DisbursementStatus;
}

export interface AgentFxLodgmentRow {
  id: string;
  reference: string;
  currency: string;
  amountLodged: string;
  updatedAmount: string;
  date: string;
  time: string;
  status: LodgmentStatus;
}

const dash = (): AmountCell => ({ text: "—", tone: "muted" });
const amount = (text: string, negative = false): AmountCell => ({
  text,
  tone: negative ? "negative" : "default",
});

export const INVENTORY_POSITION_ROWS: InventoryPositionRow[] = [
  {
    id: "position-usd",
    currency: "USD",
    openingBalance: amount("$20,000"),
    disbursedFromAdmin: amount("$10,000"),
    purchasedFromCustomers: amount("$5,000"),
    soldToCustomers: amount("($1000)", true),
    lodgedToHq: amount("($3000)", true),
    closingBalance: amount("$10,000"),
    physicalCount: amount("$20,000"),
    variance: amount("$0"),
    status: "Reconciled",
  },
  {
    id: "position-gbp",
    currency: "GBP",
    openingBalance: amount("£5,000"),
    disbursedFromAdmin: dash(),
    purchasedFromCustomers: amount("£1,000"),
    soldToCustomers: amount("(£1,000)", true),
    lodgedToHq: dash(),
    closingBalance: amount("£5,000"),
    physicalCount: amount("£4,970"),
    variance: amount("(-£30)", true),
    status: "Variance",
  },
  {
    id: "position-eur",
    currency: "EUR",
    openingBalance: amount("€8,000"),
    disbursedFromAdmin: amount("€2,000"),
    purchasedFromCustomers: dash(),
    soldToCustomers: amount("(€2,000)", true),
    lodgedToHq: dash(),
    closingBalance: amount("€2,000"),
    physicalCount: amount("€7,000"),
    variance: amount("€0"),
    status: "Reconciled",
  },
];

export const INVENTORY_POSITION_TOTAL: InventoryPositionTotal = {
  label: "Total(NGN)",
  openingBalance: amount("₦45,135,000"),
  disbursedFromAdmin: amount("₦5,135,000"),
  purchasedFromCustomers: amount("₦5,135,000"),
  soldToCustomers: amount("₦(5,000,000)", true),
  lodgedToHq: amount("₦(5,135,000)", true),
  closingBalance: amount("₦5,135,000"),
  physicalCount: amount("₦5,135,000"),
  variance: amount("₦(50,000)", true),
  flaggedLabel: "1 Flagged",
};

export const AGENT_FX_TRANSACTIONS: AgentFxTransactionRow[] = [
  {
    id: "txn-1",
    transactionId: "7844gAGAA563A",
    date: "September 12, 2025",
    time: "11:00 am",
    type: "BTA Buy",
    value: "₦1,250,000.00",
    effect: "Posted",
  },
  {
    id: "txn-2",
    transactionId: "7844gAGAA563A",
    date: "September 12, 2025",
    time: "11:00 am",
    type: "PTA Buy",
    value: "₦875,000.00",
    effect: "Pending",
  },
  {
    id: "txn-3",
    transactionId: "7844gAGAA563A",
    date: "September 12, 2025",
    time: "11:00 am",
    type: "PTA Buy",
    value: "₦930,500.00",
    effect: "Rejected",
  },
  {
    id: "txn-4",
    transactionId: "7844gAGAA563A",
    date: "September 12, 2025",
    time: "11:00 am",
    type: "Expatriate Sell",
    value: "₦1,100,000.00",
    effect: "Pending",
  },
  {
    id: "txn-5",
    transactionId: "7844gAGAA563A",
    date: "September 12, 2025",
    time: "11:00 am",
    type: "BTA Buy",
    value: "₦790,000.00",
    effect: "Posted",
  },
  {
    id: "txn-6",
    transactionId: "7844gAGAA563A",
    date: "September 12, 2025",
    time: "11:00 am",
    type: "PTA Sell",
    value: "₦980,000.00",
    effect: "Pending",
  },
];

export const AGENT_FX_DISBURSEMENTS: AgentFxDisbursementRow[] = [
  {
    id: "disbursement-1",
    reference: "DSB-2026-021",
    currency: "USD",
    amount: "$400",
    date: "Nov 16 2025",
    time: "11:00 am",
    workflowStage: "Review",
    status: "Pending",
  },
  {
    id: "disbursement-2",
    reference: "DSB-2026-021",
    currency: "EUR",
    amount: "€500",
    date: "Nov 21 2025",
    time: "4:30 pm",
    workflowStage: "Approval",
    status: "Pending",
  },
  {
    id: "disbursement-3",
    reference: "DSB-2026-021",
    currency: "NGN",
    amount: "₦1,600,000.00",
    date: "Nov 17 2025",
    time: "12:30 pm",
    workflowStage: "Approval",
    status: "Approved",
  },
  {
    id: "disbursement-4",
    reference: "DSB-2026-021",
    currency: "GBP",
    amount: "£550",
    date: "Nov 20 2025",
    time: "9:00 am",
    workflowStage: "Approval",
    status: "Approved",
  },
  {
    id: "disbursement-5",
    reference: "DSB-2026-021",
    currency: "USD",
    amount: "$450",
    date: "Nov 22 2025",
    time: "10:00 am",
    workflowStage: "Approval",
    status: "Rejected",
  },
  {
    id: "disbursement-6",
    reference: "DSB-2026-021",
    currency: "EUR",
    amount: "$400",
    date: "Nov 22 2025",
    time: "10:00 am",
    workflowStage: "Approval",
    status: "Pending",
  },
];

export const AGENT_FX_LODGMENTS: AgentFxLodgmentRow[] = [
  {
    id: "lodgment-1",
    reference: "DSB-2026-021",
    currency: "USD",
    amountLodged: "$400",
    updatedAmount: "-",
    date: "Nov 16 2025",
    time: "11:00 am",
    status: "Pending",
  },
  {
    id: "lodgment-2",
    reference: "DSB-2026-021",
    currency: "EUR",
    amountLodged: "€500",
    updatedAmount: "-",
    date: "Nov 21 2025",
    time: "4:30 pm",
    status: "Pending",
  },
  {
    id: "lodgment-3",
    reference: "DSB-2026-021",
    currency: "NGN",
    amountLodged: "₦1,600,000.00",
    updatedAmount: "₦1,400,000.00",
    date: "Nov 17 2025",
    time: "12:30 pm",
    status: "Confirmed",
  },
  {
    id: "lodgment-4",
    reference: "DSB-2026-021",
    currency: "GBP",
    amountLodged: "£550",
    updatedAmount: "$550",
    date: "Nov 20 2025",
    time: "9:00 am",
    status: "Confirmed",
  },
  {
    id: "lodgment-5",
    reference: "DSB-2026-021",
    currency: "USD",
    amountLodged: "$450",
    updatedAmount: "$450",
    date: "Nov 22 2025",
    time: "10:00 am",
    status: "Rejected",
  },
  {
    id: "lodgment-6",
    reference: "DSB-2026-021",
    currency: "EUR",
    amountLodged: "$400",
    updatedAmount: "$400",
    date: "Nov 22 2025",
    time: "10:00 am",
    status: "Pending",
  },
];

export function getAgentFxInventoryDetail(id: string): AgentFxInventoryDetail | null {
  const row = AGENT_FX_INVENTORY_ROWS.find((item) => item.id === id);
  if (!row) return null;
  return {
    id: row.id,
    agentName: row.agentName,
    agentId: row.agentId,
    phone: row.phone,
    email: row.email,
    dateCreated: "Nov 17 2025",
    timeCreated: "11:00am",
    status: "Active",
    branch: "Chevron Drive, Lekki",
  };
}
