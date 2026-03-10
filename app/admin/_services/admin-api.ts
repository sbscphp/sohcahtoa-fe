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

export interface CreateAdminUserPayload {
  fullName: string;
  email: string;
  phoneNumber: string;
  altPhoneNumber: string | null;
  position: string | null;
  branch: string;
  departmentId: string;
  roleId: string;
}

export type UpdateAdminUserPayload = CreateAdminUserPayload;

export type LookupQuery = "role" | "department" | "branch";

export interface CreateDepartmentPayload {
  name: string;
  departmentEmail: string | null;
  description: string | null;
  branch: string;
  isDefault: boolean;
}

export interface UpdateDepartmentStatusPayload {
  isActive: boolean;
}

export interface CreateAgentPayload {
  name: string;
  email: string;
  phoneNumber: string;
  branch: string;
  attachment: File;
}

export interface AgentDetailsResponseData {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  isActive: boolean;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  branch?: {
    id: string;
    name: string;
    state?: string;
    address?: string;
    email?: string;
    phoneNumber?: string;
    branchManager?: string;
  } | null;
  attachments?: Array<{
    id: string;
    fileUrl: string;
    fileName: string;
    fileSize: number;
    mimeType?: string;
    createdAt?: string;
  }>;
  totalTransactions?: number;
  transactionValue?: number;
}

export interface UpdateAgentStatusPayload {
  isActive: boolean;
}

export interface UpdateAdminUserStatusPayload {
  isActive: boolean;
  reason: string;
}

type RolePermissionAction = "can.view" | "can.create" | "can.edit" | "can.delete";
type RolePermissionScope = "MODULE" | "ROLES" | "USERS";

export interface CreateRolePayload {
  name: string;
  description: string;
  branch: string;
  department: string;
  isDefault: boolean;
  permissions: Partial<Record<string, Partial<Record<RolePermissionScope, RolePermissionAction[]>>>>;
}

export interface AdminRoleDetails {
  id: string;
  name: string;
  description: string | null;
  permissions: Record<string, Record<string, string[]>>;
  branch: string | null;
  departmentId: string | null;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  createdById: string | null;
  _count: {
    users: number;
  };
}

export interface FranchiseStatsData {
  total: number;
  active: number;
  deactivated: number;
  pendingApproval: number;
}

export type AdminTransactionListParams = Record<
  string,
  string | number | boolean | null | undefined
> & {
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
};

export interface AdminTransactionStatsData {
  underReview: number;
  rejected: number;
  requestInformation: number;
  approved: number;
}

export type FranchiseListParams = Record<
  string,
  string | number | boolean | null | undefined
