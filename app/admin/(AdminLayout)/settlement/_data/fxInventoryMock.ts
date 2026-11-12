export type DisbursementStatus = "Pending" | "Approved" | "Rejected";
export type LodgmentStatus = "Pending" | "Confirmed" | "Rejected";
export type WorkflowStage = "Review" | "Approval";

export interface FxInventoryAgent {
  id: string;
  agentName: string;
  agentId: string;
  date: string;
  time: string;
}

export interface DisbursementRow extends FxInventoryAgent {
  amount: string;
  workflowStage: WorkflowStage;
  status: DisbursementStatus;
}

export interface LodgmentRow extends FxInventoryAgent {
  amountLodged: string;
  updatedAmount: string | null;
  status: LodgmentStatus;
}

export const FX_INVENTORY_STATS = {
  totalDisbursement: 1627,
  totalLodgments: 240,
  pendingApprovals: 8,
  approvedDisbursement: 24,
} as const;

export const DISBURSEMENT_ROWS: DisbursementRow[] = [
  {
    id: "disbursement-1",
    agentName: "Samuel Joshson",
    agentId: "9023",
    amount: "$400",
    date: "Nov 16 2025",
    time: "11:00 am",
    workflowStage: "Review",
    status: "Pending",
  },
  {
    id: "disbursement-2",
    agentName: "Michael Bennett",
    agentId: "9025",
    amount: "$500",
    date: "Nov 21 2025",
    time: "4:30 pm",
    workflowStage: "Approval",
    status: "Pending",
  },
  {
    id: "disbursement-3",
    agentName: "Ava Thompson",
    agentId: "9026",
    amount: "₦1,600,000.00",
    date: "Nov 17 2025",
    time: "12:30 pm",
    workflowStage: "Approval",
    status: "Approved",
  },
  {
    id: "disbursement-4",
    agentName: "Emily Carter",
    agentId: "9024",
    amount: "$550",
    date: "Nov 20 2025",
    time: "9:00 am",
    workflowStage: "Approval",
    status: "Approved",
  },
  {
    id: "disbursement-5",
    agentName: "Oliver Reed",
    agentId: "9027",
    amount: "$450",
    date: "Nov 22 2025",
    time: "10:00 am",
    workflowStage: "Approval",
    status: "Rejected",
  },
  {
    id: "disbursement-6",
    agentName: "Samuel Joshson",
    agentId: "9023",
    amount: "$400",
    date: "Nov 22 2025",
    time: "10:00 am",
    workflowStage: "Approval",
    status: "Pending",
  },
];

export const LODGMENT_ROWS: LodgmentRow[] = [
  {
    id: "lodgment-1",
    agentName: "Samuel Joshson",
    agentId: "9023",
    amountLodged: "$400",
    updatedAmount: null,
    date: "Nov 16 2025",
    time: "11:00 am",
    status: "Pending",
  },
  {
    id: "lodgment-2",
    agentName: "Michael Bennett",
    agentId: "9025",
    amountLodged: "$500",
    updatedAmount: null,
    date: "Nov 21 2025",
    time: "4:30 pm",
    status: "Pending",
  },
  {
    id: "lodgment-3",
    agentName: "Ava Thompson",
    agentId: "9026",
    amountLodged: "₦1,600,000.00",
    updatedAmount: "₦1,400,000.00",
    date: "Nov 17 2025",
    time: "12:30 pm",
    status: "Confirmed",
  },
  {
    id: "lodgment-4",
    agentName: "Emily Carter",
    agentId: "9024",
    amountLodged: "$550",
    updatedAmount: "$550",
    date: "Nov 20 2025",
    time: "9:00 am",
    status: "Confirmed",
  },
  {
    id: "lodgment-5",
    agentName: "Oliver Reed",
    agentId: "9027",
    amountLodged: "$450",
    updatedAmount: "$450",
    date: "Nov 22 2025",
    time: "10:00 am",
    status: "Rejected",
  },
  {
    id: "lodgment-6",
    agentName: "Samuel Joshson",
    agentId: "9023",
    amountLodged: "$400",
    updatedAmount: "$400",
    date: "Nov 22 2025",
    time: "10:00 am",
    status: "Pending",
  },
];

export const DISBURSEMENT_STATUS_OPTIONS = [
  { value: "All", label: "Filter By" },
  { value: "Pending", label: "Pending" },
  { value: "Approved", label: "Approved" },
  { value: "Rejected", label: "Rejected" },
];

export const LODGMENT_STATUS_OPTIONS = [
  { value: "All", label: "Filter By" },
  { value: "Pending", label: "Pending" },
  { value: "Confirmed", label: "Confirmed" },
  { value: "Rejected", label: "Rejected" },
];

