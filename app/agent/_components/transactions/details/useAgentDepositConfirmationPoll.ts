"use client";

import { useEffect, useState } from "react";
import type { TransactionDepositStatusData } from "@/app/_lib/api/types";
import { isDepositVerified } from "@/app/agent/_utils/deposit-verified";

const DEPOSIT_POLL_INTERVAL_MS = 3000;
const DEPOSIT_POLL_MAX_MS = 3 * 60 * 1000;

type PollArgs = {
  transactionId: string;
  opened: boolean;
  confirmingPayment: boolean;
  pollStartedAtRef: { current: number | null };
  fetchDepositStatus: (transactionId: string) => Promise<{ data?: TransactionDepositStatusData }>;
  onVerified: () => Promise<void>;
};

/** Agent: poll deposit status after “I have sent the money” (bank). */
export function useAgentDepositConfirmationPoll({
  transactionId,
  opened,
  confirmingPayment,
  pollStartedAtRef,
  fetchDepositStatus,
  onVerified,
}: PollArgs) {
  const [confirmTimedOut, setConfirmTimedOut] = useState(false);

  useEffect(() => {
    if (!confirmingPayment || !transactionId || !opened) return;

    let cancelled = false;
    let nextTimeoutId: ReturnType<typeof setTimeout> | null = null;

    const clearScheduled = () => {
      if (nextTimeoutId !== null) {
        clearTimeout(nextTimeoutId);
        nextTimeoutId = null;
      }
    };

    const finish = async () => {
      if (cancelled) return;
      clearScheduled();
      pollStartedAtRef.current = null;
      setConfirmTimedOut(false);
      await onVerified();
    };

    const tick = async () => {
      if (cancelled) return;

      const started = pollStartedAtRef.current ?? Date.now();
      pollStartedAtRef.current = started;

      if (Date.now() - started > DEPOSIT_POLL_MAX_MS) {
        setConfirmTimedOut(true);
      }

      try {
        const res = await fetchDepositStatus(transactionId);
        if (cancelled) return;
        if (isDepositVerified(res?.data)) {
          await finish();
          return;
        }
      } catch {
        // continue until timeout or success
      }

      if (cancelled) return;
      nextTimeoutId = setTimeout(() => {
        nextTimeoutId = null;
        void tick();
      }, DEPOSIT_POLL_INTERVAL_MS);
    };

    void tick();

    return () => {
      cancelled = true;
      clearScheduled();
    };
  }, [
    confirmingPayment,
    transactionId,
    opened,
    fetchDepositStatus,
    onVerified,
    pollStartedAtRef,
  ]);

  return { confirmTimedOut, setConfirmTimedOut };
}
