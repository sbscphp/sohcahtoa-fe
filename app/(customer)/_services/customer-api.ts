/**
 * Customer API Functions
 * Type-safe API functions for customer domain
 * Usage: useCreateData(customerApi.tourist.createAccount)
 */

import { apiClient } from "@/app/_lib/api/client";
import type { ApiRequestConfig } from "@/app/_lib/api/client";
import { API_ENDPOINTS } from "@/app/_lib/api/endpoints";
import type {
  LoginRequest,
  LoginResponse,
  LoginResponseData,
  SignupRequest,
  VerifyBvnRequest,
  VerifyBvnResponse,
  VerifyPassportResponse,
  SendOtpRequest,
  SendOtpRequestNigerian,
  SendOtpRequestTourist,
  SendOtpResponse,
  ValidateOtpRequest,
  ValidateOtpRequestNigerian,
  ValidateOtpRequestTourist,
  ValidateOtpResponse,
  SendEmailOtpRequestNigerian,
  ValidateEmailOtpRequestNigerian,
  ValidateEmailOtpResponse,
  CreateNigerianAccountRequest,
  CreateTouristAccountRequest,
  RefreshTokenRequest,
  RefreshTokenResponse,
  CreateTransactionRequest,
  Transaction,
  TransactionDetail,
  TransactionsListResponse,
  UpdateTransactionRequest,
  CheckTransactionLimitsRequest,
  CheckTransactionLimitsResponse,
  InitializePaymentRequest,
  InitializePaymentResponse,
  PaymentCallbackRequest,
  ExchangeRateRequest,
  ExchangeRateResponse,
  DepositInitiateRequest,
  DepositConfirmRequest,
  VerifyKycRequest,
  PassportStatusResponse,
  UploadPassportResponse,
  PaginationParams,
  TransactionListParams,
  ApiResponseWrapper,
  ProfileResponse,
} from "@/app/_lib/api/types";

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
      apiClient.get<TransactionsListResponse>(API_ENDPOINTS.transactions.list, {
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
