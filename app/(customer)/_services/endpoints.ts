export const API_ENDPOINTS = {
  auth: {
    signup: "/api/auth/signup",
    login: "/api/auth/login",
    logout: "/api/auth/logout",
    refresh: "/api/auth/refresh",
    profile: "/api/auth/profile",
    health: "/api/auth/health",
    
    forgotPassword: "/api/auth/forgot-password",
    verifyResetOtp: "/api/auth/verify-reset-otp",
    resetPassword: "/api/auth/reset-password",
    
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
    
    tourist: {
      verifyPassport: "/api/auth/signup/tourist/verify-passport",
      sendOtp: "/api/auth/signup/tourist/send-otp",
      resendOtp: "/api/auth/signup/tourist/resend-otp",
      validateOtp: "/api/auth/signup/tourist/validate-otp",
      createAccount: "/api/auth/signup/tourist/create-account",
    },
    
    otp: {
      send: "/api/auth/otp/send",
      validate: "/api/auth/otp/validate",
    },
    
    kyc: {
      verify: "/api/auth/kyc/verify",
      passport: {
        upload: "/api/auth/kyc/passport/upload",
        status: "/api/auth/kyc/passport/status",
      },
    },
  },
  
  // Transactions
  transactions: {
    list: "/api/customer/transactions",
    create: "/api/customer/transactions",
    getById: (id: string) => `/api/customer/transactions/${id}`,
    update: (id: string) => `/api/customer/transactions/${id}`,
    uploadDocuments: (id: string) => `/api/customer/transactions/${id}/documents`,
    checkLimits: "/api/customer/transactions/limits/check",
    health: "/api/customer/transactions/health",
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
  
  // Notifications
  notifications: {
    list: "/api/notifications",
    unreadCount: "/api/notifications/unread/count",
    markAsRead: (id: string) => `/api/notifications/${id}/read`,
    markAllAsRead: "/api/notifications/read-all",
    preferences: {
      get: "/api/notifications/preferences",
      update: "/api/notifications/preferences",
    },
    devices: {
      list: "/api/notifications/devices",
      register: "/api/notifications/devices",
      unregister: "/api/notifications/devices",
    },
  },
  
  // Documents
  documents: {
    upload: "/api/documents/upload",
    uploadMultiple: "/api/documents/upload/multiple",
    getById: (id: string) => `/api/documents/${id}`,
    delete: (id: string) => `/api/documents/${id}`,
    getByTransaction: (transactionId: string) => `/api/documents/transaction/${transactionId}`,
    list: "/api/documents",
  },
} as const;
