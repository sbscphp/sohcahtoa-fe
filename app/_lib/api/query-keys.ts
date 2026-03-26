/**
 * Query Key Factories
 * Centralized query keys for better cache management
 * Usage: customerKeys.profile(), adminKeys.transactions.list({ page: 1 })
 */

import type { TransactionListParams } from "./types";

// ==================== Customer Query Keys ====================

export const customerKeys = {
  all: ["customer"] as const,
  
  auth: {
    all: ["customer", "auth"] as const,
    profile: () => [...customerKeys.auth.all, "profile"] as const,
  },
  
  transactions: {
    all: ["customer", "transactions"] as const,
    lists: () => [...customerKeys.transactions.all, "list"] as const,
    list: (filters?: TransactionListParams) =>
      [...customerKeys.transactions.lists(), filters] as const,
    details: () => [...customerKeys.transactions.all, "detail"] as const,
    detail: (id: string) => [...customerKeys.transactions.details(), id] as const,
    overview: () => [...customerKeys.transactions.all, "overview"] as const,
    virtualAccount: (id: string) =>
      [...customerKeys.transactions.detail(id), "virtual-account"] as const,
    depositInstructions: (id: string) =>
      [...customerKeys.transactions.detail(id), "deposit-instructions"] as const,
    depositStatus: (id: string) =>
      [...customerKeys.transactions.detail(id), "deposit-status"] as const,
  },
  
  payments: {
    all: ["customer", "payments"] as const,
    history: (params?: { page?: number; limit?: number }) =>
      [...customerKeys.payments.all, "history", params] as const,
    status: (transactionId: string) =>
      [...customerKeys.payments.all, "status", transactionId] as const,
    exchangeRate: (params: { fromCurrency: string; toCurrency: string; amount: number }) =>
      [...customerKeys.payments.all, "exchange-rate", params] as const,
  },
  
  kyc: {
    all: ["customer", "kyc"] as const,
    passportStatus: () => [...customerKeys.kyc.all, "passport", "status"] as const,
  },
  
  notifications: {
    all: ["customer", "notifications"] as const,
    lists: () => [...customerKeys.notifications.all, "list"] as const,
    list: (params?: { limit?: number; offset?: number }) =>
      [...customerKeys.notifications.lists(), params] as const,
    unreadCount: () => [...customerKeys.notifications.all, "unread-count"] as const,
    preferences: () => [...customerKeys.notifications.all, "preferences"] as const,
    devices: () => [...customerKeys.notifications.all, "devices"] as const,
  },
  
  documents: {
    all: ["customer", "documents"] as const,
    lists: () => [...customerKeys.documents.all, "list"] as const,
    list: (params?: { userId: string; page?: number; limit?: number }) =>
      [...customerKeys.documents.lists(), params] as const,
    details: () => [...customerKeys.documents.all, "detail"] as const,
    detail: (id: string) => [...customerKeys.documents.details(), id] as const,
    byTransaction: (transactionId: string) =>
      [...customerKeys.documents.all, "transaction", transactionId] as const,
  },
  
  support: {
    all: ["customer", "support"] as const,
    tickets: {
      all: ["customer", "support", "tickets"] as const,
      lists: () => [...customerKeys.support.tickets.all, "list"] as const,
      list: (params?: { page?: number; limit?: number }) =>
        [...customerKeys.support.tickets.lists(), params] as const,
      details: () => [...customerKeys.support.tickets.all, "detail"] as const,
      detail: (id: string) => [...customerKeys.support.tickets.details(), id] as const,
    },
  },
} as const;

// ==================== Admin Query Keys ====================

