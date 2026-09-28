import {
  NIBSS_IGREE_HANDSHAKE_INTERVAL_MS,
  NIBSS_IGREE_HANDSHAKE_TIMEOUT_MS,
  NIBSS_IGREE_ORIGIN_ENV_KEY,
} from "@/app/_lib/nibss-bvn-consent/constants";
import { igreeLog } from "@/app/_lib/nibss-bvn-consent/igree-debug";

export type NibssCallbackRequestMessage = {
  type: "NIBSS_CALLBACK_REQUEST";
};

export type NibssCallbackReadyMessage = {
  type: "NIBSS_CALLBACK_READY";
};

export type NibssConsentCallbackMessage = {
  type: "NIBSS_CONSENT_CALLBACK";
  code: string;
  state: string;
};

function toTrustedOrigin(value: string): string | null {
  try {
    const url = new URL(value);
    if (
      url.protocol !== "https:" &&
      url.hostname !== "localhost" &&
      url.hostname !== "127.0.0.1"
    ) {
      return null;
    }
    return url.origin;
  } catch {
    return null;
  }
}

/** Apex + www siblings (redirect_uri host often differs from the live /igree host). */
export function withWwwVariants(origin: string): string[] {
  try {
    const url = new URL(origin);
    if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
      return [url.origin];
    }

    if (url.hostname.startsWith("www.")) {
      return [url.origin, `${url.protocol}//${url.hostname.slice(4)}`];
    }

    return [url.origin, `${url.protocol}//www.${url.hostname}`];
  } catch {
    return [origin];
  }
}

function expandOrigins(origins: string[]): string[] {
  return Array.from(new Set(origins.flatMap((origin) => withWwwVariants(origin))));
}

export function getIgreePageOrigins(
  envValue = process.env[NIBSS_IGREE_ORIGIN_ENV_KEY]
): string[] {
  if (!envValue?.trim()) return [];

  return expandOrigins(
    envValue
      .split(",")
      .map((part) => toTrustedOrigin(part.trim()))
      .filter((origin): origin is string => origin !== null)
  );
}

export function getIgreeOriginFromConsentUrl(consentUrl: string): string | null {
  try {
    const redirectUri = new URL(consentUrl).searchParams.get("redirect_uri");
    return redirectUri ? toTrustedOrigin(redirectUri) : null;
  } catch {
    return null;
  }
}

export function resolveIgreePageOrigins(consentUrl?: string | null): string[] {
  const fromEnv = getIgreePageOrigins();
  const fromConsentUrl = consentUrl
    ? getIgreeOriginFromConsentUrl(consentUrl)
    : null;

  return expandOrigins([
    ...fromEnv,
    ...(fromConsentUrl ? [fromConsentUrl] : []),
  ]);
}

export function isNibssCallbackReadyMessage(
  data: unknown
): data is NibssCallbackReadyMessage {
  return (
    typeof data === "object" &&
    data !== null &&
    !Array.isArray(data) &&
    (data as { type?: unknown }).type === "NIBSS_CALLBACK_READY"
  );
}

export function isNibssConsentCallbackMessage(
  data: unknown
): data is NibssConsentCallbackMessage {
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    return false;
  }

  const record = data as Record<string, unknown>;
  return (
    record.type === "NIBSS_CONSENT_CALLBACK" &&
    typeof record.code === "string" &&
    record.code.length > 0 &&
    typeof record.state === "string" &&
    record.state.length > 0
  );
}

type HandshakeOptions = {
  popup: Window;
  igreeOrigins: string[];
  signal: AbortSignal;
  onCallback: (payload: { code: string; state: string; origin: string }) => void;
  intervalMs?: number;
  timeoutMs?: number;
  onTimeout?: () => void;
};

/**
 * Cross-origin opener handshake with /igree:
 * ping NIBSS_CALLBACK_REQUEST → handle READY → accept NIBSS_CONSENT_CALLBACK { code, state }.
 */
export function startIgreeCallbackHandshake({
  popup,
  igreeOrigins,
  signal,
  onCallback,
  intervalMs = NIBSS_IGREE_HANDSHAKE_INTERVAL_MS,
  timeoutMs = NIBSS_IGREE_HANDSHAKE_TIMEOUT_MS,
  onTimeout,
}: HandshakeOptions): () => void {
  const trustedOrigins = new Set(expandOrigins(igreeOrigins));
  if (trustedOrigins.size === 0) {
    return () => undefined;
  }

  let consumed = false;
  const pingTargets = new Set(trustedOrigins);
  const request: NibssCallbackRequestMessage = { type: "NIBSS_CALLBACK_REQUEST" };

  const sendRequest = (origin: string) => {
    try {
      popup.postMessage(request, origin);
    } catch {
      // Popup may still be on the NIBSS host.
    }
  };

  const pingPopup = () => {
    if (consumed || signal.aborted || popup.closed) return;
    for (const origin of pingTargets) {
      sendRequest(origin);
    }
  };

  const onMessage = (event: MessageEvent<unknown>) => {
    if (consumed || signal.aborted || event.source !== popup) return;

    if (isNibssCallbackReadyMessage(event.data)) {
      if (!trustedOrigins.has(event.origin)) {
        igreeLog("ignored READY from untrusted origin", { origin: event.origin });
        return;
      }
      igreeLog("NIBSS_CALLBACK_READY", { origin: event.origin });
      pingTargets.add(event.origin);
      sendRequest(event.origin);
      return;
    }

    if (
      !trustedOrigins.has(event.origin) ||
      !isNibssConsentCallbackMessage(event.data)
    ) {
      return;
    }

    igreeLog("NIBSS_CONSENT_CALLBACK", {
      origin: event.origin,
      code: event.data.code,
      state: event.data.state,
    });

    consumed = true;
    cleanup();
    onCallback({
      code: event.data.code,
      state: event.data.state,
      origin: event.origin,
    });
  };

  const cleanup = () => {
    globalThis.window.removeEventListener("message", onMessage);
    globalThis.window.clearInterval(intervalId);
    globalThis.window.clearTimeout(timeoutId);
  };

  globalThis.window.addEventListener("message", onMessage);
  const intervalId = globalThis.window.setInterval(pingPopup, intervalMs);
  pingPopup();

  const timeoutId = globalThis.window.setTimeout(() => {
    if (!consumed) {
      cleanup();
      onTimeout?.();
    }
  }, timeoutMs);

  signal.addEventListener("abort", cleanup, { once: true });

  return cleanup;
}
