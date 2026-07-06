import { apiClient } from "@/app/_lib/api/client";
import type { NigerianBvnConsentClient } from "@/app/_lib/nibss-bvn-consent/types";
import { API_ENDPOINTS } from "@/app/(customer)/_services/endpoints";
import { AGENT_API_ENDPOINTS } from "@/app/agent/_services/endpoints";
import type {
  BvnConsentStatusRequest,
  BvnConsentStatusResponse,
  InitiateBvnConsentResponse,
  VerifyBvnRequest,
} from "@/app/_lib/api/types";

export const customerNigerianBvnConsentClient: NigerianBvnConsentClient = {
  initiateConsent: (data: VerifyBvnRequest) =>
    apiClient.post<InitiateBvnConsentResponse>(
      API_ENDPOINTS.auth.nigerian.verifyBvn,
      data,
      { skipAuth: true }
    ),
  getConsentStatus: (data: BvnConsentStatusRequest) =>
    apiClient.post<BvnConsentStatusResponse>(
      API_ENDPOINTS.auth.nigerian.bvnConsentStatus,
      data,
      { skipAuth: true }
    ),
};

export const agentNigerianBvnConsentClient: NigerianBvnConsentClient = {
  initiateConsent: (data: VerifyBvnRequest) =>
    apiClient.post<InitiateBvnConsentResponse>(
      AGENT_API_ENDPOINTS.customerAuth.nigerian.verifyBvn,
      data
    ),
  getConsentStatus: (data: BvnConsentStatusRequest) =>
    apiClient.post<BvnConsentStatusResponse>(
      AGENT_API_ENDPOINTS.customerAuth.nigerian.bvnConsentStatus,
      data
    ),
};
