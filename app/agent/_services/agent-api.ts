/**
 * Agent API Functions
 * Mirrors customer/admin API patterns but scoped to agent auth flows.
 */

import { apiClient, type ApiResponse } from "@/app/_lib/api/client";
import { AGENT_API_ENDPOINTS } from "@/app/agent/_services/endpoints";
import type {
  LoginRequest,
  LoginResponse,
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

export const agentApi = {
  auth: {
    /**
     * Step 1 - Initiate agent login (send OTP)
     * Mirrors /api/auth/agent/login
     */
    login: (data: LoginRequest) =>
      apiClient.post<ApiResponse<AgentLoginResponseData | AgentLoginCompleteResponse["data"]>>(
        AGENT_API_ENDPOINTS.auth.login,
        data,
        { skipAuth: true }
      ),

    /**
     * Step 2 - Verify OTP and complete agent login (2FA)
     * Mirrors /api/auth/agent/verify-login
     */
    verifyLogin: (data: AgentVerifyLoginPayload) =>
      apiClient.post<AgentLoginCompleteResponse>(
        AGENT_API_ENDPOINTS.auth.verifyLogin,
        data,
        { skipAuth: true }
      ),

    /**
     * Create/set password for an agent using OTP.
     * Mirrors /api/auth/agent/create-password
     */
    createPassword: (data: AgentCreatePasswordPayload) =>
      apiClient.post<ApiResponse<{ message: string }>>(
        AGENT_API_ENDPOINTS.auth.createPassword,
        data,
        { skipAuth: true }
      ),
  },
};

