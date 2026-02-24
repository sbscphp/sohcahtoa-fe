/**
 * API Endpoints - Centralized endpoint definitions
 * Based on Swagger/OpenAPI documentation
 */

export const API_ENDPOINTS = {
  // Auth
  auth: {
    signup: "/api/auth/signup",
    login: "/api/auth/login",
    logout: "/api/auth/logout",
    refresh: "/api/auth/refresh",
    profile: "/api/auth/profile",
    health: "/api/auth/health",
    
    // Nigerian signup flow
    nigerian: {
      verifyBvn: "/api/auth/signup/nigerian/verify-bvn",
      sendOtp: "/api/auth/signup/nigerian/send-otp",
      resendOtp: "/api/auth/signup/nigerian/resend-otp",
      validateOtp: "/api/auth/signup/nigerian/validate-otp",
      sendEmailOtp: "/api/auth/signup/nigerian/send-email-otp",
      resendEmailOtp: "/api/auth/signup/nigerian/resend-email-otp",
      validateEmailOtp: "/api/auth/signup/nigerian/validate-email-otp",
      createAccount: "/api/auth/signup/nigerian/create-account",
    },
    
    // Tourist signup flow
    tourist: {
      verifyPassport: "/api/auth/signup/tourist/verify-passport",
      sendOtp: "/api/auth/signup/tourist/send-otp",
      resendOtp: "/api/auth/signup/tourist/resend-otp",
      validateOtp: "/api/auth/signup/tourist/validate-otp",
      createAccount: "/api/auth/signup/tourist/create-account",
    },
    
    // OTP
    otp: {
      send: "/api/auth/otp/send",
      validate: "/api/auth/otp/validate",
    },
    
    // KYC
    kyc: {
      verify: "/api/auth/kyc/verify",
      passport: {
        upload: "/api/auth/kyc/passport/upload",
        status: "/api/auth/kyc/passport/status",
      },
    },
    
    // Password reset flow
    forgotPassword: "/api/auth/forgot-password",
    verifyResetOtp: "/api/auth/verify-reset-otp",
    resetPassword: "/api/auth/reset-password",
  },
  
  // Transactions
  transactions: {
    list: "/api/transactions",
    create: "/api/transactions",
    getById: (id: string) => `/api/transactions/${id}`,
    update: (id: string) => `/api/transactions/${id}`,
    uploadDocuments: (id: string) => `/api/transactions/${id}/documents`,
    checkLimits: "/api/transactions/limits/check",
    health: "/api/transactions/health",
  },
  
  // Payments
  payments: {
    initialize: "/api/payments/initialize",
    callback: "/api/payments/callback",
    history: "/api/payments/history",
    status: (transactionId: string) => `/api/payments/status/${transactionId}`,
    exchangeRate: "/api/payments/exchange-rate",
    exchangeRateCreate: "/api/payments/exchange-rate/create",
    deposit: {
      initiate: "/api/payments/deposit/initiate",
      confirm: "/api/payments/deposit/confirm",
    },
    settlement: (transactionId: string) => `/api/payments/settlement/${transactionId}`,
    health: "/api/payments/health",
  },
  
  // Admin (if needed)
  admin: {
    auth: {
      login: "/api/admin/auth/login",
      verifyLogin: "/api/admin/auth/verify-login",
      forgotPassword: "/api/admin/auth/forgot-password",
      resetPassword: "/api/admin/auth/reset-password",
      logout: "/api/admin/auth/logout",
      otp: {
        validate: "/api/admin/auth/otp/validate",
      },
    },
    dashboard: "/api/admin/dashboard",
    pendingApprovals: "/api/admin/pending-approvals",
    customers: {
      list: "/api/admin/customers",
      getById: (userId: string) => `/api/admin/customers/${userId}`,
      flags: {
        list: (userId: string) => `/api/admin/customers/${userId}/flags`,
        create: (userId: string) => `/api/admin/customers/${userId}/flags`,
        all: "/api/admin/customers/flags/all",
        updateStatus: (flagId: string) => `/api/admin/customers/flags/${flagId}/status`,
      },
    },
    transactions: {
      review: (id: string) => `/api/admin/transactions/${id}/review`,
      approve: (id: string) => `/api/admin/transactions/${id}/approve`,
      reject: (id: string) => `/api/admin/transactions/${id}/reject`,
      settle: (id: string) => `/api/admin/transactions/${id}/settle`,
    },
    management: {
      users: {
        list: "/api/admin/management/users",
        stats: "/api/admin/management/users/stats",
      },
      roles: {
        list: "/api/admin/management/roles",
        stats: "/api/admin/management/roles/stats",
      },
      departments: {
        list: "/api/admin/management/departments",
        stats: "/api/admin/management/departments/stats",
      },
    },
  },
} as const;
