import type {
  AdminDashboardData,
  DashboardNotification,
  DashboardTask,
  Notification,
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

// Warm spectrum from primary token palette (globals.css) — no two types share the same hue
const TYPE_COLORS: Record<string, string> = {
  PTA: "#dd4f05",           // primary-400  — signature orange
  BTA: "#e88a58",           // primary-200  — light orange
  SCHOOL_FEES: "#fdb022",   // warning-400  — amber
  MEDICAL: "#b84204",       // primary-500  — dark orange
  PROFESSIONAL_BODY: "#f79009", // warning-500 — orange-amber
  TOURIST_FX: "#fec84b",    // warning-300  — golden yellow
  RESIDENT_FX: "#6f2803",   // primary-700  — deep brown-orange
  EXPATRIATE_FX: "#e36c2f", // primary-300  — mid orange
  IMTO_REMITTANCE: "#933503", // primary-600 — burnt orange
  CASH_REMITTANCE: "#eea782", // primary-100 — peach
};

// Fallback palette cycles through warm tones for any unknown future types
const FALLBACK_COLORS = [
  "#dd4f05", "#e88a58", "#fdb022", "#b84204", "#f79009",
  "#fec84b", "#6f2803", "#e36c2f", "#933503", "#eea782",
];

export type DonutSegment = { name: string; value: number; color: string };

export function mapTransactionsByTypeDonut(
  block: AdminDashboardData["transactionsByType"]
): DonutSegment[] {
  let fallbackIndex = 0;
  return block.items.map((item) => {
    const color =
      TYPE_COLORS[item.type] ?? FALLBACK_COLORS[fallbackIndex++ % FALLBACK_COLORS.length];
    return {
      name: TYPE_DISPLAY[item.type] ?? item.type.replaceAll("_", " "),
      value: item.amount,
      color,
    };
  });
}

export function mapRecentTransactions(
  rows: AdminDashboardData["recentTransactions"]
): Transaction[] {
  return rows.map((row) => {
    const { date, time } = formatDateTime(row.createdAt);
    const rawType = row.transactionType ?? "";
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

function taskTimestamp(t: DashboardTask): number {
  const raw = t.dueAt ?? t.createdAt ?? "";
  const n = new Date(raw).getTime();
  return Number.isNaN(n) ? 0 : n;
}

function notificationTimestamp(n: DashboardNotification): number {
  const raw = n.createdAt ?? "";
  const t = new Date(raw).getTime();
  return Number.isNaN(t) ? 0 : t;
}

export function mergeDashboardFeedSorted(
  tasks: DashboardTask[],
  notifications: DashboardNotification[]
): Notification[] {
  type Entry = {
    notification: Notification;
    sortKey: number;
  };

  const entries: Entry[] = [
    ...tasks.map((t) => {
      const iso = t.dueAt ?? t.createdAt ?? "";
      const { date, time } = formatDateTime(iso);
      return {
        sortKey: taskTimestamp(t),
        notification: {
          id: `task-${t.id}`,
          title: t.title ?? "Task",
          description: t.description ?? t.status ?? undefined,
          date,
          time,
          unread: t.status
            ? t.status !== "COMPLETED" && t.status !== "DONE"
            : true,
        },
      };
    }),
    ...notifications.map((n) => {
      const iso = n.createdAt ?? "";
      const { date, time } = formatDateTime(iso);
      return {
        sortKey: notificationTimestamp(n),
        notification: {
          id: `notif-${n.id}`,
          title: n.title ?? "Notification",
          description: n.message ?? n.body ?? n.type,
          date,
          time,
          unread: n.read === false,
        },
      };
    }),
  ];

  return entries
    .sort((a, b) => b.sortKey - a.sortKey)
    .map((e) => e.notification);
}
