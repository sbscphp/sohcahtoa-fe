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
  
  customers: {
    all: ["admin", "customers"] as const,
    lists: () => [...adminKeys.customers.all, "list"] as const,
    list: (params?: { page?: number; limit?: number }) =>
      [...adminKeys.customers.lists(), params] as const,
    details: () => [...adminKeys.customers.all, "detail"] as const,
    detail: (userId: string) => [...adminKeys.customers.details(), userId] as const,
    flags: {
      all: (userId: string) => [...adminKeys.customers.detail(userId), "flags"] as const,
      list: (userId: string) => [...adminKeys.customers.flags.all(userId), "list"] as const,
      allFlags: () => [...adminKeys.customers.all, "flags", "all"] as const,
    },
  },
  
  transactions: {
    all: ["admin", "transactions"] as const,
    lists: () => [...adminKeys.transactions.all, "list"] as const,
    list: (params?: { page?: number; limit?: number; status?: string }) =>
      [...adminKeys.transactions.lists(), params] as const,
    details: () => [...adminKeys.transactions.all, "detail"] as const,
    detail: (id: string) => [...adminKeys.transactions.details(), id] as const,
  },
  
  management: {
    all: ["admin", "management"] as const,
    users: {
      all: () => [...adminKeys.management.all, "users"] as const,
      stats: () => [...adminKeys.management.users.all(), "stats"] as const,
      list: (params?: { page?: number; limit?: number; search?: string }) =>
        [...adminKeys.management.users.all(), "list", params] as const,
    },
    roles: {
      all: () => [...adminKeys.management.all, "roles"] as const,
      stats: () => [...adminKeys.management.roles.all(), "stats"] as const,
      list: () => [...adminKeys.management.roles.all(), "list"] as const,
      detail: (id: string) => [...adminKeys.management.roles.all(), "detail", id] as const,
    },
    departments: {
      all: () => [...adminKeys.management.all, "departments"] as const,
      list: () => [...adminKeys.management.departments.all(), "list"] as const,
      detail: (id: string) => [...adminKeys.management.departments.all(), "detail", id] as const,
    },
  },
} as const;

// ==================== Agent Query Keys ====================

export const agentKeys = {
  all: ["agent"] as const,
  
  transactions: {
    all: ["agent", "transactions"] as const,
    lists: () => [...agentKeys.transactions.all, "list"] as const,
    list: (params?: { page?: number; limit?: number }) =>
      [...agentKeys.transactions.lists(), params] as const,
  },
} as const;
