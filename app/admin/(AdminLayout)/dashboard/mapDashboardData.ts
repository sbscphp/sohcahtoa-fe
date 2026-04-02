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

const TYPE_DISPLAY: Record<string, string> = {
  PTA: "PTA",
  SCHOOL_FEES: "School fees",
  RESIDENT_FX: "Resident FX",
  EXPATRIATE_FX: "Expatriate FX",
};

const TYPE_COLORS: Record<string, string> = {
  PTA: "orange.7",
  SCHOOL_FEES: "orange.5",
  RESIDENT_FX: "orange.3",
  EXPATRIATE_FX: "orange.9",
};

export type DonutSegment = { name: string; value: number; color: string };

export function mapTransactionsByTypeDonut(
  block: AdminDashboardData["transactionsByType"]
): DonutSegment[] {
  return block.items.map((item) => ({
    name: TYPE_DISPLAY[item.type] ?? item.type.replaceAll("_", " "),
    value: item.amount,
    color: TYPE_COLORS[item.type] ?? "gray.5",
  }));
}

export function mapRecentTransactions(
  rows: AdminDashboardData["recentTransactions"]
): Transaction[] {
  return rows.map((row) => {
    const { date, time } = formatDateTime(row.createdAt);
    return {
      id: row.id,
      referenceNumber: row.referenceNumber,
      date,
      time,
      status: adminTransactionStatusLabel(row.status),
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