> & {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
};

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

  // ==================== Audit Trail ====================
  auditTrail: {
    list: (params?: {
      page?: number;
      limit?: number;
      search?: string;
      module?: string;
      status?: string;
      dateFrom?: string;
      dateTo?: string;
    }) =>
      apiClient.get<ApiResponse<unknown>>(API_ENDPOINTS.admin.auditTrail, {
        params,
      }),

    export: async (params?: {
      search?: string;
      module?: string;
      status?: string;
      dateFrom?: string;
      dateTo?: string;
    }) => {
      const response = await apiClient.get<Blob | string>(
        API_ENDPOINTS.admin.auditTrailExport,
        { params }
      );

      if (response instanceof Blob) {
        return response;
      }

      return new Blob([response], { type: "text/csv;charset=utf-8;" });
    },
  },

  // ==================== Agent ====================
  agent: {
    list: (params?: {
      page?: number;
      limit?: number;
      search?: string;
      isActive?: boolean;
      branch?: string;
      fromDate?: string;
      toDate?: string;
      sort?: string;
    }) =>
      apiClient.get<ApiResponse<unknown>>(
        API_ENDPOINTS.admin.agent.list,
        { params }
      ),

    getStats: () =>
      apiClient.get<ApiResponse<unknown>>(
        API_ENDPOINTS.admin.agent.stats
      ),

    getById: (id: string) =>
      apiClient.get<ApiResponse<AgentDetailsResponseData>>(
        API_ENDPOINTS.admin.agent.getById(id)
      ),

    transactions: (
      id: string,
      params?: {
        page?: number;
        limit?: number;
        status?: string;
        dateFrom?: string;
        dateTo?: string;
      }
    ) =>
      apiClient.get<ApiResponse<unknown>>(
        API_ENDPOINTS.admin.agent.transactions(id),
        { params }
      ),

    updateStatus: (id: string, data: UpdateAgentStatusPayload) =>
      apiClient.patch<ApiResponse<unknown>>(
        API_ENDPOINTS.admin.agent.updateStatus(id),
        data
      ),

    create: (data: FormData) =>
      apiClient.post<ApiResponse<unknown>>(
        API_ENDPOINTS.admin.agent.list,
        data
      ),
  },

  // ==================== Customers ====================
  customers: {
    list: (params?: {
      page?: number;
      limit?: number;
      search?: string;
      isActive?: boolean;
    }) =>
      apiClient.get<ApiResponse<unknown[]>>(API_ENDPOINTS.admin.customers.list, {
        params,
      }),

    getCounts: () =>
      apiClient.get<ApiResponse<unknown>>(API_ENDPOINTS.admin.customers.counts),

    getById: (userId: string) =>
      apiClient.get<ApiResponse<unknown>>(API_ENDPOINTS.admin.customers.getById(userId)),

    deactivate: (userId: string) =>
      apiClient.patch<ApiResponse<unknown>>(API_ENDPOINTS.admin.customers.deactivate(userId)),

    toggleStatus: (userId: string) =>
      apiClient.patch<ApiResponse<unknown>>(API_ENDPOINTS.admin.customers.toggleStatus(userId)),

    transactions: (
      userId: string,
      params?: {
        page?: number;
        limit?: number;
        status?: string;
        type?: string;
        search?: string;
      }
    ) =>
      apiClient.get<ApiResponse<unknown>>(
        API_ENDPOINTS.admin.customers.transactions(userId),
        { params }
      ),

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

  // ==================== Tickets ====================
  tickets: {
    list: (params?: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
      category?: string;
      priority?: string;
    }) =>
      apiClient.get<ApiResponse<unknown>>(API_ENDPOINTS.admin.tickets.list, {
        params,
      }),

    getStats: () =>
      apiClient.get<ApiResponse<unknown>>(API_ENDPOINTS.admin.tickets.stats),
  },

  // ==================== Outlet ====================
  outlet: {
    franchises: {
      list: (params?: FranchiseListParams) =>
        apiClient.get<ApiResponse<unknown>>(API_ENDPOINTS.admin.outlet.franchises.list, {
          params,
        }),

      getStats: () =>
        apiClient.get<ApiResponse<FranchiseStatsData>>(API_ENDPOINTS.admin.outlet.franchises.stats),
    },
  },

  // ==================== Management ====================
  management: {
    lookups: (query: LookupQuery) =>
      apiClient.get<ApiResponse<unknown>>(API_ENDPOINTS.admin.management.lookups, {
        params: { query },
      }),

    users: {
      list: (params?: { page?: number; limit?: number; search?: string }) =>
        apiClient.get<ApiResponse<unknown>>(
          API_ENDPOINTS.admin.management.users.list,
          { params }
        ),

      export: async () => {
        const response = await apiClient.get<Blob | string>(
          API_ENDPOINTS.admin.management.users.export
        );

        if (response instanceof Blob) {
          return response;
        }

        return new Blob([response], { type: "text/csv;charset=utf-8;" });
      },

      create: (data: CreateAdminUserPayload) =>
        apiClient.post<ApiResponse<unknown>>(
          API_ENDPOINTS.admin.management.users.create,
          data
        ),

      update: (id: string, data: UpdateAdminUserPayload) =>
        apiClient.patch<ApiResponse<unknown>>(
          API_ENDPOINTS.admin.management.users.update(id),
          data
        ),

      updateStatus: (id: string, data: UpdateAdminUserStatusPayload) =>
        apiClient.patch<ApiResponse<unknown>>(
          API_ENDPOINTS.admin.management.users.updateStatus(id),
          data
        ),

      getById: (id: string) =>
        apiClient.get<ApiResponse<unknown>>(
          API_ENDPOINTS.admin.management.users.getById(id)
        ),

      getActivities: (
        id: string,
        params?: {
          page?: number;
          limit?: number;
          search?: string;
          module?: string;
          status?: string;
          dateFrom?: string;
          dateTo?: string;
        }
      ) =>
        apiClient.get<ApiResponse<unknown>>(
          API_ENDPOINTS.admin.management.users.activities(id),
          { params }
        ),

      exportActivities: async (id: string) => {
        const response = await apiClient.get<Blob | string>(
          API_ENDPOINTS.admin.management.users.activitiesExport(id)
        );

        if (response instanceof Blob) {
          return response;
        }

        return new Blob([response], { type: "text/csv;charset=utf-8;" });
      },

      getStats: () =>
        apiClient.get<ApiResponse<unknown>>(
          API_ENDPOINTS.admin.management.users.stats
        ),
    },

    roles: {
      export: async () => {
        const response = await apiClient.get<Blob | string>(
          API_ENDPOINTS.admin.management.roles.export
        );

        if (response instanceof Blob) {
          return response;
        }

        return new Blob([response], { type: "text/csv;charset=utf-8;" });
      },

      create: (data: CreateRolePayload) =>
        apiClient.post<ApiResponse<unknown>>(
          API_ENDPOINTS.admin.management.roles.create,
          data
        ),

      update: (id: string, data: CreateRolePayload) =>
        apiClient.put<ApiResponse<unknown>>(
          API_ENDPOINTS.admin.management.roles.update(id),
          data
        ),

      list: (params?: { page?: number; limit?: number; search?: string; isActive?: boolean }) =>
        apiClient.get<ApiResponse<unknown>>(
          API_ENDPOINTS.admin.management.roles.list,
          { params }
        ),

      getById: (id: string) =>
        apiClient.get<ApiResponse<AdminRoleDetails>>(
          API_ENDPOINTS.admin.management.roles.getById(id)
        ),

      delete: (id: string) =>
        apiClient.delete<ApiResponse<unknown>>(
          API_ENDPOINTS.admin.management.roles.delete(id)
        ),

      getStats: () =>
        apiClient.get<ApiResponse<unknown>>(
          API_ENDPOINTS.admin.management.roles.stats
        ),
    },

    departments: {
      export: async () => {
        const response = await apiClient.get<Blob | string>(
          API_ENDPOINTS.admin.management.departments.export
        );

        if (response instanceof Blob) {
          return response;
        }

        return new Blob([response], { type: "text/csv;charset=utf-8;" });
      },

      create: (data: CreateDepartmentPayload) =>
        apiClient.post<ApiResponse<unknown>>(
          API_ENDPOINTS.admin.management.departments.create,
          data
        ),

      update: (id: string, data: CreateDepartmentPayload) =>
        apiClient.put<ApiResponse<unknown>>(
          API_ENDPOINTS.admin.management.departments.update(id),
          data
        ),

      updateStatus: (id: string, data: UpdateDepartmentStatusPayload) =>
        apiClient.patch<ApiResponse<unknown>>(
          API_ENDPOINTS.admin.management.departments.updateStatus(id),
          data
        ),

      delete: (id: string) =>
        apiClient.delete<ApiResponse<unknown>>(
          API_ENDPOINTS.admin.management.departments.delete(id)
        ),

      list: (params?: { page?: number; limit?: number; search?: string }) =>
        apiClient.get<ApiResponse<unknown>>(
          API_ENDPOINTS.admin.management.departments.list,
          { params }
        ),

      getStats: () =>
        apiClient.get<ApiResponse<unknown>>(
          API_ENDPOINTS.admin.management.departments.stats
        ),
    },
  },

  // ==================== Transactions ====================
  transactions: {
    list: (params?: AdminTransactionListParams) =>
      apiClient.get<ApiResponse<unknown>>(API_ENDPOINTS.admin.transactions.list, {
        params,
      }),

    getStats: () =>
      apiClient.get<ApiResponse<AdminTransactionStatsData>>(
        API_ENDPOINTS.admin.transactions.stats
      ),

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
