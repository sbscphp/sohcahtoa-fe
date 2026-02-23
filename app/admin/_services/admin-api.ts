/**
 * Admin API Functions
 */

import { apiClient, type ApiResponse } from "@/app/_lib/api/client";
import { API_ENDPOINTS } from "@/app/_lib/api/endpoints";
import type { AdminUser } from "@/app/admin/_lib/atoms/admin-auth-atom";

// ==================== Response Data Types ====================

interface LoginResponseData {
  message: string;
}

interface ValidateOtpResponseData {
  resetToken: string;
}

export const adminApi = {
  // ==================== Auth ====================
  auth: {
    login: (data: { email: string; password: string }) =>
      apiClient.post<ApiResponse<LoginResponseData>>(
        API_ENDPOINTS.admin.auth.login,
        data,
        { skipAuth: true }
      ),

    verifyLogin: (data: { otp: string; email: string }) =>
      apiClient.post<ApiResponse<AdminUser>>(
        API_ENDPOINTS.admin.auth.verifyLogin,
        data,
        { skipAuth: true }
      ),

    forgotPassword: (data: { email: string }) =>
      apiClient.post<ApiResponse<null>>(
        API_ENDPOINTS.admin.auth.forgotPassword,
        data,
        { skipAuth: true }
      ),

    validateOtp: (data: { otp: string }) =>
      apiClient.post<ApiResponse<ValidateOtpResponseData>>(
        API_ENDPOINTS.admin.auth.otp.validate,
        data,
        { skipAuth: true }
      ),

    resetPassword: (data: { resetToken: string; password: string }) =>
      apiClient.post<ApiResponse<null>>(
        API_ENDPOINTS.admin.auth.resetPassword,
        data,
        { skipAuth: true }
      ),

    logout: () =>
      apiClient.post<ApiResponse<null>>(API_ENDPOINTS.admin.auth.logout),
  },

  // ==================== Dashboard ====================
  dashboard: {
    getStats: () =>
      apiClient.get<ApiResponse<unknown>>(API_ENDPOINTS.admin.dashboard),

    getPendingApprovals: () =>
      apiClient.get<ApiResponse<unknown[]>>(API_ENDPOINTS.admin.pendingApprovals),
  },

  // ==================== Customers ====================
  customers: {
    list: (params?: { page?: number; limit?: number }) =>
      apiClient.get<ApiResponse<unknown[]>>(API_ENDPOINTS.admin.customers.list, { params }),

    getById: (userId: string) =>
      apiClient.get<ApiResponse<unknown>>(API_ENDPOINTS.admin.customers.getById(userId)),

    flags: {
      list: (userId: string) =>
        apiClient.get<ApiResponse<unknown[]>>(
          API_ENDPOINTS.admin.customers.flags.list(userId)
        ),

      create: (userId: string, data: { reason: string; type: string }) =>
        apiClient.post<ApiResponse<unknown>>(
          API_ENDPOINTS.admin.customers.flags.create(userId),
          data
        ),

      getAll: () =>
        apiClient.get<ApiResponse<unknown[]>>(API_ENDPOINTS.admin.customers.flags.all),

      updateStatus: (flagId: string, data: { status: string }) =>
        apiClient.patch<ApiResponse<unknown>>(
          API_ENDPOINTS.admin.customers.flags.updateStatus(flagId),
          data
        ),
    },
  },

  // ==================== Management ====================
  management: {
    users: {
      list: (params?: { page?: number; limit?: number; search?: string }) =>
        apiClient.get<ApiResponse<unknown>>(
          API_ENDPOINTS.admin.management.users.list,
          { params }
        ),

      getStats: () =>
        apiClient.get<ApiResponse<unknown>>(
          API_ENDPOINTS.admin.management.users.stats
        ),
    },

    roles: {
      list: (params?: { page?: number; limit?: number; search?: string }) =>
        apiClient.get<ApiResponse<unknown>>(
          API_ENDPOINTS.admin.management.roles.list,
          { params }
        ),

      getStats: () =>
        apiClient.get<ApiResponse<unknown>>(
          API_ENDPOINTS.admin.management.roles.stats
        ),
    },
  },

  // ==================== Transactions ====================
  transactions: {
    review: (id: string, data: { notes?: string }) =>
      apiClient.post<ApiResponse<unknown>>(
        API_ENDPOINTS.admin.transactions.review(id),
        data
      ),

    approve: (id: string, data?: { notes?: string }) =>
      apiClient.post<ApiResponse<unknown>>(
        API_ENDPOINTS.admin.transactions.approve(id),
        data
      ),

    reject: (id: string, data: { reason: string }) =>
      apiClient.post<ApiResponse<unknown>>(
        API_ENDPOINTS.admin.transactions.reject(id),
        data
      ),

    settle: (id: string) =>
      apiClient.post<ApiResponse<unknown>>(
        API_ENDPOINTS.admin.transactions.settle(id)
      ),
  },
};
