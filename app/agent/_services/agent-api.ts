/**
 * Agent API Functions
 * Mirrors customer/admin API patterns but scoped to agent auth flows.
 */

import { apiClient, ApiRequestConfig, type ApiResponse } from "@/app/_lib/api/client";
import { AGENT_API_ENDPOINTS } from "@/app/agent/_services/endpoints";
import type {
  AgentAuthProfileResponse,
  AgentCustomerDetailsResponse,
  AgentDashboardRange,
  AgentDashboardRecentTransactionsResponse,
  AgentDashboardTransactionsByTypeResponse,
  AgentCustomerListParams,
  AgentCustomerListResponse,
  AgentCustomerStatsResponse,
  AgentCustomerTransactionsResponse,
  AgentCustomerUpdateRequest,
  AgentCustomerUpdateResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  NotificationPreferencesResponse,
  NotificationsListResponse,
  ReadAllNotificationsResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  SendOtpRequestNigerian,
  SendOtpResponse,
  UnreadCountResponse,
  UpdateNotificationPreferencesRequest,
  ValidateOtpRequestNigerian,
  ValidateOtpResponse,
  VerifyResetOtpRequest,
  VerifyResetOtpResponse,
  VerifyBvnRequest,
  VerifyBvnResponse,
  CalculateTransactionRateRequest,
  CalculateTransactionRateResponse,
  TransactionListParams,
  TransactionsListApiResponse,
  TransactionDetailApiResponse,
  TransactionVirtualAccountResponse,
  TransactionDepositInstructionsResponse,
  TransactionDepositStatusResponse,
  TransactionRatesListResponse,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  Transaction,
  CheckTransactionLimitsRequest,
  CheckTransactionLimitsResponse,
  TransactionOverviewRequest,
  TransactionOverviewResponse,
  SupportTicketDetailResponse,
  AgentSupportTicketListResponse,
  AgentSupportTicketDetailResponse,
} from "@/app/_lib/api/types";

interface AgentLoginResponseData {
  message: string;
  requiresVerification?: boolean;
  requiresPasswordSet?: boolean;
}

// Response when completing agent login (returns tokens + user)
type AgentLoginCompleteResponse = LoginResponse;

export interface AgentVerifyLoginPayload {
  email: string;
  otp: string;
}

export interface AgentCreatePasswordPayload {
  email: string;
  otp: string;
  password: string;
  confirmPassword: string;
}

// Payload for /api/agent/customer-auth/create-account (agent-initiated customer creation)
export interface AgentCreateCustomerAccountRequest {
  verificationToken: string;
  password: string;
  customerType: "NIGERIAN_CITIZEN" | "EXPATRIATE";
}

