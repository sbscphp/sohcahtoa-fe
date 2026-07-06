import { NIBSS_SESSION_STORAGE_KEY } from "@/app/_lib/nibss-bvn-consent/constants";

export function persistNibssSessionId(sessionId: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(NIBSS_SESSION_STORAGE_KEY, sessionId);
}

export function readNibssSessionId(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(NIBSS_SESSION_STORAGE_KEY);
}

export function clearNibssSessionId(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(NIBSS_SESSION_STORAGE_KEY);
}
