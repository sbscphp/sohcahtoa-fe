/**
 * Admin API Functions
 */

import { apiClient, type ApiDownloadResponse, type ApiResponse } from "@/app/_lib/api/client";
import { API_ENDPOINTS } from "@/app/_lib/api/endpoints";
import type { AdminUser } from "@/app/admin/_lib/atoms/admin-auth-atom";
import type { AdminDashboardData } from "@/app/admin/_types/dashboard";

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

export interface UpdateRoleStatusPayload {
  isActive: boolean;
}

export interface ManagementModulesResponseData {
  modules: string[];
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

export interface AgentAllData {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  isActive: boolean;
  isApproved: boolean;
  branchId: string;
  branchName: string;
}

export interface UpdateAgentStatusPayload {
  isActive: boolean;
}

export interface AgentTransactionAmountData {
  nairaEquivalent?: number | string | null;
  foreignAmount?: number | string | null;
  pickupAmount?: number | string | null;
  value?: number | string | null;
}

export interface AgentTransactionEntityData {
  id?: string | null;
  name?: string | null;
  fullName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
}

export interface AgentTransactionDocumentItem {
  id?: string | null;
  name?: string | null;
  fileName?: string | null;
  fileUrl?: string | null;
  type?: string | null;
  status?: string | null;
}

export interface AgentTransactionCustomerData {
  name?: string | null;
  bvn?: string | null;
  tin?: string | null;
}

export interface AgentTransactionDocumentsMeta {
  count?: number | string | null;
}

export interface AgentSingleTransactionMetaData {
  documents?: AgentTransactionDocumentsMeta | null;
  documentsList?: AgentTransactionDocumentItem[] | null;
  destinationCountry?: string | null;
}

export interface AgentSingleTransactionData {
  transactionId: string;
  referenceNumber?: string | null;
  type?: string | null;
  status?: string | null;
  stage?: string | null;
  currency?: string | null;
  pickup?: string | null | Record<string, unknown>;
  receipt?: string | null;
  settlement?: string | null | Record<string, unknown>;
  createdAt?: string | null;
  updatedAt?: string | null;
  amounts?: AgentTransactionAmountData | null;
  agent?: AgentTransactionEntityData | null;
  customer?: AgentTransactionCustomerData | null;
  meta?: AgentSingleTransactionMetaData | null;
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

export interface FranchiseBranchStats {
  total: number;
  active: number;
  deactivated: number;
  pending: number;
}

export interface FranchiseDetailsData {
  id: string;
  franchiseName: string;
  contactPerson: string;
  email: string;
  phoneNumber: string;
  altPhoneNumber: string;
  state: string;
  address: string;
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  branchStats: FranchiseBranchStats;
}

export interface BranchStatsData {
  total: number;
  active: number;
  deactivated: number;
}

export interface BranchListItemData {
  id: string;
  branchName: string;
  branchManager: string;
  email: string;
  address: string;
  isActive: boolean;
}

export interface BranchDetailsData {
  id: string;
  franchiseId: string | null;
  name: string;
  branchEmail: string;
  state: string;
  address: string;
  branchManager: string;
  email: string;
  phoneNumber: string;
  agentName: string | null;
  agentEmail: string | null;
  agentPhoneNumber: string | null;
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBranchPayload {
  branchName: string;
  branchEmail: string;
  state: string;
  address: string;
  branchManager: string;
  email: string;
  phoneNumber: string;
  agentName: string;
  agentEmail: string;
  agentId: string;
  agentPhoneNumber: string;
}

export type BranchAgentListParams = Record<
  string,
  string | number | boolean | null | undefined
> & {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
};

export interface BranchAgentListItemData {
  id?: string | number;
  agentId?: string | number;
  userId?: string | number;
  fullName?: string;
  agentName?: string;
  name?: string;
  phone?: string;
  phoneNumber?: string;
  email?: string;
  emailAddress?: string;
  totalTransactions?: number | string;
  transactionCount?: number | string;
  numberOfTransactions?: number | string;
  transactionVolume?: number | string;
  totalTransactionVolume?: number | string;
  totalVolume?: number | string;
  isActive?: boolean;
  status?: string;
}

export type BranchAgentExportParams = {
  search?: string;
  isActive?: boolean;
};

export type BranchTransactionListParams = AdminTransactionListParams;

export type BranchTransactionExportParams = {
  search?: string;
  status?: string;
};

export interface CreateFranchisePayload {
  franchiseName: string;
  state: string;
  address: string;
  contactPersonName: string;
  email: string;
  phoneNumber: string;
  altPhoneNumber: string;
}

export type UpdateFranchisePayload = CreateFranchisePayload;

export interface OutletStatesData {
  states: string[];
}

export type BranchListParams = Record<
  string,
  string | number | boolean | null | undefined
> & {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
};

export interface TicketAttachment {
  id: string;
  ticketId: string;
  fileUrl: string;
  fileName: string | null;
  fileSize: number | null;
  mimeType: string | null;
  createdAt: string;
}

export interface TicketComment {
  id: string;
  ticketId: string;
  adminId: string | null;
  message: string;
  createdAt: string;
  updatedAt?: string;
}

export interface TicketCommentAdmin {
  id: string;
  fullName: string;
}

export interface TicketCommentItem {
  id: string;
  message: string;
  createdAt: string;
  admin: TicketCommentAdmin | null;
}

export interface AddTicketCommentPayload {
  message: string;
}

export type TicketStatusCode =
  | "OPEN"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "REOPENED"
  | "CLOSED";

export interface TicketStatusOptionItem {
  status: TicketStatusCode;
  note: string;
  condition?: string;
}

export interface AssignTicketPayload {
  adminId: string;
}

export interface ManagementAdminUserItem {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  isActive: boolean;
  roleName: string | null;
  departmentName: string | null;
}

export interface TicketDetailsResponseData {
  id: string;
  reference: string;
  customerId: string;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhoneNumber?: string | null;
  customer?: {
    id: string;
    fullName: string | null;
    email: string | null;
    phoneNumber: string | null;
  } | null;
  caseType: string;
  description: string | null;
  priority: string;
  status: string;
  assignedAgentId: string | null;
  assignedAgent?: {
    id: string;
    fullName: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
  dateAssigned?: string | null;
  createdBy?: string | null;
  attachments: TicketAttachment[];
  comments: TicketComment[];
}

export interface UpdateTicketStatusPayload {
  status: "IN_PROGRESS" | "RESOLVED" | "REOPENED" | "CLOSED" | "OPEN";
  notes: string;
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

export type AdminComplianceReportsListParams = Record<
  string,
  string | number | boolean | null | undefined
> & {
  page?: number;
  limit?: number;
  search?: string;
  status?: "" | "PENDING" | "SUCCESS" | "FAILED" | "COMPLETED";
  fileType?: string;
  channel?: string;
};

export type AdminComplianceReportsExportParams = {
  search?: string;
  status?: "" | "PENDING" | "SUCCESS" | "FAILED";
};

export interface AdminComplianceReportListItem {
  id: string;
  reportName: string;
  reportingDate: string;
  fileType: string;
  status: string;
  channel: string;
  reference: string;
  url: string | null;
  createdAt: string;
}

export interface AdminComplianceReportDetailsData {
  reportName: string;
  type: string;
  fileType: string;
  channel: string;
  status: string;
  reference: string;
  submittedOn: string;
  reportDate: string;
  endDate: string | null;
  fileUrl: string | null;
  fileSize: string | number | null;
}

export interface AdminComplianceDashboardData {
  overview: {
    submittedReports: number;
    pendingSubmissions: number;
    failedSubmissions: number;
    rejectedReports: number;
  };
  insights: {
    sla: {
      complianceRate: number;
      onTime: number;
      late: number;
      missed: number;
      trend: {
        delta: number;
      };
      target: number;
    };
    screening: {
      passed: number;
      flagged: number;
      rejected: number;
      pendingReview: number;
      totalScreened: number;
    };
    fxSold: {
      PTA: number;
      BTA: number;
      School: number;
      Medical: number;
      Imports: number;
      total: number;
    };
  };
}

export type AdminRegulatoryAuditLogsListParams = Record<
  string,
  string | number | boolean | null | undefined
> & {
  page?: number;
  limit?: number;
  search?: string;
  severity?: "" | "INFO" | "WARNING" | "ERROR" | "CRITICAL";
};

export interface AdminRegulatoryAuditLogListItem {
  id: string;
  timestamp: string;
  userOrSystem: string;
  actionPerformed: string;
  actionResult: string;
  channel: string;
  auditId: string;
}

export interface AdminRegulatoryAuditLogDetailsData {
  timestamp: string;
  source: string;
  description: string;
  duplicate: boolean;
  result: string;
  auditId: string;
  fileUrl: string | null;
  user: string;
}

export type AdminRegulatoryLogsListParams = Record<
  string,
  string | number | boolean | null | undefined
> & {
  page?: number;
  limit?: number;
  search?: string;
  status?: "" | "PENDING" | "SUCCESS" | "FAILED" | "COMPLETED";
};

export interface AdminRegulatoryLogListItem {
  id: string;
  timestamp: string;
  userOrSystem: string;
  actionPerformed: string;
  actionResult: string;
  channel: string;
  regulatoryId: string;
}

export interface AdminRegulatoryLogDetailsData {
  timestamp: string;
  source: string;
  description: string;
  duplicate: boolean;
  response: string;
  result: string;
  regulatoryId: string;
  channel: string;
  fileUrl: string | null;
}

export type AdminTrmsSubmissionsListParams = Record<
  string,
  string | number | boolean | null | undefined
> & {
  page?: number;
  limit?: number;
  search?: string;
  status?: "" | "BUSY" | "AWAITING_VERIFICATION" | "APPROVED" | "REJECTED";
};

export interface AdminTrmsSubmissionListItem {
  id: string;
  transactionId: string;
  customerName: string;
  currencyPair: string;
  type: string;
  amount: string;
  documents: number;
  status: string;
  createdAt: string;
}

export interface AdminTrmsSubmissionDetailsData {
  applicantName: string;
  transactionId: string;
  type: string;
  currencyPair: string;
  amount: string;
  documents: number;
  status: string;
  formAId: string | null;
  submittedOn: string;
  fileUrl: string | null;
}

export interface AdminTrmsDashboardData {
  submittedReports: number;
  pendingSubmissions: number;
  failedSubmissions: number;
  rejectedReports: number;
}

export interface AdminTransactionStatsData {
  underReview: number;
  rejected: number;
  requestInformation: number;
  approved: number;
}

export interface WorkflowStatsData {
  pending: number;
  completed: number;
  rejected: number;
}

export type AdminWorkflowActionsListParams = Record<
  string,
  string | number | boolean | null | undefined
> & {
  page?: number;
  limit?: number;
  status?: "Pending" | "Rejected" | "Approved";
  module?: string;
  search?: string;
};

export interface AdminWorkflowActionListItem {
  id: string;
  module: string;
  workflowAction: string;
  actionNeeded: string;
  status: string;
  dateInitiated: string;
  escalationMinutes: number;
  title: string;
}

export interface AdminTransactionDetailsPayload {
  transactionValueFx?: number | string | null;
  transactionValueNgn?: number | string | null;
  requesterType?: string | null;
  bvnNumber?: string | null;
  numberOfDocuments?: number | string | null;
  pickupLocation?: string | null;
}

export interface AdminTransactionDetailsData {
  id: string;
  reference: string;
  date: string;
  time: string;
  customerName: string;
  customerType: string;
  transactionType: string;
  fxType: string;
  transactionStage: string;
  workflowStage: string;
  requestStatus: string;
  details: AdminTransactionDetailsPayload | null;
  raw?: Record<string, unknown> | null;
}

export type FranchiseTransactionListParams = AdminTransactionListParams;

export interface FranchiseTransactionListItemData {
  id: string;
  transactionId?: string | null;
  reference?: string | null;
  type?: string | null;
  transactionType?: string | null;
  status?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  date?: string | null;
  transactionDate?: string | null;
  branchName?: string | null;
  agentName?: string | null;
  branch?: {
    name?: string | null;
  } | null;
  agent?: {
    fullName?: string | null;
    name?: string | null;
  } | null;
}

export interface ReportModuleItem {
  key: string;
  name: string;
  description?: string;
}

export interface GenerateReportPayload {
  module: string;
  startDate: string;
  endDate: string;
  format: "CSV" | "PDF";
}

export interface GeneratedReportFile {
  blob: Blob;
  fileName: string | null;
}

function extractFilenameFromContentDisposition(contentDisposition: string | null): string | null {
  if (!contentDisposition) {
    return null;
  }

  const utf8Match = contentDisposition.match(/filename\*\s*=\s*UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1]).replace(/^["']|["']$/g, "");
    } catch {
      return utf8Match[1].replace(/^["']|["']$/g, "");
    }
  }

  const basicMatch = contentDisposition.match(/filename\s*=\s*("?)([^";]+)\1/i);
  if (basicMatch?.[2]) {
    return basicMatch[2].trim();
  }

  return null;
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

export type RateListParams = Record<
  string,
  string | number | boolean | null | undefined
> & {
  page?: number;
  limit?: number;
  search?: string;
  status?: "" | "active" | "schedule";
};

export type RateExportParams = {
  search?: string;
  status?: "" | "active" | "schedule";
};

export interface CreateRatePayload {
  fromCurrency: string;
  toCurrency: string;
  buyRate: number;
  sellRate: number;
  validFrom: string;
  validUntil: string;
  note?: string;
}

export interface RateDetailsData {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  rate?: string | number | null;
  buyRate: string | number;
  sellRate: string | number;
  source?: string | null;
  note?: string | null;
  validFrom: string;
  validUntil: string;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
}

export interface SettlementDashboardStats {
  currentBalance: number;
  pendingReconciliation: number;
  totalEscrowAccounts: number;
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
      apiClient.get<ApiResponse<AdminDashboardData>>(
        API_ENDPOINTS.admin.dashboard
      ),

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

    getAll: () =>
      apiClient.get<ApiResponse<AgentAllData[]>>(API_ENDPOINTS.admin.agent.all),

    export: async (params?: {
      search?: string;
      isActive?: boolean;
      branch?: string;
      fromDate?: string;
      toDate?: string;
      sort?: string;
    }) => {
      const response = await apiClient.get<Blob | string>(
        API_ENDPOINTS.admin.agent.export,
        { params }
      );

      if (response instanceof Blob) {
        return response;
      }

      return new Blob([response], { type: "text/csv;charset=utf-8;" });
    },

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

    getTransactionById: (id: string, transactionId: string) =>
      apiClient.get<ApiResponse<AgentSingleTransactionData>>(
        API_ENDPOINTS.admin.agent.getTransactionById(id, transactionId)
      ),

    downloadTransactionReceipt: (id: string, transactionId: string): Promise<ApiDownloadResponse> =>
      apiClient.download(
        API_ENDPOINTS.admin.agent.downloadTransactionReceipt(id, transactionId)
      ),

    updateStatus: (id: string, data: UpdateAgentStatusPayload) =>
      apiClient.patch<ApiResponse<unknown>>(
        API_ENDPOINTS.admin.agent.updateStatus(id),
        data
      ),

    update: (id: string, data: FormData) =>
      apiClient.patch<ApiResponse<unknown>>(API_ENDPOINTS.admin.agent.getById(id), data),

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

    export: async (params?: {
      search?: string;
      isActive?: boolean;
    }) => {
      const response = await apiClient.get<Blob | string>(
        API_ENDPOINTS.admin.customers.export,
        { params }
      );

      if (response instanceof Blob) {
        return response;
      }

      return new Blob([response], { type: "text/csv;charset=utf-8;" });
    },

    getAll: () =>
      apiClient.get<ApiResponse<unknown[]>>(API_ENDPOINTS.admin.customers.all),

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

    export: async (params?: {
      search?: string;
      status?: string;
      category?: string;
      priority?: string;
    }) => {
      const response = await apiClient.get<Blob | string>(
        API_ENDPOINTS.admin.tickets.export,
        { params }
      );

      if (response instanceof Blob) {
        return response;
      }

      return new Blob([response], { type: "text/csv;charset=utf-8;" });
    },

    create: (data: FormData) =>
      apiClient.post<ApiResponse<unknown>>(API_ENDPOINTS.admin.tickets.create, data),

    update: (id: string, data: FormData) =>
      apiClient.patch<ApiResponse<unknown>>(API_ENDPOINTS.admin.tickets.update(id), data),

    getStats: () =>
      apiClient.get<ApiResponse<unknown>>(API_ENDPOINTS.admin.tickets.stats),

    getCaseTypes: () =>
      apiClient.get<ApiResponse<string[]>>(API_ENDPOINTS.admin.tickets.caseTypes),

    getStatuses: () =>
      apiClient.get<ApiResponse<TicketStatusOptionItem[]>>(
        API_ENDPOINTS.admin.tickets.statuses
      ),

    getById: (id: string) =>
      apiClient.get<ApiResponse<TicketDetailsResponseData>>(
        API_ENDPOINTS.admin.tickets.getById(id)
      ),

    getComments: (id: string) =>
      apiClient.get<ApiResponse<TicketCommentItem[]>>(
        API_ENDPOINTS.admin.tickets.comments(id)
      ),

    addComment: (id: string, data: AddTicketCommentPayload) =>
      apiClient.post<ApiResponse<unknown>>(
        API_ENDPOINTS.admin.tickets.comments(id),
        data
      ),

    assign: (id: string, data: AssignTicketPayload) =>
      apiClient.post<ApiResponse<unknown>>(
        API_ENDPOINTS.admin.tickets.assign(id),
        data
      ),

    updateStatus: (id: string, data: UpdateTicketStatusPayload) =>
      apiClient.patch<ApiResponse<unknown>>(
        API_ENDPOINTS.admin.tickets.updateStatus(id),
        data
      ),
  },

  // ==================== Rate ====================
  rate: {
    list: (params?: RateListParams) =>
      apiClient.get<ApiResponse<unknown>>(API_ENDPOINTS.admin.rate.list, {
        params,
      }),

    export: async (params?: RateExportParams) => {
      const response = await apiClient.get<Blob | string>(
        API_ENDPOINTS.admin.rate.export,
        { params }
      );

      if (response instanceof Blob) {
        return response;
      }

      return new Blob([response], { type: "text/csv;charset=utf-8;" });
    },

    create: (data: CreateRatePayload) =>
      apiClient.post<ApiResponse<unknown>>(API_ENDPOINTS.admin.rate.create, data),

    getById: (id: string) =>
      apiClient.get<ApiResponse<RateDetailsData>>(API_ENDPOINTS.admin.rate.getById(id)),

    update: (id: string, data: CreateRatePayload) =>
      apiClient.put<ApiResponse<unknown>>(API_ENDPOINTS.admin.rate.update(id), data),

    getStats: () =>
      apiClient.get<ApiResponse<unknown>>(API_ENDPOINTS.admin.rate.stats),
  },

  // ==================== Outlet ====================
  outlet: {
    states: {
      list: () =>
        apiClient.get<ApiResponse<string[]>>(API_ENDPOINTS.admin.outlet.states),
    },
    franchises: {
      list: (params?: FranchiseListParams) =>
        apiClient.get<ApiResponse<unknown>>(API_ENDPOINTS.admin.outlet.franchises.list, {
          params,
        }),

      create: (data: CreateFranchisePayload) =>
        apiClient.post<ApiResponse<unknown>>(API_ENDPOINTS.admin.outlet.franchises.create, data),

      export: async (params?: { search?: string; status?: string }) => {
        const response = await apiClient.get<Blob | string>(
          API_ENDPOINTS.admin.outlet.franchises.export,
          { params }
        );

        if (response instanceof Blob) {
          return response;
        }

        return new Blob([response], { type: "text/csv;charset=utf-8;" });
      },

      getStats: () =>
        apiClient.get<ApiResponse<FranchiseStatsData>>(API_ENDPOINTS.admin.outlet.franchises.stats),

      getById: (id: string) =>
        apiClient.get<ApiResponse<FranchiseDetailsData>>(API_ENDPOINTS.admin.outlet.franchises.getById(id)),

      update: (id: string, data: UpdateFranchisePayload) =>
        apiClient.put<ApiResponse<unknown>>(API_ENDPOINTS.admin.outlet.franchises.update(id), data),

      branches: {
        list: (id: string, params?: BranchListParams) =>
          apiClient.get<ApiResponse<BranchListItemData[]>>(
            API_ENDPOINTS.admin.outlet.franchises.branches(id),
            { params }
          ),
      },
      transactions: {
        list: (id: string, params?: FranchiseTransactionListParams) =>
          apiClient.get<ApiResponse<FranchiseTransactionListItemData[]>>(
            API_ENDPOINTS.admin.outlet.franchises.transactions(id),
            { params }
          ),
      },
    },
    branches: {
      list: (params?: BranchListParams) =>
        apiClient.get<ApiResponse<BranchListItemData[]>>(API_ENDPOINTS.admin.outlet.branches.list, {
          params,
        }),

      getById: (id: string) =>
        apiClient.get<ApiResponse<BranchDetailsData>>(API_ENDPOINTS.admin.outlet.branches.getById(id)),

      create: (data: CreateBranchPayload) =>
        apiClient.post<ApiResponse<unknown>>(API_ENDPOINTS.admin.outlet.branches.create, data),

      export: async (params?: { search?: string; isActive?: boolean }) => {
        const response = await apiClient.get<Blob | string>(
          API_ENDPOINTS.admin.outlet.branches.export,
          { params }
        );

        if (response instanceof Blob) {
          return response;
        }

        return new Blob([response], { type: "text/csv;charset=utf-8;" });
      },

      getStats: () =>
        apiClient.get<ApiResponse<BranchStatsData>>(API_ENDPOINTS.admin.outlet.branches.stats),

      agents: {
        list: (id: string, params?: BranchAgentListParams) =>
          apiClient.get<ApiResponse<unknown>>(
            API_ENDPOINTS.admin.outlet.branches.agents.list(id),
            { params }
          ),
        export: async (id: string, params?: BranchAgentExportParams) => {
          const response = await apiClient.get<Blob | string>(
            API_ENDPOINTS.admin.outlet.branches.agents.export(id),
            { params }
          );

          if (response instanceof Blob) {
            return response;
          }

          return new Blob([response], { type: "text/csv;charset=utf-8;" });
        },
      },

      transactions: {
        list: (id: string, params?: BranchTransactionListParams) =>
          apiClient.get<ApiResponse<unknown>>(
            API_ENDPOINTS.admin.outlet.branches.transactions.list(id),
            { params }
          ),
        export: async (id: string, params?: BranchTransactionExportParams) => {
          const response = await apiClient.get<Blob | string>(
            API_ENDPOINTS.admin.outlet.branches.transactions.export(id),
            { params }
          );

          if (response instanceof Blob) {
            return response;
          }

          return new Blob([response], { type: "text/csv;charset=utf-8;" });
        },
      },
    },
  },

  // ==================== Management ====================
  management: {
    lookups: (query: LookupQuery) =>
      apiClient.get<ApiResponse<unknown>>(API_ENDPOINTS.admin.management.lookups, {
        params: { query },
      }),

    modules: {
      list: () =>
        apiClient.get<ApiResponse<ManagementModulesResponseData>>(
          API_ENDPOINTS.admin.management.modules
        ),
    },

    users: {
      getAll: () =>
        apiClient.get<ApiResponse<ManagementAdminUserItem[]>>(
          API_ENDPOINTS.admin.management.users.all
        ),

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

      updateStatus: (id: string, data: UpdateRoleStatusPayload) =>
        apiClient.patch<ApiResponse<unknown>>(
          API_ENDPOINTS.admin.management.roles.updateStatus(id),
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

    export: async (params?: AdminTransactionListParams) => {
      const response = await apiClient.get<Blob | string>(
        API_ENDPOINTS.admin.transactions.export,
        { params }
      );

      if (response instanceof Blob) {
        return response;
      }

      return new Blob([response], { type: "text/csv;charset=utf-8;" });
    },

    getStats: () =>
      apiClient.get<ApiResponse<AdminTransactionStatsData>>(
        API_ENDPOINTS.admin.transactions.stats
      ),

    getById: (id: string) =>
      apiClient.get<ApiResponse<AdminTransactionDetailsData>>(
        API_ENDPOINTS.admin.transactions.getById(id)
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

    requestTransactionInfo: (
      id: string,
      data: { notes: string; fields: string[] }
    ) =>
      apiClient.post<ApiResponse<unknown>>(
        API_ENDPOINTS.admin.transactions.requestTransactionInfo(id),
        data
      ),

    approveDocument: (id: string, documentId: string, data: { notes: string }) =>
      apiClient.post<ApiResponse<unknown>>(
        API_ENDPOINTS.admin.transactions.approveDocument(id, documentId),
        data
      ),

    requestDocumentInfo: (id: string, documentId: string, data: { comment: string }) =>
      apiClient.post<ApiResponse<unknown>>(
        API_ENDPOINTS.admin.transactions.requestDocumentInfo(id, documentId),
        data
      ),

    rejectDocument: (
      id: string,
      documentId: string,
      data: { reason: string; notes: string }
    ) =>
      apiClient.post<ApiResponse<unknown>>(
        API_ENDPOINTS.admin.transactions.rejectDocument(id, documentId),
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

  // ==================== Reports ====================
  reports: {
    modules: () =>
      apiClient.get<ApiResponse<ReportModuleItem[]>>(
        API_ENDPOINTS.admin.reports.modules
      ),

    generate: async (data: GenerateReportPayload): Promise<GeneratedReportFile> => {
      const response = await apiClient.post<Response>(
        API_ENDPOINTS.admin.reports.generate,
        data,
        { returnRawResponse: true }
      );

      const contentDisposition = response.headers.get("content-disposition");
      const fileName = extractFilenameFromContentDisposition(contentDisposition);
      const blob = await response.blob();

      return { blob, fileName };
    },
  },

  // ==================== Settlement ====================
  settlement: {
    getStats: () =>
      apiClient.get<ApiResponse<SettlementDashboardStats>>(
        API_ENDPOINTS.admin.settlement.stats
      ),

    listDiscrepancies: (params?: { page?: number; limit?: number }) =>
      apiClient.get<ApiResponse<unknown>>(
        API_ENDPOINTS.admin.settlement.discrepancies,
        { params }
      ),

    listPendingReconciliations: (params?: { page?: number; limit?: number }) =>
      apiClient.get<ApiResponse<unknown>>(
        API_ENDPOINTS.admin.settlement.pendingReconciliations,
        { params }
      ),

    listEscrowAccounts: () =>
      apiClient.get<ApiResponse<unknown>>(
        API_ENDPOINTS.admin.settlement.escrowAccounts
      ),

    listFundingTransactions: (params?: { page?: number; limit?: number }) =>
      apiClient.get<ApiResponse<unknown>>(
        API_ENDPOINTS.admin.settlement.fundingTransactions,
        { params }
      ),
  },

  // ==================== Regulatory ====================
  regulatory: {
    compliance: {
      dashboard: () =>
        apiClient.get<ApiResponse<AdminComplianceDashboardData>>(
          API_ENDPOINTS.admin.regulatory.compliance.dashboard
        ),

      list: (params?: AdminComplianceReportsListParams) =>
        apiClient.get<ApiResponse<AdminComplianceReportListItem[]>>(
          API_ENDPOINTS.admin.regulatory.compliance.reports,
          { params }
        ),

      getById: (id: string) =>
        apiClient.get<ApiResponse<AdminComplianceReportDetailsData>>(
          API_ENDPOINTS.admin.regulatory.compliance.reportById(id)
        ),

      export: async (params?: AdminComplianceReportsExportParams) => {
        const response = await apiClient.post<Blob | string>(
          API_ENDPOINTS.admin.regulatory.compliance.reportsExport,
          params ?? {}
        );

        if (response instanceof Blob) {
          return response;
        }

        return new Blob([response], { type: "text/csv;charset=utf-8;" });
      },
    },
    logs: {
      audit: {
        list: (params?: AdminRegulatoryAuditLogsListParams) =>
          apiClient.get<ApiResponse<AdminRegulatoryAuditLogListItem[]>>(
            API_ENDPOINTS.admin.regulatory.logs.audit,
            { params }
          ),
        export: async (params?: AdminRegulatoryAuditLogsListParams) => {
          const response = await apiClient.get<Blob | string>(
            API_ENDPOINTS.admin.regulatory.logs.auditExport,
            { params }
          );

          if (response instanceof Blob) {
            return response;
          }

          return new Blob([response], { type: "text/csv;charset=utf-8;" });
        },
        getById: (id: string) =>
          apiClient.get<ApiResponse<AdminRegulatoryAuditLogDetailsData>>(
            API_ENDPOINTS.admin.regulatory.logs.auditById(id)
          ),
      },
      regulatory: {
        list: (params?: AdminRegulatoryLogsListParams) =>
          apiClient.get<ApiResponse<AdminRegulatoryLogListItem[]>>(
            API_ENDPOINTS.admin.regulatory.logs.regulatory,
            { params }
          ),
        export: async (params?: AdminRegulatoryLogsListParams) => {
          const response = await apiClient.get<Blob | string>(
            API_ENDPOINTS.admin.regulatory.logs.regulatoryExport,
            { params }
          );

          if (response instanceof Blob) {
            return response;
          }

          return new Blob([response], { type: "text/csv;charset=utf-8;" });
        },
        getById: (id: string) =>
          apiClient.get<ApiResponse<AdminRegulatoryLogDetailsData>>(
            API_ENDPOINTS.admin.regulatory.logs.regulatoryById(id)
          ),
      },
    },
    trms: {
      list: (params?: AdminTrmsSubmissionsListParams) =>
        apiClient.get<ApiResponse<AdminTrmsSubmissionListItem[]>>(
          API_ENDPOINTS.admin.regulatory.trms.list,
          { params }
        ),

      export: async (params?: {
        search?: string;
        status?: "" | "BUSY" | "AWAITING_VERIFICATION" | "APPROVED" | "REJECTED";
      }) => {
        const response = await apiClient.post<Blob | string>(
          API_ENDPOINTS.admin.regulatory.trms.export,
          params ?? {}
        );

        if (response instanceof Blob) {
          return response;
        }

        return new Blob([response], { type: "text/csv;charset=utf-8;" });
      },

      getByTransactionId: (transactionId: string) =>
        apiClient.get<ApiResponse<AdminTrmsSubmissionDetailsData>>(
          API_ENDPOINTS.admin.regulatory.trms.details(transactionId)
        ),

      stats: () =>
        apiClient.get<ApiResponse<AdminTrmsDashboardData>>(
          API_ENDPOINTS.admin.regulatory.trms.stats
        ),
    },
  },

  // ==================== Workflow ====================
  workflow: {
    getStats: () =>
      apiClient.get<ApiResponse<WorkflowStatsData>>("/api/admin/workflow/stats"),

    listActions: (params?: AdminWorkflowActionsListParams) =>
      apiClient.get<ApiResponse<AdminWorkflowActionListItem[]>>(
        "/api/admin/workflow/actions",
        { params }
      ),
  },
};
