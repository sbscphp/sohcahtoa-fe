import type { InitiateBvnConsentResponseData } from "@/app/_lib/api/types";

/**
 * Normalize Consent Hub (`sessionId`/`consentUrl`) and iGree (`state`/`authUrl`)
 * initiate responses into the shape used by the consent flow hook.
 */
export function normalizeInitiateConsentData(
  data: InitiateBvnConsentResponseData
): InitiateBvnConsentResponseData | null {
  const sessionId = data.sessionId || data.state;
  const consentUrl = data.consentUrl || data.authUrl;

  if (!sessionId || !consentUrl) return null;

  return {
    sessionId,
    consentUrl,
    message: data.message,
  };
}
