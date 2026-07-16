/** Legacy / UI-oriented labels used in early mocks */
export type TransactionStatus =
  | "Pending"
  | "Completed"
  | "Rejected"
  | "Request More Info";

export interface Transaction {
  id: string;
  referenceNumber?: string;
  customerName?: string;
  transactionType: string;
  date: string;
  time: string;
  /** Display label for StatusBadge (human-readable) */
  status: string;
}

export interface Notification {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  unread?: boolean;
}

/** GET /api/admin/dashboard — task shape from API */
export interface DashboardTask {
  id: string;
  title?: string;
  status?: string;
  priority?: string;
  assignedAt?: string;
  taskId?: string;
  module?: string;
  workflowAction?: string;
  actionNeeded?: string;
  dateInitiated?: string;
  escalationMinutes?: number;
  entityTitle?: string;
}

/** GET /api/admin/dashboard — provisional notification shape */
export interface DashboardNotification {
  id: string;
  title?: string;
  message?: string;
  body?: string;
  read?: boolean;
  createdAt?: string;
  type?: string;
}

export interface AdminDashboardCounters {
  settlementBalance: number;
  totalTransactions: number;
  totalCustomers: number;
  totalUsers: number;
}

export interface AdminDashboardTransactionSummary {
  startDate: string | null;
  endDate: string | null;
  rangePreset: string | null;
  labels: string[];
  series: {
    completed: number[];
    pending: number[];
    rejected: number[];
  };
}

export interface AdminDashboardTransactionsByTypeItem {
  type: string;
  amount: number;
}

export interface AdminDashboardTransactionsByType {
  windowDays: number;
  totalAmount: number;
  items: AdminDashboardTransactionsByTypeItem[];
}

export interface AdminDashboardRecentTransaction {
  id: string;
  referenceNumber: string;
  customerName: string;
  type?: string;
  transactionType?: string;
  createdAt: string;
  status: string;
}

export interface AdminDashboardData {
  counters: AdminDashboardCounters;
  transactionSummary: AdminDashboardTransactionSummary;
  transactionsByType: AdminDashboardTransactionsByType;
  recentTransactions: AdminDashboardRecentTransaction[];
  tasks: DashboardTask[];
  notifications: DashboardNotification[];
  pendingApprovals: number;
  amlFlags: number;
  pendingReviews: number;
}
