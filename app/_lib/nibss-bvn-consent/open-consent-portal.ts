import { isAllowedNibssConsentUrl } from "@/app/_lib/nibss-bvn-consent/validate-consent-url";

const POPUP_FEATURES =
  "popup=yes,width=480,height=720,menubar=no,toolbar=no,location=yes,status=no,resizable=yes,scrollbars=yes";

/** Opens NIBSS/iGree in a popup. Keeps opener for the /igree postMessage handshake. */
export function openNibssConsentPortal(consentUrl: string): Window | null {
  if (globalThis.window === undefined || !isAllowedNibssConsentUrl(consentUrl)) {
    return null;
  }

  return globalThis.window.open(consentUrl, "nibss_bvn_consent", POPUP_FEATURES);
}

export function redirectToNibssConsentPortal(consentUrl: string): boolean {
  if (globalThis.window === undefined || !isAllowedNibssConsentUrl(consentUrl)) {
    return false;
  }

  globalThis.window.location.assign(consentUrl);
  return true;
}
