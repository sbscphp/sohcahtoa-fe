export const AGENT_API_ENDPOINTS = {
  auth: {
    login: "/api/auth/agent/login",
    profile: "/api/agent/auth/profile",
    verifyLogin: "/api/auth/agent/verify-login",
    createPassword: "/api/auth/agent/create-password", // NOSONAR -> to remove squirrel lines
    changePassword: "/api/agent/auth/change-password", // NOSONAR
    forgotPassword: "/api/auth/agent/forgot-password", // NOSONAR
    verifyResetOtp: "/api/auth/agent/verify-reset-otp", // NOSONAR
    resetPassword: "/api/auth/agent/reset-password", // NOSONAR
  },
  customers: {
    list: "/api/agent/customers",
    stats: "/api/agent/customers/stats",
    getById: (userId: string) => `/api/agent/customers/${userId}`,
    update: (userId: string) => `/api/agent/customers/${userId}`,
    transactions: (userId: string) =>
      `/api/agent/customers/${userId}/transactions`,
  },
  customerAuth: {
    nigerian: {
      verifyBvn: "/api/agent/customer-auth/verify-bvn",
      sendOtp: "/api/agent/customer-auth/send-otp",
      resendOtp: "/api/agent/customer-auth/resend-otp",
      validateOtp: "/api/agent/customer-auth/validate-otp",
      createAccount: "/api/agent/customer-auth/create-account",
    },
  },

  transactions: {
    list: "/api/agent/transactions",
    stats: "/api/agent/transactions/stats",
    create: "/api/agent/transactions",
    overview: "/api/agent/transactions/totals",
    getById: (id: string) => `/api/agent/transactions/${id}`,
    update: (id: string) => `/api/agent/transactions/${id}`,
    uploadDocuments: (id: string) => `/api/agent/transactions/${id}/documents`,
    checkLimits: "/api/agent/transactions/limits/check",
    health: "/api/agent/transactions/health",
    export: "/api/agent/transactions/export",
  },

  rates: {
    list: "/api/agent/rates",
    calculate: "/api/agent/rates/calculate",
  },

  dashboard: {
    recentTransactions: "/api/agent/dashboard/recent-transactions",
    transactionsByType: "/api/agent/dashboard/transactions-by-type",
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
} as const;


