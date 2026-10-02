import { apiClient } from "@/app/_lib/api/client";
import type { NigerianBvnConsentClient } from "@/app/_lib/nibss-bvn-consent/types";
import { normalizeInitiateConsentData } from "@/app/_lib/nibss-bvn-consent/normalize-initiate-response";
import { API_ENDPOINTS } from "@/app/(customer)/_services/endpoints";
import { AGENT_API_ENDPOINTS } from "@/app/agent/_services/endpoints";
import type {
  ApiResponseWrapper,
  IgreeCallbackRequest,
  IgreeCallbackResponse,
  IgreeInitiateRequest,
  IgreeRetrieveRequest,
  IgreeRetrieveResponse,
  InitiateBvnConsentResponse,
  InitiateBvnConsentResponseData,
} from "@/app/_lib/api/types";

async function initiateAndNormalize(
  path: string,
  data: IgreeInitiateRequest,
  options?: { skipAuth?: boolean }
): Promise<ApiResponseWrapper<InitiateBvnConsentResponseData>> {
  const response = await apiClient.post<InitiateBvnConsentResponse>(
    path,
    data,
    options
  );

  if (!response.success || !response.data) {
    return response;
  }

  const normalized = normalizeInitiateConsentData(response.data);
  if (!normalized) {
    return {
      ...response,
      success: false,
      data: undefined,
      error: {
        code: response.error?.code ?? "INVALID_CONSENT_RESPONSE",
        message:
          response.error?.message ??
          "Invalid consent response from server. Missing session or redirect URL.",
      },
    };
  }

  return {
    ...response,
    data: normalized,
  };
}

export const customerNigerianBvnConsentClient: NigerianBvnConsentClient = {
  initiateConsent: (data: IgreeInitiateRequest) =>
    initiateAndNormalize(API_ENDPOINTS.auth.nigerian.igreeInitiate, data, {
      skipAuth: true,
    }),
  submitIgreeCallback: (data: IgreeCallbackRequest) =>
    apiClient.post<IgreeCallbackResponse>(API_ENDPOINTS.auth.nibss.igreeCallback, data, {
      skipAuth: true,
    }),
  retrieveBvnDetails: (data: IgreeRetrieveRequest) =>
    apiClient.post<IgreeRetrieveResponse>(
      API_ENDPOINTS.auth.nigerian.igreeRetrieve,
      data,
      { skipAuth: true }
    ),
};

export const agentNigerianBvnConsentClient: NigerianBvnConsentClient = {
  initiateConsent: (data: IgreeInitiateRequest) =>
    initiateAndNormalize(
      AGENT_API_ENDPOINTS.customerAuth.nigerian.igreeInitiate,
      data
    ),
  submitIgreeCallback: (data: IgreeCallbackRequest) =>
    apiClient.post<IgreeCallbackResponse>(API_ENDPOINTS.auth.nibss.igreeCallback, data),
  retrieveBvnDetails: (data: IgreeRetrieveRequest) =>
    apiClient.post<IgreeRetrieveResponse>(
      AGENT_API_ENDPOINTS.customerAuth.nigerian.igreeRetrieve,
      data
    ),
};
