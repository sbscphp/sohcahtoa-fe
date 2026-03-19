export const AGENT_API_ENDPOINTS = {
  auth: {
    login: "/api/auth/agent/login",
    verifyLogin: "/api/auth/agent/verify-login",
    createPassword: "/api/auth/agent/create-password", // NOSONAR -> to remove squirrel lines
    forgotPassword: "/api/auth/agent/forgot-password", // NOSONAR
    verifyResetOtp: "/api/auth/agent/verify-reset-otp", // NOSONAR
    resetPassword: "/api/auth/agent/reset-password", // NOSONAR
  },
  customers: {
    list: "/api/agent/customers",
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
    rates: "/api/agent/transactions/rates",
    calculateRate: "/api/agent/transactions/rates/calculate",
    export: "/api/agent/transactions/export",
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


