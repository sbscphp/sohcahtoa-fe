"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { IgreeInitiateRequest } from "@/app/_lib/api/types";
import { handleApiError } from "@/app/_lib/api/error-handler";
import { openNibssConsentPortal } from "@/app/_lib/nibss-bvn-consent/open-consent-portal";
import { isAllowedNibssConsentUrl } from "@/app/_lib/nibss-bvn-consent/validate-consent-url";
import {
  BvnConsentPollError,
  pollBvnConsentStatus,
} from "@/app/_lib/nibss-bvn-consent/poll-bvn-consent-status";
import {
  clearNibssSessionId,
  persistNibssSessionId,
} from "@/app/_lib/nibss-bvn-consent/storage";
import {
  resolveIgreePageOrigins,
  startIgreeCallbackHandshake,
} from "@/app/_lib/nibss-bvn-consent/igree-callback-handshake";
import { igreeLog } from "@/app/_lib/nibss-bvn-consent/igree-debug";
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
  const popupRef = useRef<Window | null>(null);
  const handshakeCleanupRef = useRef<(() => void) | null>(null);
  const callbackSubmittedRef = useRef(false);
  const consentUrlRef = useRef<string | null>(null);
  const onCompletedRef = useRef(onCompleted);
  const onFailedRef = useRef(onFailed);

  useEffect(() => {
    onCompletedRef.current = onCompleted;
    onFailedRef.current = onFailed;
  }, [onCompleted, onFailed]);

  const stopHandshake = useCallback(() => {
    handshakeCleanupRef.current?.();
    handshakeCleanupRef.current = null;
  }, []);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    stopHandshake();
    popupRef.current = null;
  }, [stopHandshake]);

  const reset = useCallback(() => {
    cancel();
    setPhase("idle");
    setConsentUrl(null);
    consentUrlRef.current = null;
    setSessionId(null);
    setStatusMessage(null);
    setResult(null);
    setUsedPopup(false);
    callbackSubmittedRef.current = false;
    clearNibssSessionId();
  }, [cancel]);

  useEffect(() => () => cancel(), [cancel]);

  const fail = useCallback((message: string) => {
    setPhase("failed");
    setStatusMessage(message);
    onFailedRef.current?.(message);
    handleApiError({ message, status: 400 }, { customMessage: message });
  }, []);

  const fetchStatusAfterCallback = useCallback(
    async (activeSessionId: string) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setPhase("polling");
      setStatusMessage("Consent received. Retrieving verified BVN details…");
      igreeLog("retrieve after callback", { sessionId: activeSessionId });

      try {
        const completed = await pollBvnConsentStatus({
          signal: controller.signal,
          fetchStatus: () =>
            client.retrieveBvnDetails({ sessionId: activeSessionId }),
          onTick: (data) => {
            if (data.message) setStatusMessage(data.message);
          },
        });

        igreeLog("retrieve COMPLETED", {
          sessionId: activeSessionId,
          hasToken: Boolean(completed.verificationToken),
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
            : "Unable to retrieve BVN details. Please try again.";

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

  const submitCallbackFromHandshake = useCallback(
    async (payload: { code: string; state: string }) => {
      if (callbackSubmittedRef.current) return;
      callbackSubmittedRef.current = true;
      stopHandshake();

      igreeLog("submitting igree callback", {
        code: payload.code,
        state: payload.state,
      });
      setStatusMessage("Submitting consent to complete verification…");

      try {
        const response = await client.submitIgreeCallback({
          code: payload.code,
          state: payload.state,
        });

        if (!response.success) {
          callbackSubmittedRef.current = false;
          fail(
            response.error?.message ??
              "Failed to submit NIBSS consent. Please try again."
          );
          return;
        }

        setSessionId(payload.state);
        persistNibssSessionId(payload.state);
        await fetchStatusAfterCallback(payload.state);
      } catch (error) {
        callbackSubmittedRef.current = false;
        const message = "Failed to submit NIBSS consent. Please try again.";
        setPhase("failed");
        setStatusMessage(message);
        onFailedRef.current?.(message);
        handleApiError(error, { customMessage: message });
      }
    },
    [client, fail, fetchStatusAfterCallback, stopHandshake]
  );

  const beginHandshake = useCallback(
    (popup: Window, activeConsentUrl: string, controller: AbortController) => {
      const igreeOrigins = resolveIgreePageOrigins(activeConsentUrl);
      igreeLog("handshake start", { igreeOrigins });

      if (igreeOrigins.length === 0) {
        fail(
          "Unable to start iGree handshake. Set NEXT_PUBLIC_NIBSS_IGREE_ORIGIN to the /igree host origin."
        );
        return;
      }

      stopHandshake();
      setPhase("polling");
      setStatusMessage("Waiting for you to complete consent on NIBSS…");

      handshakeCleanupRef.current = startIgreeCallbackHandshake({
        popup,
        igreeOrigins,
        signal: controller.signal,
        onCallback: ({ code, state }) => {
          void submitCallbackFromHandshake({ code, state });
        },
        onTimeout: () => {
          setPhase("timed_out");
          setStatusMessage(
            "Still waiting for NIBSS consent. Reopen the consent window or try again."
          );
        },
      });
    },
    [fail, stopHandshake, submitCallbackFromHandshake]
  );

  const openConsentPortal = useCallback(() => {
    if (!consentUrl) return false;

    const popup = openNibssConsentPortal(consentUrl);
    if (!popup) return false;

    popupRef.current = popup;
    setUsedPopup(true);

    if (!callbackSubmittedRef.current) {
      const controller = new AbortController();
      abortRef.current = controller;
      beginHandshake(popup, consentUrl, controller);
    }

    return true;
  }, [beginHandshake, consentUrl]);

  const startConsent = useCallback(
    async (payload: IgreeInitiateRequest) => {
      cancel();
      setPhase("initiating");
      setStatusMessage(null);
      setResult(null);
      callbackSubmittedRef.current = false;
      igreeLog("initiate", {
        bvn: payload.bvn,
        firstName: payload.firstName,
        lastName: payload.lastName,
        dateOfBirth: payload.dateOfBirth,
        phoneNumber: payload.phoneNumber,
        email: payload.email,
      });

      try {
        const response = await client.initiateConsent(payload);
        igreeLog("initiate response", {
          success: response.success,
          sessionId: response.data?.sessionId,
          consentUrl: response.data?.consentUrl,
          error: response.error?.message,
        });

        if (
          !response.success ||
          !response.data?.sessionId ||
          !response.data.consentUrl
        ) {
          fail(
            response.error?.message ??
              "Failed to initiate BVN consent. Please try again."
          );
          return;
        }

        const {
          sessionId: nextSessionId,
          consentUrl: nextConsentUrl,
          message,
        } = response.data;

        if (!isAllowedNibssConsentUrl(nextConsentUrl)) {
          fail(
            "We received an invalid NIBSS consent link. Please try again or contact support."
          );
          return;
        }

        persistNibssSessionId(nextSessionId);
        setSessionId(nextSessionId);
        setConsentUrl(nextConsentUrl);
        consentUrlRef.current = nextConsentUrl;
        setStatusMessage(message ?? "Complete consent on NIBSS to continue.");

        const openedPopup = openNibssConsentPortal(nextConsentUrl);
        if (!openedPopup) {
          setUsedPopup(false);
          fail(
            "Please allow pop-ups for this site so we can complete NIBSS iGree consent, then try again."
          );
          return;
        }

        popupRef.current = openedPopup;
        setUsedPopup(true);

        const controller = new AbortController();
        abortRef.current = controller;
        beginHandshake(openedPopup, nextConsentUrl, controller);
      } catch (error) {
        const message = "Failed to initiate BVN consent. Please try again.";
        setPhase("failed");
        setStatusMessage(message);
        onFailedRef.current?.(message);
        handleApiError(error, { customMessage: message });
      }
    },
    [beginHandshake, cancel, client, fail]
  );

  const retryPolling = useCallback(async () => {
    const activeConsentUrl = consentUrlRef.current ?? consentUrl;
    const popup = popupRef.current;
    const controller = new AbortController();
    abortRef.current = controller;

    if (!callbackSubmittedRef.current) {
      if (popup && !popup.closed && activeConsentUrl) {
        beginHandshake(popup, activeConsentUrl, controller);
        return;
      }
      setStatusMessage("Reopen the NIBSS window to continue consent.");
      return;
    }

    if (!sessionId) return;
    await fetchStatusAfterCallback(sessionId);
  }, [beginHandshake, consentUrl, fetchStatusAfterCallback, sessionId]);

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
