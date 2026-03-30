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

    // Agent auth flow
    agent: {
      login: "/api/auth/agent/login",
      verifyLogin: "/api/auth/agent/verify-login",
      createPassword: "/api/auth/agent/create-password",
    },
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
    notifications: {
      all: "/api/admin/notifications",
      unread: "/api/admin/notifications/unread",
      markRead: (id: string) => `/api/admin/notifications/${id}/read`,
    },
    auditTrail: "/api/admin/audit/trail",
    auditTrailExport: "/api/admin/audit/trail/export",
    agent: {
      all: "/api/admin/agent/all",
      list: "/api/admin/agent",
      export: "/api/admin/agent/export",
      stats: "/api/admin/agent/stats",
      getById: (id: string) => `/api/admin/agent/${id}`,
      updateStatus: (id: string) => `/api/admin/agent/${id}/status`,
      transactions: (id: string) => `/api/admin/agent/${id}/transactions`,
      getTransactionById: (id: string, transactionId: string) =>
        `/api/admin/agent/${id}/transactions/${transactionId}`,
      downloadTransactionReceipt: (id: string, transactionId: string) =>
        `/api/admin/agent/${id}/transactions/${transactionId}/receipt/download`,
    },
    customers: {
      list: "/api/admin/customers",
      all: "/api/admin/customers/all",
      export: "/api/admin/customers/export",
      counts: "/api/admin/customers/counts",
      getById: (userId: string) => `/api/admin/customers/${userId}`,
      deactivate: (userId: string) => `/api/admin/customers/${userId}/deactivate`,
      toggleStatus: (userId: string) => `/api/admin/customers/${userId}/status`,
      transactions: (userId: string) => `/api/admin/customers/${userId}/transactions`,
      flags: {
        list: (userId: string) => `/api/admin/customers/${userId}/flags`,
        create: (userId: string) => `/api/admin/customers/${userId}/flags`,
        all: "/api/admin/customers/flags/all",
        updateStatus: (flagId: string) => `/api/admin/customers/flags/${flagId}/status`,
      },
    },
    tickets: {
      list: "/api/admin/tickets",
      export: "/api/admin/tickets/export",
      create: "/api/admin/tickets",
      update: (id: string) => `/api/admin/tickets/${id}`,
      assign: (id: string) => `/api/admin/tickets/${id}/assign`,
      comments: (id: string) => `/api/admin/tickets/${id}/comments`,
      statuses: "/api/admin/tickets/statuses",
      stats: "/api/admin/tickets/stats",
      caseTypes: "/api/admin/tickets/case-types",
      getById: (id: string) => `/api/admin/tickets/${id}`,
      updateStatus: (id: string) => `/api/admin/tickets/${id}/status`,
    },
    rate: {
      list: "/api/admin/rate",
      export: "/api/admin/rate/export",
      create: "/api/admin/rate",
      getById: (id: string) => `/api/admin/rate/${id}`,
      update: (id: string) => `/api/admin/rate/${id}`,
      stats: "/api/admin/rate/stats",
    },
    outlet: {
      franchises: {
        list: "/api/admin/outlet/franchises",
        create: "/api/admin/outlet/franchises",
        export: "/api/admin/outlet/franchises/export",
        stats: "/api/admin/outlet/franchises/stats",
        getById: (id: string) => `/api/admin/outlet/franchises/${id}`,
        update: (id: string) => `/api/admin/outlet/franchises/${id}`,
        updateStatus: (id: string) => `/api/admin/outlet/franchises/${id}/status`,
        branches: (id: string) => `/api/admin/outlet/franchises/${id}/branches`,
        branchesExport: (id: string) => `/api/admin/outlet/franchises/${id}/branches/export`,
        transactions: (id: string) => `/api/admin/outlet/franchises/${id}/transactions`,
      },
      branches: {
        create: "/api/admin/outlet/branches",
        list: "/api/admin/outlet/branches",
        export: "/api/admin/outlet/branches/export",
        stats: "/api/admin/outlet/branches/stats",
        getById: (id: string) => `/api/admin/outlet/branches/${id}`,
        update: (id: string) => `/api/admin/outlet/branches/${id}`,
        updateStatus: (id: string) => `/api/admin/outlet/branches/${id}/status`,
        agents: {
          list: (id: string) => `/api/admin/outlet/branches/${id}/agents`,
          export: (id: string) => `/api/admin/outlet/branches/${id}/agents/export`,
        },
        transactions: {
          list: (id: string) => `/api/admin/outlet/branches/${id}/transactions`,
          export: (id: string) => `/api/admin/outlet/branches/${id}/transactions/export`,
        },
      },
      states: "/api/admin/outlet/states",
    },
    transactions: {
      list: "/api/admin/transactions",
      export: "/api/admin/transactions/export",
      stats: "/api/admin/transactions/stats",
      getById: (id: string) => `/api/admin/transactions/${id}`,
      review: (id: string) => `/api/admin/transactions/${id}/review`,
      approve: (id: string) => `/api/admin/transactions/${id}/approve`,
      requestTransactionInfo: (id: string) =>
        `/api/admin/transactions/${id}/request-info`,
      approveDocument: (id: string, documentId: string) =>
        `/api/admin/transactions/${id}/documents/${documentId}/approve`,
      requestDocumentInfo: (id: string, documentId: string) =>
        `/api/admin/transactions/${id}/documents/${documentId}/request-info`,
      rejectDocument: (id: string, documentId: string) =>
        `/api/admin/transactions/${id}/documents/${documentId}/reject`,
      reject: (id: string) => `/api/admin/transactions/${id}/reject`,
      settle: (id: string) => `/api/admin/transactions/${id}/settle`,
    },
    reports: {
      modules: "/api/admin/reports/modules",
      generate: "/api/admin/reports/generate",
    },
    settlement: {
      stats: "/api/admin/settlement/stats",
      discrepancies: "/api/admin/settlement/discrepancies",
      pendingReconciliations: "/api/admin/settlement/pending-reconciliations",
      escrowAccounts: "/api/admin/settlement/escrow-accounts",
      fundingTransactions: "/api/admin/settlement/funding-transactions",
    },
    regulatory: {
      compliance: {
        dashboard: "/api/admin/regulatory/compliance/dashboard",
        reports: "/api/admin/regulatory/compliance/reports",
        reportsExport: "/api/admin/regulatory/compliance/reports/export",
        reportById: (id: string) => `/api/admin/regulatory/compliance/reports/${id}`,
      },
      logs: {
        audit: "/api/admin/regulatory/logs/audit",
        auditExport: "/api/admin/regulatory/logs/audit/export",
        auditById: (id: string) => `/api/admin/regulatory/logs/audit/${id}`,
        regulatory: "/api/admin/regulatory/logs/regulatory",
        regulatoryExport: "/api/admin/regulatory/logs/regulatory/export",
        regulatoryById: (id: string) => `/api/admin/regulatory/logs/regulatory/${id}`,
      },
      trms: {
        stats: "/api/admin/regulatory/trms/stats",
        list: "/api/admin/regulatory/trms/list",
        export: "/api/admin/regulatory/trms/export",
        details: (transactionId: string) =>
          `/api/admin/regulatory/trms/details/${transactionId}`,
      },
    },
    management: {
      lookups: "/api/admin/management/lookups",
      modules: "/api/admin/management/modules",
      users: {
        list: "/api/admin/management/users",
        all: "/api/admin/management/users/all",
        export: "/api/admin/management/users/export",
        create: "/api/admin/management/add-user",
        stats: "/api/admin/management/users/stats",
        getById: (id: string) => `/api/admin/management/users/${id}`,
        update: (id: string) => `/api/admin/management/users/${id}`,
        updateStatus: (id: string) => `/api/admin/management/users/${id}/status`,
        activities: (id: string) => `/api/admin/management/users/${id}/activities`,
        activitiesExport: (id: string) => `/api/admin/management/users/${id}/activities/export`,
      },
      roles: {
        list: "/api/admin/management/roles",
        export: "/api/admin/management/roles/export",
        create: "/api/admin/management/roles",
        stats: "/api/admin/management/roles/stats",
        getById: (id: string) => `/api/admin/management/roles/${id}`,
        update: (id: string) => `/api/admin/management/roles/${id}`,
        updateStatus: (id: string) => `/api/admin/management/roles/${id}/status`,
        delete: (id: string) => `/api/admin/management/roles/${id}`,
      },
      departments: {
        list: "/api/admin/management/departments",
        export: "/api/admin/management/departments/export",
        create: "/api/admin/management/departments",
        stats: "/api/admin/management/departments/stats",
        update: (id: string) => `/api/admin/management/departments/${id}`,
        updateStatus: (id: string) => `/api/admin/management/departments/${id}/status`,
        delete: (id: string) => `/api/admin/management/departments/${id}`,
      },
    },
  },
} as const;
