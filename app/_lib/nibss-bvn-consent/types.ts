import type {
  ApiResponseWrapper,
  IgreeCallbackRequest,
  IgreeCallbackResponseData,
  IgreeInitiateRequest,
  IgreeRetrieveRequest,
  IgreeRetrieveResponseData,
  InitiateBvnConsentResponseData,
} from "@/app/_lib/api/types";

export type NigerianBvnConsentClient = {
  initiateConsent: (
    data: IgreeInitiateRequest
  ) => Promise<ApiResponseWrapper<InitiateBvnConsentResponseData>>;
  submitIgreeCallback: (
    data: IgreeCallbackRequest
  ) => Promise<ApiResponseWrapper<IgreeCallbackResponseData>>;
  retrieveBvnDetails: (
    data: IgreeRetrieveRequest
  ) => Promise<ApiResponseWrapper<IgreeRetrieveResponseData>>;
};

export type BvnConsentFlowPhase =
  | "idle"
  | "initiating"
  | "polling"
  | "completed"
  | "failed"
  | "timed_out";

export type BvnConsentFlowResult = IgreeRetrieveResponseData;
