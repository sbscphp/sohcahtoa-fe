export const AGENT_API_ENDPOINTS = {
  auth: {
    login: "/api/auth/agent/login",
    verifyLogin: "/api/auth/agent/verify-login",
    createPassword: "/api/auth/agent/create-password",
  },
  customers: {
    list: "/api/agent/customers",
  },
  /**
   * Agent initiating customer auth (Nigerian BVN + OTP flow) on behalf of a customer.
   * Mirrors the customer BVN/OTP endpoints but is scoped under /api/agent/customer-auth.
   */
  customerAuth: {
    nigerian: {
      verifyBvn: "/api/agent/customer-auth/verify-bvn",
      sendOtp: "/api/agent/customer-auth/send-otp",
      resendOtp: "/api/agent/customer-auth/resend-otp",
      validateOtp: "/api/agent/customer-auth/validate-otp",
      createAccount: "/api/agent/customer-auth/create-account",
    },
  },
} as const;


