/**
 * Customer API Functions
 * Type-safe API functions for customer domain
 * Usage: useCreateData(customerApi.tourist.createAccount)
 */

import type { ApiRequestConfig } from "@/app/_lib/api/client";
import { apiClient } from "@/app/_lib/api/client";
import type {
  CheckTransactionLimitsRequest,
  CheckTransactionLimitsResponse,
  CreateNigerianAccountRequest,
  CreateTouristAccountRequest,
  CreateTransactionRequest,
  DepositConfirmRequest,
  DepositInitiateRequest,
  DevicesListResponse,
  ExchangeRateRequest,
  ExchangeRateResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  InitializePaymentRequest,
  InitializePaymentResponse,
  LoginRequest,
  LoginResponse,
  NotificationPreferencesResponse,
  NotificationsListResponse,
  PaginationParams,
  PassportStatusResponse,
  PaymentCallbackRequest,
  ProfileResponse,
  ReadAllNotificationsResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  RegisterDeviceRequest,
  ResetPasswordRequest,
  ResetPasswordResponse,
  SendEmailOtpRequestNigerian,
  SendOtpRequest,
  SendOtpRequestNigerian,
  SendOtpRequestTourist,
  SendOtpResponse,
  SignupRequest,
  Transaction,
  TransactionDetail,
  TransactionListParams,
  TransactionsListApiResponse,
  UnreadCountResponse,
  UpdateNotificationPreferencesRequest,
  UpdateTransactionRequest,
  UploadPassportResponse,
  ValidateEmailOtpRequestNigerian,
  ValidateEmailOtpResponse,
  ValidateOtpRequest,
  ValidateOtpRequestNigerian,
  ValidateOtpRequestTourist,
  ValidateOtpResponse,
  VerifyBvnRequest,
  VerifyBvnResponse,
  VerifyKycRequest,
  VerifyPassportResponse,
  VerifyResetOtpRequest,
  VerifyResetOtpResponse,
  Document,
  DocumentsListResponse,
  DocumentUploadResponse,
  MultipleDocumentsUploadResponse,
  UploadDocumentsJsonRequest,
} from "@/app/_lib/api/types";
import { API_ENDPOINTS } from "./endpoints";

