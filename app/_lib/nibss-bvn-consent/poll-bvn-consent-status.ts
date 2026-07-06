import type { ApiResponseWrapper, BvnConsentStatusResponseData } from "@/app/_lib/api/types";
import {
  NIBSS_POLL_BACKOFF_MULTIPLIER,
  NIBSS_POLL_INITIAL_INTERVAL_MS,
  NIBSS_POLL_MAX_DURATION_MS,
  NIBSS_POLL_MAX_INTERVAL_MS,
} from "@/app/_lib/nibss-bvn-consent/constants";

export class BvnConsentPollError extends Error {
  constructor(
    message: string,
    readonly code: "FAILED" | "TIMED_OUT" | "ABORTED" | "API_ERROR"
  ) {
    super(message);
    this.name = "BvnConsentPollError";
  }
}

export type PollBvnConsentStatusOptions = {
  fetchStatus: () => Promise<ApiResponseWrapper<BvnConsentStatusResponseData>>;
  signal?: AbortSignal;
  onTick?: (data: BvnConsentStatusResponseData) => void;
  initialIntervalMs?: number;
  maxIntervalMs?: number;
  maxDurationMs?: number;
  backoffMultiplier?: number;
  /** When true, pauses polling while the document is hidden. */
  pauseWhenHidden?: boolean;
};

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new BvnConsentPollError("Polling cancelled.", "ABORTED"));
      return;
    }

    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);

    const onAbort = () => {
      window.clearTimeout(timeoutId);
      reject(new BvnConsentPollError("Polling cancelled.", "ABORTED"));
    };

    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

function waitForDocumentVisible(signal?: AbortSignal): Promise<void> {
  if (typeof document === "undefined" || document.visibilityState === "visible") {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new BvnConsentPollError("Polling cancelled.", "ABORTED"));
      return;
    }

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        document.removeEventListener("visibilitychange", onVisible);
        signal?.removeEventListener("abort", onAbort);
        resolve();
      }
    };

    const onAbort = () => {
      document.removeEventListener("visibilitychange", onVisible);
      reject(new BvnConsentPollError("Polling cancelled.", "ABORTED"));
    };

    document.addEventListener("visibilitychange", onVisible);
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

/**
 * Polls bvn-consent-status until COMPLETED, FAILED, timeout, or abort.
 * Uses exponential backoff and skips requests while the tab is hidden.
 */
export async function pollBvnConsentStatus(
  options: PollBvnConsentStatusOptions
): Promise<BvnConsentStatusResponseData> {
  const {
    fetchStatus,
    signal,
    onTick,
    initialIntervalMs = NIBSS_POLL_INITIAL_INTERVAL_MS,
    maxIntervalMs = NIBSS_POLL_MAX_INTERVAL_MS,
    maxDurationMs = NIBSS_POLL_MAX_DURATION_MS,
    backoffMultiplier = NIBSS_POLL_BACKOFF_MULTIPLIER,
    pauseWhenHidden = true,
  } = options;

  const startedAt = Date.now();
  let intervalMs = initialIntervalMs;
  let inFlight = false;

  while (Date.now() - startedAt < maxDurationMs) {
    if (signal?.aborted) {
      throw new BvnConsentPollError("Polling cancelled.", "ABORTED");
    }

    if (pauseWhenHidden) {
      await waitForDocumentVisible(signal);
    }

    if (inFlight) {
      await sleep(250, signal);
      continue;
    }

    inFlight = true;
    let response: ApiResponseWrapper<BvnConsentStatusResponseData>;

    try {
      response = await fetchStatus();
    } finally {
      inFlight = false;
    }

    if (!response.success || !response.data) {
      throw new BvnConsentPollError(
        response.error?.message ?? "Unable to check BVN consent status.",
        "API_ERROR"
      );
    }

    const { data } = response;
    onTick?.(data);

    if (data.status === "COMPLETED") {
      if (!data.verificationToken) {
        throw new BvnConsentPollError(
          "Consent completed but verification token is missing.",
          "API_ERROR"
        );
      }
      return data;
    }

    if (data.status === "FAILED") {
      throw new BvnConsentPollError(
        data.message ?? "BVN consent was not completed.",
        "FAILED"
      );
    }

    await sleep(intervalMs, signal);
    intervalMs = Math.min(
      Math.round(intervalMs * backoffMultiplier),
      maxIntervalMs
    );
  }

  throw new BvnConsentPollError(
    "BVN consent is taking longer than expected. Please try again.",
    "TIMED_OUT"
  );
}