export const adminKeys = {
  all: ["admin"] as const,
  
  auth: {
    all: ["admin", "auth"] as const,
    profile: () => [...adminKeys.auth.all, "profile"] as const,
  },
  
  dashboard: {
    all: ["admin", "dashboard"] as const,
    stats: () => [...adminKeys.dashboard.all, "stats"] as const,
    pendingApprovals: () => [...adminKeys.dashboard.all, "pending-approvals"] as const,
  },

  auditTrail: {
    all: ["admin", "audit-trail"] as const,
    list: (params?: {
      page?: number;
      limit?: number;
      search?: string;
      module?: string;
      status?: string;
      dateFrom?: string;
      dateTo?: string;
    }) => [...adminKeys.auditTrail.all, "list", params] as const,
  },

  agent: {
    all: ["admin", "agent"] as const,
    stats: () => [...adminKeys.agent.all, "stats"] as const,
    details: () => [...adminKeys.agent.all, "detail"] as const,
    detail: (id: string) => [...adminKeys.agent.details(), id] as const,
    transactions: (
      id: string,
      params?: {
        page?: number;
        limit?: number;
        status?: string;
        dateFrom?: string;
        dateTo?: string;
      }
    ) => [...adminKeys.agent.detail(id), "transactions", params] as const,
    list: (params?: {
      page?: number;
      limit?: number;
      search?: string;
      isActive?: boolean;
      branch?: string;
      fromDate?: string;
      toDate?: string;
      sort?: string;
    }) => [...adminKeys.agent.all, "list", params] as const,
  },
  
  customers: {
    all: ["admin", "customers"] as const,
    counts: () => [...adminKeys.customers.all, "counts"] as const,
    allCustomers: () => [...adminKeys.customers.all, "all"] as const,
    lists: () => [...adminKeys.customers.all, "list"] as const,
    list: (params?: {
      page?: number;
      limit?: number;
      search?: string;
      isActive?: boolean;
    }) =>
      [...adminKeys.customers.lists(), params] as const,
    details: () => [...adminKeys.customers.all, "detail"] as const,
    detail: (userId: string) => [...adminKeys.customers.details(), userId] as const,
    transactions: (
      userId: string,
      params?: {
        page?: number;
        limit?: number;
        status?: string;
        type?: string;
        search?: string;
      }
    ) => [...adminKeys.customers.detail(userId), "transactions", params] as const,
    flags: {
      all: (userId: string) => [...adminKeys.customers.detail(userId), "flags"] as const,
      list: (userId: string) => [...adminKeys.customers.flags.all(userId), "list"] as const,
      allFlags: () => [...adminKeys.customers.all, "flags", "all"] as const,
    },
  },

  tickets: {
    all: ["admin", "tickets"] as const,
    stats: () => [...adminKeys.tickets.all, "stats"] as const,
    statuses: () => [...adminKeys.tickets.all, "statuses"] as const,
    caseTypes: () => [...adminKeys.tickets.all, "case-types"] as const,
    detail: (id: string) => [...adminKeys.tickets.all, "detail", id] as const,
    comments: (id: string) => [...adminKeys.tickets.all, "comments", id] as const,
    list: (params?: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
      category?: string;
      priority?: string;
    }) => [...adminKeys.tickets.all, "list", params] as const,
  },
  rate: {
    all: ["admin", "rate"] as const,
    stats: () => [...adminKeys.rate.all, "stats"] as const,
    detail: (id: string) => [...adminKeys.rate.all, "detail", id] as const,
    list: (params?: {
      page?: number;
      limit?: number;
      search?: string;
      status?: "" | "active" | "schedule";
    }) => [...adminKeys.rate.all, "list", params] as const,
  },

  outlet: {
    all: ["admin", "outlet"] as const,
    states: {
      all: () => [...adminKeys.outlet.all, "states"] as const,
      list: () => [...adminKeys.outlet.states.all(), "list"] as const,
    },
    franchises: {
      all: () => [...adminKeys.outlet.all, "franchises"] as const,
      stats: () => [...adminKeys.outlet.franchises.all(), "stats"] as const,
      list: (params?: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
      }) => [...adminKeys.outlet.franchises.all(), "list", params] as const,
    },
  },
  
  transactions: {
    all: ["admin", "transactions"] as const,
    stats: () => [...adminKeys.transactions.all, "stats"] as const,
    lists: () => [...adminKeys.transactions.all, "list"] as const,
    list: (params?: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
      step?: string;
      type?: string;
      dateFrom?: string;
      dateTo?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    }) =>
      [...adminKeys.transactions.lists(), params] as const,
    details: () => [...adminKeys.transactions.all, "detail"] as const,
    detail: (id: string) => [...adminKeys.transactions.details(), id] as const,
  },

  reports: {
    all: ["admin", "reports"] as const,
    modules: () => [...adminKeys.reports.all, "modules"] as const,
  },
  
  management: {
    all: ["admin", "management"] as const,
    lookups: (query: "role" | "department" | "branch") =>
      [...adminKeys.management.all, "lookups", query] as const,
    modules: () => [...adminKeys.management.all, "modules"] as const,
    users: {
      all: () => [...adminKeys.management.all, "users"] as const,
      allUsers: () => [...adminKeys.management.users.all(), "all"] as const,
      stats: () => [...adminKeys.management.users.all(), "stats"] as const,
      details: () => [...adminKeys.management.users.all(), "detail"] as const,
      detail: (id: string) => [...adminKeys.management.users.details(), id] as const,
      activities: (id: string, params?: { page?: number; limit?: number; search?: string }) =>
        [...adminKeys.management.users.all(), "activities", id, params] as const,
      list: (params?: { page?: number; limit?: number; search?: string }) =>
        [...adminKeys.management.users.all(), "list", params] as const,
    },
    roles: {
      all: () => [...adminKeys.management.all, "roles"] as const,
      stats: () => [...adminKeys.management.roles.all(), "stats"] as const,
      list: (params?: { page?: number; limit?: number; search?: string; isActive?: boolean }) =>
        [...adminKeys.management.roles.all(), "list", params] as const,
      detail: (id: string) => [...adminKeys.management.roles.all(), "detail", id] as const,
    },
    departments: {
      all: () => [...adminKeys.management.all, "departments"] as const,
      stats: () => [...adminKeys.management.departments.all(), "stats"] as const,
      list: (params?: { page?: number; limit?: number; search?: string }) =>
        [...adminKeys.management.departments.all(), "list", params] as const,
      detail: (id: string) => [...adminKeys.management.departments.all(), "detail", id] as const,
    },
  },
} as const;

