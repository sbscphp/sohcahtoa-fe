"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { VerifyBvnRequest } from "@/app/_lib/api/types";
import { handleApiError } from "@/app/_lib/api/error-handler";
import {
  openNibssConsentPortal,
  redirectToNibssConsentPortal,
} from "@/app/_lib/nibss-bvn-consent/open-consent-portal";
import {
  BvnConsentPollError,
  pollBvnConsentStatus,
} from "@/app/_lib/nibss-bvn-consent/poll-bvn-consent-status";
import {
  clearNibssSessionId,
  persistNibssSessionId,
} from "@/app/_lib/nibss-bvn-consent/storage";
import type {
  BvnConsentFlowPhase,
  BvnConsentFlowResult,
  NigerianBvnConsentClient,
} from "@/app/_lib/nibss-bvn-consent/types";

type UseBvnConsentFlowOptions = {
  client: NigerianBvnConsentClient;
  onCompleted?: (result: BvnConsentFlowResult) => void;
  onFailed?: (message: string) => void;
};

export function useBvnConsentFlow({
  client,
  onCompleted,
  onFailed,
}: UseBvnConsentFlowOptions) {
  const [phase, setPhase] = useState<BvnConsentFlowPhase>("idle");
  const [consentUrl, setConsentUrl] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [result, setResult] = useState<BvnConsentFlowResult | null>(null);
  const [usedPopup, setUsedPopup] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const onCompletedRef = useRef(onCompleted);
  const onFailedRef = useRef(onFailed);

  useEffect(() => {
    onCompletedRef.current = onCompleted;
    onFailedRef.current = onFailed;
  }, [onCompleted, onFailed]);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  const reset = useCallback(() => {
    cancel();
    setPhase("idle");
    setConsentUrl(null);
    setSessionId(null);
    setStatusMessage(null);
    setResult(null);
    setUsedPopup(false);
    clearNibssSessionId();
  }, [cancel]);

  useEffect(() => () => cancel(), [cancel]);

  const openConsentPortal = useCallback(() => {
    if (!consentUrl) return false;

    const popup = openNibssConsentPortal(consentUrl);
    if (popup) {
      setUsedPopup(true);
      return true;
    }

    return redirectToNibssConsentPortal(consentUrl);
  }, [consentUrl]);

  const startPolling = useCallback(
    async (activeSessionId: string) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setPhase("polling");
      setStatusMessage("Waiting for you to complete consent on NIBSS…");

      try {
        const completed = await pollBvnConsentStatus({
          signal: controller.signal,
          fetchStatus: () =>
            client.getConsentStatus({ sessionId: activeSessionId }),
          onTick: (data) => {
            if (data.message) setStatusMessage(data.message);
          },
        });

        setResult(completed);
        setPhase("completed");
        clearNibssSessionId();
        onCompletedRef.current?.(completed);
      } catch (error) {
        if (error instanceof BvnConsentPollError && error.code === "ABORTED") {
          return;
        }

        const message =
          error instanceof BvnConsentPollError
            ? error.message
            : "Unable to confirm BVN consent. Please try again.";

        setPhase(
          error instanceof BvnConsentPollError && error.code === "TIMED_OUT"
            ? "timed_out"
            : "failed"
        );
        setStatusMessage(message);
        onFailedRef.current?.(message);

        if (!(error instanceof BvnConsentPollError)) {
          handleApiError(error, { customMessage: message });
        }
      }
    },
    [client]
  );

  const startConsent = useCallback(
    async (payload: VerifyBvnRequest) => {
      cancel();
      setPhase("initiating");
      setStatusMessage(null);
      setResult(null);

      try {
        const response = await client.initiateConsent(payload);

        if (!response.success || !response.data?.sessionId || !response.data.consentUrl) {
          const message =
            response.error?.message ?? "Failed to initiate BVN consent. Please try again.";
          setPhase("failed");
          setStatusMessage(message);
          onFailedRef.current?.(message);
          handleApiError(
            { message, status: 400 },
            { customMessage: message }
          );
          return;
        }

        const { sessionId: nextSessionId, consentUrl: nextConsentUrl, message } =
          response.data;

        persistNibssSessionId(nextSessionId);
        setSessionId(nextSessionId);
        setConsentUrl(nextConsentUrl);
        setStatusMessage(
          message ?? "Complete consent on NIBSS to continue."
        );

        const openedPopup = openNibssConsentPortal(nextConsentUrl);
        setUsedPopup(openedPopup !== null);

        if (!openedPopup) {
          redirectToNibssConsentPortal(nextConsentUrl);
        }

        await startPolling(nextSessionId);
      } catch (error) {
        const message = "Failed to initiate BVN consent. Please try again.";
        setPhase("failed");
        setStatusMessage(message);
        onFailedRef.current?.(message);
        handleApiError(error, { customMessage: message });
      }
    },
    [cancel, client, startPolling]
  );

  const retryPolling = useCallback(async () => {
    const activeSessionId = sessionId ?? null;
    if (!activeSessionId) return;
    await startPolling(activeSessionId);
  }, [sessionId, startPolling]);

  return {
    phase,
    consentUrl,
    sessionId,
    statusMessage,
    result,
    usedPopup,
    startConsent,
    openConsentPortal,
    retryPolling,
    cancel,
    reset,
    isActive: phase === "initiating" || phase === "polling",
  };
}
