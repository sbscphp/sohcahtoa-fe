/**
 * Admin API Functions
 */

import { apiClient } from "@/app/_lib/api/client";
import { API_ENDPOINTS } from "@/app/_lib/api/endpoints";

export const adminApi = {
  // ==================== Auth ====================
  auth: {
    login: (data: { email: string; password: string }) =>
      apiClient.post<{ accessToken: string; refreshToken: string }>(
        API_ENDPOINTS.admin.auth.login,
        data,
        { skipAuth: true }
      ),

    verifyLogin: (data: { otp: string }) =>
      apiClient.post<{ accessToken: string; refreshToken: string }>(
        API_ENDPOINTS.admin.auth.verifyLogin,
        data,
        { skipAuth: true }
      ),

    forgotPassword: (data: { email: string }) =>
      apiClient.post<void>(API_ENDPOINTS.admin.auth.forgotPassword, data, { skipAuth: true }),

    resetPassword: (data: { email: string; otp: string; newPassword: string }) =>
      apiClient.post<void>(API_ENDPOINTS.admin.auth.resetPassword, data, { skipAuth: true }),
  },

  // ==================== Dashboard ====================
  dashboard: {
    getStats: () =>
      apiClient.get<unknown>(API_ENDPOINTS.admin.dashboard),

    getPendingApprovals: () =>
      apiClient.get<unknown[]>(API_ENDPOINTS.admin.pendingApprovals),
  },

  // ==================== Customers ====================
  customers: {
    list: (params?: { page?: number; limit?: number }) =>
      apiClient.get<unknown[]>(API_ENDPOINTS.admin.customers.list, { params }),

    getById: (userId: string) =>
      apiClient.get<unknown>(API_ENDPOINTS.admin.customers.getById(userId)),

    flags: {
      list: (userId: string) =>
        apiClient.get<unknown[]>(API_ENDPOINTS.admin.customers.flags.list(userId)),

      create: (userId: string, data: { reason: string; type: string }) =>
        apiClient.post<unknown>(API_ENDPOINTS.admin.customers.flags.create(userId), data),

      getAll: () =>
        apiClient.get<unknown[]>(API_ENDPOINTS.admin.customers.flags.all),

      updateStatus: (flagId: string, data: { status: string }) =>
        apiClient.patch<unknown>(API_ENDPOINTS.admin.customers.flags.updateStatus(flagId), data),
    },
  },

  // ==================== Transactions ====================
  transactions: {
    review: (id: string, data: { notes?: string }) =>
      apiClient.post<unknown>(API_ENDPOINTS.admin.transactions.review(id), data),

    approve: (id: string, data?: { notes?: string }) =>
      apiClient.post<unknown>(API_ENDPOINTS.admin.transactions.approve(id), data),

    reject: (id: string, data: { reason: string }) =>
      apiClient.post<unknown>(API_ENDPOINTS.admin.transactions.reject(id), data),

    settle: (id: string) =>
      apiClient.post<unknown>(API_ENDPOINTS.admin.transactions.settle(id)),
  },
};
