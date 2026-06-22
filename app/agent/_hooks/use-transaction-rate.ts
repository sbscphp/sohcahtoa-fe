"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { notifications } from "@mantine/notifications";
import { useCreateData } from "@/app/_lib/api/hooks";
import type { TransactionRateMode } from "@/app/_lib/api/types";
import { agentApi } from "@/app/agent/_services/agent-api";
import {
  formatExchangeRateLabel,
  getActiveRate,
  RATE_UNAVAILABLE_LABEL,
} from "@/app/(customer)/_lib/transaction-rate";
import { getAgentApiErrorMessage } from "@/app/agent/_utils/api-error-message";

export interface AgentTransactionRateFormSlice {
  receiveAmount: string;
  receiveCurrency: string;
  sendAmount: string;
  sendCurrency: string;
}

const DEFAULT_RATE_FROM_CURRENCY = "USD";
const DEFAULT_RATE_TO_CURRENCY = "NGN";

interface UseAgentTransactionRateCalculatorOptions {
  mode: TransactionRateMode;
  getValues: () => AgentTransactionRateFormSlice;
  setSendAmount: (value: string) => void;
  setExchangeRateLabel?: (label: string) => void;
  defaultLabel?: string;
  skipInitialFetch?: boolean;
  showErrorToast?: boolean;
}

function parseAmountInput(raw: string | undefined): number {
  if (raw == null || raw === "") return Number.NaN;
  const cleaned = raw.replaceAll(",", "").trim();
  if (cleaned === "") return Number.NaN;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : Number.NaN;
}

/**
 * Matches customer `useTransactionRateCalculator`: server `mode` drives rate + convertedAmount.
 */
export function useAgentTransactionRateCalculator({
  mode,
  getValues,
  setSendAmount,
  setExchangeRateLabel,
  defaultLabel = "USD1 - NGN1500",
  skipInitialFetch = false,
  showErrorToast = true,
}: UseAgentTransactionRateCalculatorOptions) {
  const [displayRate, setDisplayRate] = useState(defaultLabel);
  const [hasValidRate, setHasValidRate] = useState(false);
  const [rateError, setRateError] = useState<string | null>(null);
  const { mutateAsync, isPending } = useCreateData(agentApi.rates.calculate);

  const getValuesRef = useRef(getValues);
  const setSendAmountRef = useRef(setSendAmount);
  const setExchangeRateLabelRef = useRef(setExchangeRateLabel);
  const modeRef = useRef(mode);
  const requestSeqRef = useRef(0);
  const showErrorToastRef = useRef(showErrorToast);

  useLayoutEffect(() => {
    getValuesRef.current = getValues;
    setSendAmountRef.current = setSendAmount;
    setExchangeRateLabelRef.current = setExchangeRateLabel;
    modeRef.current = mode;
    showErrorToastRef.current = showErrorToast;
  }, [getValues, setSendAmount, setExchangeRateLabel, mode, showErrorToast]);

  const clearStaleRate = useCallback(() => {
    setHasValidRate(false);
    setDisplayRate(RATE_UNAVAILABLE_LABEL);
    setSendAmountRef.current("");
    setExchangeRateLabelRef.current?.("");
  }, []);

  const recalculate = useCallback(
    async (
      overrideAmount?: string,
      overrideFromCurrency?: string,
      overrideToCurrency?: string,
      overrideMode?: TransactionRateMode
    ) => {
      const requestSeq = ++requestSeqRef.current;
      const { receiveAmount, receiveCurrency, sendCurrency } = getValuesRef.current();
      const rateMode = overrideMode ?? modeRef.current;

      const fromCurrency =
        (overrideFromCurrency ?? receiveCurrency ?? "").trim() || DEFAULT_RATE_FROM_CURRENCY;
      const toCurrency =
        (overrideToCurrency ?? sendCurrency ?? "").trim() || DEFAULT_RATE_TO_CURRENCY;

      const rawAmount = overrideAmount ?? receiveAmount;
      const numericAmount = parseAmountInput(rawAmount);
      const hasValidAmount = Number.isFinite(numericAmount) && numericAmount > 0;
      const amountForApi = hasValidAmount ? numericAmount : 1;

      if (!hasValidAmount) {
        setSendAmountRef.current("");
      }

      try {
        const response = await mutateAsync({
          fromCurrency,
          toCurrency,
          amount: amountForApi,
          mode: rateMode,
        });

        if (requestSeq !== requestSeqRef.current) return false;

        const data = response.data;
        if (!data) {
          clearStaleRate();
          setRateError("Could not calculate exchange rate for this currency.");
          return false;
        }

        const converted = Number(data.convertedAmount);
        const activeRate = getActiveRate(data, rateMode);

        if (!Number.isFinite(activeRate)) {
          clearStaleRate();
          const message = "No exchange rate is configured for this currency pair.";
          setRateError(message);
          if (showErrorToastRef.current) {
            notifications.show({
              title: "Exchange rate unavailable",
              message,
              color: "red",
            });
          }
          return false;
        }

        if (hasValidAmount && Number.isFinite(converted)) {
          setSendAmountRef.current(String(converted));
        } else if (!hasValidAmount) {
          setSendAmountRef.current("");
        }

        const label = formatExchangeRateLabel(fromCurrency, toCurrency, activeRate);
        setDisplayRate(label);
        setExchangeRateLabelRef.current?.(label);
        setHasValidRate(true);
        setRateError(null);
        return true;
      } catch (error) {
        if (requestSeq !== requestSeqRef.current) return false;

        clearStaleRate();
        const message = getAgentApiErrorMessage(
          error,
          "Could not calculate exchange rate for this currency.",
        );
        setRateError(message);
        if (showErrorToastRef.current) {
          notifications.show({
            title: "Exchange rate unavailable",
            message,
            color: "red",
          });
        }
        return false;
      }
    },
    [mutateAsync, clearStaleRate]
  );

  const didInitialFetch = useRef(false);
  useEffect(() => {
    if (skipInitialFetch || didInitialFetch.current) return;
    didInitialFetch.current = true;
    recalculate(undefined, undefined, undefined, mode).catch(() => {});
  }, [skipInitialFetch, mode, recalculate]);

  return {
    displayRate,
    recalculate,
    isCalculating: isPending,
    hasValidRate,
    rateError,
  };
}
