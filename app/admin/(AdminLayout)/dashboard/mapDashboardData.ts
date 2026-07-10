import type {
  AdminDashboardData,
  DashboardTask,
  Transaction,
} from "@/app/admin/_types/dashboard";

const STATUS_LABELS: Record<string, string> = {
  AWAITING_VERIFICATION: "Awaiting Verification",
  PENDING: "Pending",
  DRAFT: "Draft",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  REQUEST_INFORMATION: "Request Information",
  COMPLETED: "Completed",
  SETTLED: "Settled",
};

export function adminTransactionStatusLabel(status: string): string {
  if (!status) return "Unknown";
  return STATUS_LABELS[status] ?? status.replaceAll("_", " ");
}

function formatDateTime(iso: string): { date: string; time: string } {
  if (!iso) return { date: "--", time: "--" };

  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: "--", time: "--" };

  return {
    date: d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    time: d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
  };
}

type BarRow = {
  month: string;
  completed: number;
  pending: number;
  rejected: number;
};

export function mapTransactionSummaryChartData(
  summary: AdminDashboardData["transactionSummary"]
): BarRow[] {
  const { labels, series } = summary;
  return labels.map((month, i) => ({
    month,
    completed: series.completed[i] ?? 0,
    pending: series.pending[i] ?? 0,
    rejected: series.rejected[i] ?? 0,
  }));
}

export const TYPE_DISPLAY: Record<string, string> = {
  PTA: "PTA",
  BTA: "BTA",
  SCHOOL_FEES: "School Fees",
  MEDICAL: "Medical",
  PROFESSIONAL_BODY: "Professional Body",
  TOURIST_FX: "Tourist FX",
  RESIDENT_FX: "Resident FX",
  EXPATRIATE_FX: "Expatriate FX",
  IMTO_REMITTANCE: "IMTO Remittance",
  CASH_REMITTANCE: "Cash Remittance",
};

export const TRANSACTION_TYPE_FILTER_OPTIONS = [
  { value: "", label: "Filter" },
  ...Object.entries(TYPE_DISPLAY).map(([value, label]) => ({ value, label })),
];

export type DonutSegment = { name: string; value: number; color: string };

const TRANSACTION_TYPE_CATEGORIES: {
  key: string;
  label: string;
  color: string;
  match: (normalizedType: string) => boolean;
}[] = [
  { key: "PTA", label: "PTA", color: "#dd4f05", match: (t) => t.includes("PTA") },
  { key: "BTA", label: "BTA", color: "#e88a58", match: (t) => t.includes("BTA") },
  {
    key: "SCHOOL_FEES",
    label: "School Fees",
    color: "#fdb022",
    match: (t) => t.includes("SCHOOL"),
  },
  { key: "MEDICAL", label: "Medical", color: "#b84204", match: (t) => t.includes("MEDICAL") },
  {
    key: "PROFESSIONAL_BODY",
    label: "Professional Body",
    color: "#f79009",
    match: (t) => t.includes("PROFESSIONAL"),
  },
];

const OTHERS_KEY = "OTHERS";
const OTHERS_LABEL = "Others";
const OTHERS_COLOR = "#933503";

function normalizeTransactionType(type: string): string {
  return (type ?? "").toUpperCase().replace(/[\s-]+/g, "_");
}

export function mapTransactionsByTypeDonut(
  block: AdminDashboardData["transactionsByType"]
): DonutSegment[] {
  const totals = new Map<string, number>();
  TRANSACTION_TYPE_CATEGORIES.forEach((c) => totals.set(c.key, 0));
  totals.set(OTHERS_KEY, 0);

  for (const item of block.items) {
    const normalized = normalizeTransactionType(item.type);
    const category = TRANSACTION_TYPE_CATEGORIES.find((c) => c.match(normalized));
    const key = category?.key ?? OTHERS_KEY;
    totals.set(key, (totals.get(key) ?? 0) + item.amount);
  }

  const segments: DonutSegment[] = TRANSACTION_TYPE_CATEGORIES.map((c) => ({
    name: c.label,
    value: totals.get(c.key) ?? 0,
    color: c.color,
  }));
  segments.push({
    name: OTHERS_LABEL,
    value: totals.get(OTHERS_KEY) ?? 0,
    color: OTHERS_COLOR,
  });

  return segments;
}

export function mapRecentTransactions(
  rows: AdminDashboardData["recentTransactions"]
): Transaction[] {
  return rows.map((row) => {
    const { date, time } = formatDateTime(row.createdAt);
    const rawType = row.type ?? row.transactionType ?? "";
    return {
      id: row.id,
      referenceNumber: row.referenceNumber,
      transactionType: rawType ? TYPE_DISPLAY[rawType] ?? rawType.replaceAll("_", " ") : "Unknown",
      date,
      time,
      status: adminTransactionStatusLabel(row.status),
      customerName: row.customerName,
    };
  });
}

export interface DashboardTaskRow {
  id: string;
  title: string;
  status: string;
  module: string;
  workflowAction: string;
  actionNeeded: string;
  dateInitiated: string;
  timeInitiated: string;
  escalationPeriod: string;
  escalationMinutes: number;
  entityTitle: string;
}

export function mapDashboardTasks(tasks: DashboardTask[]): DashboardTaskRow[] {
  return tasks.map((t) => {
    const { date, time } = formatDateTime(t.dateInitiated ?? t.assignedAt ?? "");
    const escalationMinutes = Math.max(0, t.escalationMinutes ?? 0);
    return {
      id: t.id,
      title: t.title ?? t.entityTitle ?? "Task",
      status: t.status ?? "",
      module: t.module ?? "--",
      workflowAction: t.workflowAction ?? "--",
      actionNeeded: t.actionNeeded ?? "--",
      dateInitiated: date,
      timeInitiated: time,
      escalationPeriod: `${escalationMinutes.toLocaleString("en-US")} mins`,
      escalationMinutes,
      entityTitle: t.entityTitle ?? "",
    };
  });
}
