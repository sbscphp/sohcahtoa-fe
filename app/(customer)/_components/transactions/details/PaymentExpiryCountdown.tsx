"use client";

import { useCallback, useEffect, useState } from "react";
import {
  formatPaymentExpiryCountdown,
  parseExpiryToSeconds,
} from "@/app/(customer)/_utils/transaction-payment";

type PaymentExpiryCountdownProps = {
  expiresAtIso: string | null | undefined;
  fallbackExpiry?: string | null;
  active: boolean;
  /** Fired when computed remaining seconds changes (for “expiring soon” UI). */
  onRemainingChange?: (secondsRemaining: number) => void;
};

function computeRemaining(
  expiresAtIso: string | null | undefined,
  fallbackExpiry: string | null | undefined
): number {
  let sec = 0;
  if (expiresAtIso?.trim()) sec = parseExpiryToSeconds(expiresAtIso);
  else if (fallbackExpiry?.trim()) sec = parseExpiryToSeconds(fallbackExpiry);
  return Math.max(0, Math.floor(sec));
}

export function PaymentExpiryCountdown({
  expiresAtIso,
  fallbackExpiry,
  active,
  onRemainingChange,
}: Readonly<PaymentExpiryCountdownProps>) {
  const tick = useCallback(
    () => computeRemaining(expiresAtIso, fallbackExpiry),
    [expiresAtIso, fallbackExpiry]
  );

  const [remaining, setRemaining] = useState(() => tick());

  useEffect(() => {
    setRemaining(tick());
  }, [tick]);

  useEffect(() => {
    if (!active) return;
    const id = globalThis.setInterval(() => {
      setRemaining(tick());
    }, 1000);
    return () => globalThis.clearInterval(id);
  }, [active, tick]);

  useEffect(() => {
    const sync = () => setRemaining(tick());
    document.addEventListener("visibilitychange", sync);
    globalThis.addEventListener("focus", sync);
    return () => {
      document.removeEventListener("visibilitychange", sync);
      globalThis.removeEventListener("focus", sync);
    };
  }, [tick]);

  useEffect(() => {
    onRemainingChange?.(remaining);
  }, [remaining, onRemainingChange]);

  return <>{formatPaymentExpiryCountdown(remaining)}</>;
}
