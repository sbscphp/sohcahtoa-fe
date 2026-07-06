import { isAllowedNibssConsentUrl } from "@/app/_lib/nibss-bvn-consent/validate-consent-url";

const POPUP_FEATURES =
  "popup=yes,width=480,height=720,menubar=no,toolbar=no,location=yes,status=no,resizable=yes,scrollbars=yes";

/**
 * Opens the NIBSS consent portal in a popup when allowed.
 * Returns null when blocked or URL fails host validation (caller should same-tab redirect).
 */
export function openNibssConsentPortal(consentUrl: string): Window | null {
  if (globalThis.window === undefined || !isAllowedNibssConsentUrl(consentUrl)) {
    return null;
  }

  const popup = globalThis.window.open(consentUrl, "nibss_bvn_consent", POPUP_FEATURES);
  if (!popup) return null;

  try {
    popup.opener = null;
  } catch {
    // Some browsers restrict opener assignment; noopener in features is sufficient.
  }

  return popup;
}

export function redirectToNibssConsentPortal(consentUrl: string): boolean {
  if (globalThis.window === undefined || !isAllowedNibssConsentUrl(consentUrl)) {
    return false;
  }

  globalThis.window.location.assign(consentUrl);
  return true;
}
