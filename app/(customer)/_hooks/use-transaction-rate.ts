"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useCreateData } from "@/app/_lib/api/hooks";
import type { TransactionRateMode } from "@/app/_lib/api/types";
import { customerApi } from "@/app/(customer)/_services/customer-api";
import {
  formatExchangeRateLabel,
  getActiveRate,
} from "@/app/(customer)/_lib/transaction-rate";

export interface TransactionRateFormSlice {
  receiveAmount: string;
  receiveCurrency: string;
  sendAmount: string;
  sendCurrency: string;
  exchangeRate?: string;
}

export const DEFAULT_RATE_FROM_CURRENCY = "USD";
export const DEFAULT_RATE_TO_CURRENCY = "NGN";

interface UseTransactionRateCalculatorOptions {
  /** Buy FX → `buy`; sell FX → `sell` (server picks rate + convertedAmount). */
  mode: TransactionRateMode;
  getValues: () => TransactionRateFormSlice;
  setSendAmount: (value: string) => void;
  setExchangeRateLabel?: (label: string) => void;
  defaultLabel?: string;
  skipInitialFetch?: boolean;
}

function parseAmountInput(raw: string | undefined): number {
  if (raw == null || raw === "") return Number.NaN;
  const cleaned = raw.replaceAll(",", "").trim();
  if (cleaned === "") return Number.NaN;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : Number.NaN;
}

export function useTransactionRateCalculator({
  mode,
  getValues,
  setSendAmount,
  setExchangeRateLabel,
  defaultLabel = "USD1 - NGN1500",
  skipInitialFetch = false,
}: UseTransactionRateCalculatorOptions) {
  const [displayRate, setDisplayRate] = useState(defaultLabel);
  const { mutateAsync, isPending } = useCreateData(customerApi.transactionRates.calculate);

  const getValuesRef = useRef(getValues);
  const setSendAmountRef = useRef(setSendAmount);
  const setExchangeRateLabelRef = useRef(setExchangeRateLabel);
  const modeRef = useRef(mode);
  const requestSeqRef = useRef(0);

  useLayoutEffect(() => {
    getValuesRef.current = getValues;
    setSendAmountRef.current = setSendAmount;
    setExchangeRateLabelRef.current = setExchangeRateLabel;
    modeRef.current = mode;
  }, [getValues, setSendAmount, setExchangeRateLabel, mode]);

  const recalculate = useCallback(
    async (
      overrideAmount?: string,
      overrideFromCurrency?: string,
      overrideToCurrency?: string,
      overrideMode?: TransactionRateMode,
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

        if (requestSeq !== requestSeqRef.current) return;

        const data = response.data;
        if (!data) return;

        const converted = Number(data.convertedAmount);
        const activeRate = getActiveRate(data, rateMode);

        if (hasValidAmount && Number.isFinite(converted)) {
          setSendAmountRef.current(String(converted));
        } else if (!hasValidAmount) {
          setSendAmountRef.current("");
        }

        if (Number.isFinite(activeRate)) {
          const label = formatExchangeRateLabel(fromCurrency, toCurrency, activeRate);
          setDisplayRate(label);
          setExchangeRateLabelRef.current?.(label);
        }
      } catch {
        // Network / API error — keep previous displayRate
      }
    },
    [mutateAsync],
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
  };
}
