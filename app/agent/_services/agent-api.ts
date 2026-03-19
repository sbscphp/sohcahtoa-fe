/**
 * Agent API Functions
 * Mirrors customer/admin API patterns but scoped to agent auth flows.
 */

import { apiClient, ApiRequestConfig, type ApiResponse } from "@/app/_lib/api/client";
import { AGENT_API_ENDPOINTS } from "@/app/agent/_services/endpoints";
import { API_ENDPOINTS } from "@/app/_lib/api/endpoints";
import type {
  ApiResponseWrapper,
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
  ProfileResponse,
  TransactionListParams,
  TransactionsListApiResponse,
  TransactionDetailApiResponse,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  Transaction,
  CheckTransactionLimitsRequest,
  CheckTransactionLimitsResponse,
  TransactionOverviewRequest,
  TransactionOverviewResponse,
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

// Shape of /api/agent/customers response – keep generic until backend is finalized
export type AgentCustomerListResponse = ApiResponseWrapper<unknown[]>;

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
      apiClient.get<ProfileResponse>(API_ENDPOINTS.auth.profile),
  },

  customers: {
    list: () =>
      apiClient.get<AgentCustomerListResponse>(AGENT_API_ENDPOINTS.customers.list),
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
};

