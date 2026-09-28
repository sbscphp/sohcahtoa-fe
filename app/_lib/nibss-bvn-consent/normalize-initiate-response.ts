import type { InitiateBvnConsentResponseData } from "@/app/_lib/api/types";

/** Maps Consent Hub or iGree initiate fields into sessionId + consentUrl. */
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
