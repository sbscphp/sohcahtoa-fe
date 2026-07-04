import { NIBSS_ALLOWED_CONSENT_HOSTS } from "@/app/_lib/nibss-bvn-consent/constants";

export function isAllowedNibssConsentUrl(consentUrl: string): boolean {
  try {
    const url = new URL(consentUrl);
    if (url.protocol !== "https:") return false;

    return NIBSS_ALLOWED_CONSENT_HOSTS.some(
      (host) => url.hostname === host || url.hostname.endsWith(`.${host}`)
    );
  } catch {
    return false;
  }
}