export const customerApi = {
  // ==================== Auth ====================
  auth: {
    signup: (data: SignupRequest) =>
      apiClient.post<LoginResponse>(API_ENDPOINTS.auth.signup, data, { skipAuth: true }),

    login: (data: LoginRequest) =>
      apiClient.post<LoginResponse>(API_ENDPOINTS.auth.login, data, { skipAuth: true }),

    logout: () =>
      apiClient.post<void>(API_ENDPOINTS.auth.logout),

    refreshToken: (data: RefreshTokenRequest) =>
      apiClient.post<RefreshTokenResponse>(API_ENDPOINTS.auth.refresh, data, { skipAuth: true }),

    profile: () =>
      apiClient.get<ProfileResponse>(API_ENDPOINTS.auth.profile),

    // Password reset flow
    forgotPassword: (data: ForgotPasswordRequest) =>
      apiClient.post<ForgotPasswordResponse>(API_ENDPOINTS.auth.forgotPassword, data, { skipAuth: true }),

    verifyResetOtp: (data: VerifyResetOtpRequest) =>
      apiClient.post<VerifyResetOtpResponse>(API_ENDPOINTS.auth.verifyResetOtp, data, { skipAuth: true }),

    resetPassword: (data: ResetPasswordRequest) =>
      apiClient.post<ResetPasswordResponse>(API_ENDPOINTS.auth.resetPassword, data, { skipAuth: true }),

    // Nigerian signup flow
    nigerian: {
      verifyBvn: (data: VerifyBvnRequest) =>
        apiClient.post<VerifyBvnResponse>(API_ENDPOINTS.auth.nigerian.verifyBvn, data, { skipAuth: true }),

      sendOtp: (data: SendOtpRequestNigerian) =>
        apiClient.post<SendOtpResponse>(API_ENDPOINTS.auth.nigerian.sendOtp, data, { skipAuth: true }),

      resendOtp: (data: SendOtpRequestNigerian) =>
        apiClient.post<SendOtpResponse>(API_ENDPOINTS.auth.nigerian.resendOtp, data, { skipAuth: true }),

      validateOtp: (data: ValidateOtpRequestNigerian) =>
        apiClient.post<ValidateOtpResponse>(API_ENDPOINTS.auth.nigerian.validateOtp, data, { skipAuth: true }),

      sendEmailOtp: (data: SendEmailOtpRequestNigerian) =>
        apiClient.post<SendOtpResponse>(API_ENDPOINTS.auth.nigerian.sendEmailOtp, data, { skipAuth: true }),

      resendEmailOtp: (data: SendEmailOtpRequestNigerian) =>
        apiClient.post<SendOtpResponse>(API_ENDPOINTS.auth.nigerian.resendEmailOtp, data, { skipAuth: true }),

      validateEmailOtp: (data: ValidateEmailOtpRequestNigerian) =>
        apiClient.post<ValidateEmailOtpResponse>(API_ENDPOINTS.auth.nigerian.validateEmailOtp, data, { skipAuth: true }),

      createAccount: (data: CreateNigerianAccountRequest) =>
        apiClient.post<LoginResponse>(API_ENDPOINTS.auth.nigerian.createAccount, data, { skipAuth: true }),
    },

    // Tourist signup flow
    tourist: {
      verifyPassport: (data: { passportNumber: string; passportDocumentUrl?: string }) =>
        apiClient.post<VerifyPassportResponse>(API_ENDPOINTS.auth.tourist.verifyPassport, data, { skipAuth: true }),

      sendOtp: (data: SendOtpRequestTourist) =>
        apiClient.post<SendOtpResponse>(API_ENDPOINTS.auth.tourist.sendOtp, data, { skipAuth: true }),

      resendOtp: (data: SendOtpRequestTourist) =>
        apiClient.post<SendOtpResponse>(API_ENDPOINTS.auth.tourist.resendOtp, data, { skipAuth: true }),

      validateOtp: (data: ValidateOtpRequestTourist) =>
        apiClient.post<ValidateOtpResponse>(API_ENDPOINTS.auth.tourist.validateOtp, data, { skipAuth: true }),

      createAccount: (data: CreateTouristAccountRequest) =>
        apiClient.post<LoginResponse>(API_ENDPOINTS.auth.tourist.createAccount, data, { skipAuth: true }),
    },

    // OTP
    otp: {
      send: (data: SendOtpRequest) =>
        apiClient.post<SendOtpResponse>(API_ENDPOINTS.auth.otp.send, data, { skipAuth: true }),

      validate: (data: ValidateOtpRequest) =>
        apiClient.post<ValidateOtpResponse>(API_ENDPOINTS.auth.otp.validate, data, { skipAuth: true }),
    },

    // KYC
    kyc: {
      verify: (data: VerifyKycRequest) =>
        apiClient.post<void>(API_ENDPOINTS.auth.kyc.verify, data),

      passport: {
        upload: (data: FormData) =>
          apiClient.post<UploadPassportResponse>(API_ENDPOINTS.auth.kyc.passport.upload, data, { skipAuth: true }),

        getStatus: () =>
          apiClient.get<PassportStatusResponse>(API_ENDPOINTS.auth.kyc.passport.status),
      },
    },
  },

  // ==================== Transactions ====================
  transactions: {
    list: (params?: TransactionListParams) =>
      apiClient.get<TransactionsListApiResponse>(API_ENDPOINTS.transactions.list, {
        params: params as ApiRequestConfig["params"],
      }),

    getById: (id: string) =>
      apiClient.get<TransactionDetail>(API_ENDPOINTS.transactions.getById(id)),

    create: (data: CreateTransactionRequest) =>
      apiClient.post<Transaction>(API_ENDPOINTS.transactions.create, data),

    update: (id: string, data: UpdateTransactionRequest) =>
      apiClient.put<Transaction>(API_ENDPOINTS.transactions.update(id), data),

    uploadDocuments: (id: string, formData: FormData) =>
      apiClient.post<void>(API_ENDPOINTS.transactions.uploadDocuments(id), formData),

    checkLimits: (data: CheckTransactionLimitsRequest) =>
      apiClient.post<CheckTransactionLimitsResponse>(API_ENDPOINTS.transactions.checkLimits, data),
  },

  // ==================== Notifications ====================
  notifications: {
    list: (params?: { limit?: number; offset?: number }) =>
      apiClient.get<NotificationsListResponse>(API_ENDPOINTS.notifications.list, {
        params: params as ApiRequestConfig["params"],
      }),

    unreadCount: () =>
      apiClient.get<UnreadCountResponse>(API_ENDPOINTS.notifications.unreadCount),

    markAsRead: (id: string) =>
      apiClient.post<void>(API_ENDPOINTS.notifications.markAsRead(id)),

    markAllAsRead: () =>
      apiClient.post<ReadAllNotificationsResponse>(API_ENDPOINTS.notifications.markAllAsRead),

    preferences: {
      get: () =>
        apiClient.get<NotificationPreferencesResponse>(API_ENDPOINTS.notifications.preferences.get),

      update: (data: UpdateNotificationPreferencesRequest) =>
        apiClient.put<NotificationPreferencesResponse>(
          API_ENDPOINTS.notifications.preferences.update,
          data
        ),
    },

    devices: {
      list: () =>
        apiClient.get<DevicesListResponse>(API_ENDPOINTS.notifications.devices.list),

      register: (data: RegisterDeviceRequest) =>
        apiClient.post<void>(API_ENDPOINTS.notifications.devices.register, data),

      unregister: () =>
        apiClient.delete<void>(API_ENDPOINTS.notifications.devices.unregister),
    },
  },

  // ==================== Documents ====================
  documents: {
    upload: (formData: FormData) =>
      apiClient.post<DocumentUploadResponse>(API_ENDPOINTS.documents.upload, formData),

    uploadMultiple: (formData: FormData) =>
      apiClient.post<MultipleDocumentsUploadResponse>(API_ENDPOINTS.documents.uploadMultiple, formData),

    uploadMultipleJson: (data: UploadDocumentsJsonRequest) =>
      apiClient.post<MultipleDocumentsUploadResponse>(API_ENDPOINTS.documents.uploadMultiple, data),

    getById: (id: string) =>
      apiClient.get<Document>(API_ENDPOINTS.documents.getById(id)),

    delete: (id: string) =>
      apiClient.delete<void>(API_ENDPOINTS.documents.delete(id)),

    getByTransaction: (transactionId: string) =>
      apiClient.get<DocumentsListResponse>(API_ENDPOINTS.documents.getByTransaction(transactionId)),

    list: (params?: { userId: string; page?: number; limit?: number }) =>
      apiClient.get<DocumentsListResponse>(API_ENDPOINTS.documents.list, {
        params: params as ApiRequestConfig["params"],
      }),
  },

  // ==================== Payments ====================
  payments: {
    initialize: (data: InitializePaymentRequest) =>
      apiClient.post<InitializePaymentResponse>(API_ENDPOINTS.payments.initialize, data),

    callback: (data: PaymentCallbackRequest) =>
      apiClient.post<void>(API_ENDPOINTS.payments.callback, data),

    getHistory: (params?: PaginationParams) =>
      apiClient.get<unknown[]>(API_ENDPOINTS.payments.history, {
        params: params as ApiRequestConfig["params"],
      }),

    getStatus: (transactionId: string) =>
      apiClient.get<{ status: string; paymentReference?: string }>(API_ENDPOINTS.payments.status(transactionId)),

    getExchangeRate: (data: ExchangeRateRequest) =>
      apiClient.post<ExchangeRateResponse>(API_ENDPOINTS.payments.exchangeRate, data),

    createExchangeRate: (data: {
      fromCurrency: string;
      toCurrency: string;
      rate: number;
      validUntil: string;
      source: string;
    }) =>
      apiClient.post<void>(API_ENDPOINTS.payments.exchangeRateCreate, data),

    deposit: {
      initiate: (data: DepositInitiateRequest) =>
        apiClient.post<InitializePaymentResponse>(API_ENDPOINTS.payments.deposit.initiate, data),

      confirm: (data: DepositConfirmRequest) =>
        apiClient.post<void>(API_ENDPOINTS.payments.deposit.confirm, data),
    },

    getSettlement: (transactionId: string) =>
      apiClient.get<unknown>(API_ENDPOINTS.payments.settlement(transactionId)),
  },
};
