export const AGENT_API_ENDPOINTS = {
  auth: {
    login: "/api/auth/agent/login",
    verifyLogin: "/api/auth/agent/verify-login",
    createPassword: "/api/auth/agent/create-password",
  },
} as const;