export const DISBURSE_CASH_AGENTS = [
  { value: "adekunle-ajasin", label: "Adekunle Ajasin" },
  ...Array.from(
    new Map(DISBURSEMENT_ROWS.map((row) => [row.agentId, row.agentName])).entries()
  ).map(([agentId, agentName]) => ({
    value: agentId,
    label: agentName,
  })),
];

export interface DisbursementDetail {
  id: string;
  reference: string;
  agentName: string;
  agentId: string;
  recordedDate: string;
  recordedTime: string;
  dateRequested: string;
  timeRequested: string;
  currency: string;
  requestedAmount: string;
  requestor: string;
  workflowStageLabel: string;
  requestStatus: string;
  purpose: string;
  inventoryValue: string;
  amountAfterDisbursement: string;
  status: DisbursementStatus;
}

const REQUEST_STATUS: Record<DisbursementStatus, string> = {
  Pending: "Under Review",
  Approved: "Approved",
  Rejected: "Rejected",
};

export function getDisbursementDetail(id: string): DisbursementDetail | null {
  const row = DISBURSEMENT_ROWS.find((item) => item.id === id);
  if (!row) return null;

  const isNaira = row.amount.startsWith("₦");
  const referenceNumber = 1830 + Number(row.id.replace(/\D/g, "") || 0);

  return {
    id: row.id,
    reference: String(referenceNumber),
    agentName: row.agentName,
    agentId: row.agentId,
    recordedDate: row.date,
    recordedTime: row.time,
    dateRequested: row.date,
    timeRequested: row.time,
    currency: isNaira ? "NGN" : "USD",
    requestedAmount: row.amount,
    requestor: "Kunle Dabiri",
    workflowStageLabel: row.workflowStage === "Review" ? "Review Stage" : "Approval Stage",
    requestStatus: REQUEST_STATUS[row.status],
    purpose: "Agent FX Transactions",
    inventoryValue: isNaira ? "₦96,000,000.00" : "$96,000.00",
    amountAfterDisbursement: isNaira ? "₦90,000,000.00" : "$90,000.00",
    status: row.status,
  };
}

export type LodgmentCurrency = "NGN" | "USD";

export interface LodgmentDetail {
  id: string;
  reference: string;
  agentName: string;
  agentId: string;
  recordedDate: string;
  recordedTime: string;
  currency: LodgmentCurrency;
  returnedAmount: number;
  returnedAmountLabel: string;
  updatedAmount: number | null;
  updatedAmountLabel: string;
  varianceLabel: string;
  status: LodgmentStatus;
  updatedBy: string;
  dateConfirmed: string;
  timeConfirmed: string;
}

function parseMoney(value: string | null): number | null {
  if (!value) return null;
  const numeric = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(numeric) ? numeric : null;
}

export function formatLodgmentAmount(amount: number, currency: LodgmentCurrency) {
  const formatted = amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return currency === "NGN" ? `₦${formatted}` : `$${formatted}`;
}

export function lodgmentVarianceLabel(
  returnedAmount: number,
  updatedAmount: number | null,
  currency: LodgmentCurrency
) {
  if (updatedAmount === null) return "-";
  return formatLodgmentAmount(Math.abs(returnedAmount - updatedAmount), currency);
}

export function getLodgmentDetail(id: string): LodgmentDetail | null {
  const row = LODGMENT_ROWS.find((item) => item.id === id);
  if (!row) return null;

  const currency: LodgmentCurrency = row.amountLodged.startsWith("₦") ? "NGN" : "USD";
  const returnedAmount = parseMoney(row.amountLodged) ?? 0;
  const updatedAmount = parseMoney(row.updatedAmount);
  const referenceNumber = 1830 + Number(row.id.replace(/\D/g, "") || 0);
  const isConfirmed = row.status === "Confirmed";

  return {
    id: row.id,
    reference: String(referenceNumber),
    agentName: row.agentName,
    agentId: row.agentId,
    recordedDate: row.date,
    recordedTime: row.time,
    currency,
    returnedAmount,
    returnedAmountLabel: row.amountLodged,
    updatedAmount,
    updatedAmountLabel: row.updatedAmount ?? "-",
    varianceLabel: lodgmentVarianceLabel(returnedAmount, updatedAmount, currency),
    status: row.status,
    updatedBy: isConfirmed ? "Victoria Paschal" : "-",
    dateConfirmed: isConfirmed ? row.date : "-",
    timeConfirmed: isConfirmed ? row.time : "-",
  };
}
