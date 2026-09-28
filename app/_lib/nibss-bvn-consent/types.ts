import type {
  ApiResponseWrapper,
  BvnConsentStatusRequest,
  BvnConsentStatusResponseData,
  IgreeCallbackRequest,
  IgreeCallbackResponseData,
  IgreeInitiateRequest,
  InitiateBvnConsentResponseData,
} from "@/app/_lib/api/types";

export type NigerianBvnConsentClient = {
  initiateConsent: (
    data: IgreeInitiateRequest
  ) => Promise<ApiResponseWrapper<InitiateBvnConsentResponseData>>;
  submitIgreeCallback: (
    data: IgreeCallbackRequest
  ) => Promise<ApiResponseWrapper<IgreeCallbackResponseData>>;
  getConsentStatus: (
    data: BvnConsentStatusRequest
  ) => Promise<ApiResponseWrapper<BvnConsentStatusResponseData>>;
};

export type BvnConsentFlowPhase =
  | "idle"
  | "initiating"
  | "polling"
  | "completed"
  | "failed"
  | "timed_out";

export type BvnConsentFlowResult = BvnConsentStatusResponseData;