// ==================== Agent Query Keys ====================

export const agentKeys = {
  all: ["agent"] as const,

  rates: {
    all: ["agent", "rates"] as const,
    list: (params?: { fromCurrency?: string; toCurrency?: string }) =>
      [...agentKeys.rates.all, "list", params] as const,
  },

  customers: {
    all: ["agent", "customers"] as const,
    stats: () => [...agentKeys.customers.all, "stats"] as const,
    lists: () => [...agentKeys.customers.all, "list"] as const,
    list: (params?: {
      page?: number;
      limit?: number;
      status?: string;
      lastTransactionType?: string;
      customerType?: string;
      fromDate?: string;
      toDate?: string;
      search?: string;
    }) => [...agentKeys.customers.lists(), params] as const,
    details: () => [...agentKeys.customers.all, "detail"] as const,
    detail: (userId: string) => [...agentKeys.customers.details(), userId] as const,
    transactions: (
      userId: string,
      params?: { page?: number; limit?: number }
    ) => [...agentKeys.customers.detail(userId), "transactions", params] as const,
  },
  
  transactions: {
    all: ["agent", "transactions"] as const,
    stats: () => [...agentKeys.transactions.all, "stats"] as const,
    lists: () => [...agentKeys.transactions.all, "list"] as const,
    list: (params?: { page?: number; limit?: number }) =>
      [...agentKeys.transactions.lists(), params] as const,
  },
  
  notifications: {
    all: ["agent", "notifications"] as const,
    lists: () => [...agentKeys.notifications.all, "list"] as const,
    list: (params?: { limit?: number; offset?: number }) =>
      [...agentKeys.notifications.lists(), params] as const,
    unreadCount: () => [...agentKeys.notifications.all, "unread-count"] as const,
  },
} as const;