export const agentApi = {
  auth: {
    login: (data: LoginRequest) =>
      apiClient.post<ApiResponse<AgentLoginResponseData | AgentLoginCompleteResponse["data"]>>(
        AGENT_API_ENDPOINTS.auth.login,
        data,
        { skipAuth: true }
      ),


    verifyLogin: (data: AgentVerifyLoginPayload) =>
      apiClient.post<AgentLoginCompleteResponse>(
        AGENT_API_ENDPOINTS.auth.verifyLogin,
        data,
        { skipAuth: true }
      ),

    createPassword: (data: AgentCreatePasswordPayload) =>
      apiClient.post<ApiResponse<{ message: string }>>(
        AGENT_API_ENDPOINTS.auth.createPassword,
        data,
        { skipAuth: true }
      ),

    changePassword: (data: ChangePasswordRequest) =>
      apiClient.post<ChangePasswordResponse>(
        AGENT_API_ENDPOINTS.auth.changePassword,
        data
      ),

    forgotPassword: (data: ForgotPasswordRequest) =>
      apiClient.post<ForgotPasswordResponse>(
        AGENT_API_ENDPOINTS.auth.forgotPassword,
        data,
        { skipAuth: true }
      ),

    verifyResetOtp: (data: VerifyResetOtpRequest) =>
      apiClient.post<VerifyResetOtpResponse>(
        AGENT_API_ENDPOINTS.auth.verifyResetOtp,
        data,
        { skipAuth: true }
      ),

    resetPassword: (data: ResetPasswordRequest) =>
      apiClient.post<ResetPasswordResponse>(
        AGENT_API_ENDPOINTS.auth.resetPassword,
        data,
        { skipAuth: true }
      ),

    profile: () =>
      apiClient.get<AgentAuthProfileResponse>(AGENT_API_ENDPOINTS.auth.profile),
  },

  customers: {
    list: (params?: AgentCustomerListParams) =>
      apiClient.get<AgentCustomerListResponse>(AGENT_API_ENDPOINTS.customers.list, {
        params: params as ApiRequestConfig["params"],
      }),
    stats: () =>
      apiClient.get<AgentCustomerStatsResponse>(AGENT_API_ENDPOINTS.customers.stats),
    getById: (userId: string) =>
      apiClient.get<AgentCustomerDetailsResponse>(
        AGENT_API_ENDPOINTS.customers.getById(userId)
      ),
    update: (userId: string, data: AgentCustomerUpdateRequest) =>
      apiClient.patch<AgentCustomerUpdateResponse>(
        AGENT_API_ENDPOINTS.customers.update(userId),
        data
      ),
    transactions: (userId: string, params?: { page?: number; limit?: number }) =>
      apiClient.get<AgentCustomerTransactionsResponse>(
        AGENT_API_ENDPOINTS.customers.transactions(userId),
        {
          params: params as ApiRequestConfig["params"],
        }
      ),
  },

  dashboard: {
    recentTransactions: (params?: {
      page?: number;
      limit?: number;
      type?: string;
    }) =>
      apiClient.get<AgentDashboardRecentTransactionsResponse>(
        AGENT_API_ENDPOINTS.dashboard.recentTransactions,
        {
          params: params as ApiRequestConfig["params"],
        }
      ),
    transactionsByType: (range: AgentDashboardRange) =>
      apiClient.get<AgentDashboardTransactionsByTypeResponse>(
        AGENT_API_ENDPOINTS.dashboard.transactionsByType,
        {
          params: { range },
        }
      ),
  },

  rates: {
    list: (params?: { fromCurrency?: string; toCurrency?: string }) =>
      apiClient.get<TransactionRatesListResponse>(AGENT_API_ENDPOINTS.rates.list, {
        params: params as ApiRequestConfig["params"],
      }),
    calculate: (data: CalculateTransactionRateRequest) =>
      apiClient.post<CalculateTransactionRateResponse>(
        AGENT_API_ENDPOINTS.rates.calculate,
        data
      ),
  },

  customerAuth: {
    nigerian: {
      verifyBvn: (data: VerifyBvnRequest) =>
        apiClient.post<VerifyBvnResponse>(
          AGENT_API_ENDPOINTS.customerAuth.nigerian.verifyBvn,
          data
        ),
      sendOtp: (data: SendOtpRequestNigerian) =>
        apiClient.post<SendOtpResponse>(
          AGENT_API_ENDPOINTS.customerAuth.nigerian.sendOtp,
          data
        ),
      resendOtp: (data: SendOtpRequestNigerian) =>
        apiClient.post<SendOtpResponse>(
          AGENT_API_ENDPOINTS.customerAuth.nigerian.resendOtp,
          data
        ),
      validateOtp: (data: ValidateOtpRequestNigerian) =>
        apiClient.post<ValidateOtpResponse>(
          AGENT_API_ENDPOINTS.customerAuth.nigerian.validateOtp,
          data
        ),
      createAccount: (data: AgentCreateCustomerAccountRequest) =>
        apiClient.post<LoginResponse>(
          AGENT_API_ENDPOINTS.customerAuth.nigerian.createAccount,
          data
        ),
    },
  },

    // ==================== Transactions ====================
    transactions: {
      list: (params?: TransactionListParams) =>
        apiClient.get<TransactionsListApiResponse>(AGENT_API_ENDPOINTS.transactions.list, {
          params: params as ApiRequestConfig["params"],
        }),
  
      getById: (id: string) =>
        apiClient.get<TransactionDetailApiResponse>(AGENT_API_ENDPOINTS.transactions.getById(id)),
  
      create: (data: CreateTransactionRequest & { userId: string }) =>
        apiClient.post<Transaction>(AGENT_API_ENDPOINTS.transactions.create, data),
  
      update: (id: string, data: UpdateTransactionRequest) =>
        apiClient.put<Transaction>(AGENT_API_ENDPOINTS.transactions.update(id), data),
  
      uploadDocuments: (id: string, formData: FormData) =>
        apiClient.post<void>(AGENT_API_ENDPOINTS.transactions.uploadDocuments(id), formData),

      recordPayment: (transactionId: string, formData: FormData) =>
        apiClient.post<void>(
          AGENT_API_ENDPOINTS.transactions.recordPayment(transactionId),
          formData
        ),

      recordDisbursement: (transactionId: string, formData: FormData) =>
        apiClient.post<void>(
          AGENT_API_ENDPOINTS.transactions.recordDisbursement(transactionId),
          formData
        ),

      createVirtualAccount: (transactionId: string) =>
        apiClient.post<TransactionVirtualAccountResponse>(
          AGENT_API_ENDPOINTS.transactions.virtualAccount(transactionId),
          {}
        ),

      getVirtualAccount: (transactionId: string) =>
        apiClient.get<TransactionVirtualAccountResponse>(
          AGENT_API_ENDPOINTS.transactions.virtualAccount(transactionId)
        ),

      getDepositInstructions: (transactionId: string) =>
        apiClient.get<TransactionDepositInstructionsResponse>(
          AGENT_API_ENDPOINTS.transactions.depositInstructions(transactionId)
        ),

      getDepositStatus: (transactionId: string) =>
        apiClient.get<TransactionDepositStatusResponse>(
          AGENT_API_ENDPOINTS.transactions.depositStatus(transactionId)
        ),
  
      checkLimits: (data: CheckTransactionLimitsRequest) =>
        apiClient.post<CheckTransactionLimitsResponse>(AGENT_API_ENDPOINTS.transactions.checkLimits, data),
  
      overview: (data?: TransactionOverviewRequest) =>
        apiClient.post<TransactionOverviewResponse>(AGENT_API_ENDPOINTS.transactions.overview, data),
      export: (params?: TransactionListParams) =>
        apiClient.download(AGENT_API_ENDPOINTS.transactions.export, {
          params: params as ApiRequestConfig["params"],
        }),
      stats: () =>
        apiClient.get(AGENT_API_ENDPOINTS.transactions.stats),
    },
  
  notifications: {
    list: (params?: { limit?: number; offset?: number }) =>
      apiClient.get<NotificationsListResponse>(AGENT_API_ENDPOINTS.notifications.list, {
        params,
      }),
    unreadCount: () =>
      apiClient.get<UnreadCountResponse>(AGENT_API_ENDPOINTS.notifications.unreadCount),
    markAsRead: (id: string) =>
      apiClient.post<void>(AGENT_API_ENDPOINTS.notifications.markAsRead(id)),
    markAllAsRead: () =>
      apiClient.post<ReadAllNotificationsResponse>(AGENT_API_ENDPOINTS.notifications.markAllAsRead),
    preferences: {
      get: () =>
        apiClient.get<NotificationPreferencesResponse>(
          AGENT_API_ENDPOINTS.notifications.preferences.get
        ),
      update: (data: UpdateNotificationPreferencesRequest) =>
        apiClient.put<NotificationPreferencesResponse>(
          AGENT_API_ENDPOINTS.notifications.preferences.update,
          data
        ),
    },
  },

  support: {
    tickets: {
      create: (formData: FormData) =>
        apiClient.post<SupportTicketDetailResponse>(
          AGENT_API_ENDPOINTS.support.tickets.create,
          formData
        ),
      list: (params?: { page?: number; limit?: number }) =>
        apiClient.get<AgentSupportTicketListResponse>(
          AGENT_API_ENDPOINTS.support.tickets.list,
          {
            params: params as ApiRequestConfig["params"],
          }
        ),
      getById: (id: string) =>
        apiClient.get<AgentSupportTicketDetailResponse>(
          AGENT_API_ENDPOINTS.support.tickets.getById(id)
        ),
    },
  },
};

