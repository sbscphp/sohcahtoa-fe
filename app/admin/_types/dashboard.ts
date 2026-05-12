/** Legacy / UI-oriented labels used in early mocks */
export type TransactionStatus =
  | "Pending"
  | "Completed"
  | "Rejected"
  | "Request More Info";

export interface Transaction {
  id: string;
  referenceNumber?: string;
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

/** GET /api/admin/dashboard — provisional task shape */
export interface DashboardTask {
  id: string;
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  dueAt?: string;
  createdAt?: string;
  link?: string;
  actionUrl?: string;
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
  year: number;
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
