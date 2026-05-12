"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useCreateData } from "@/app/_lib/api/hooks";
import { agentApi } from "@/app/agent/_services/agent-api";

export interface AgentTransactionRateFormSlice {
  receiveAmount: string;
  receiveCurrency: string;
  sendAmount: string;
  sendCurrency: string;
}

const DEFAULT_RATE_FROM_CURRENCY = "USD";
const DEFAULT_RATE_TO_CURRENCY = "NGN";

interface UseAgentTransactionRateCalculatorOptions {
  getValues: () => AgentTransactionRateFormSlice;
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

/**
 * Matches customer `useTransactionRateCalculator`: fetch rate with `amount: 1` when the user
 * has not entered a positive amount yet, so the exchange-rate label is live—not the static default.
 */
export function useAgentTransactionRateCalculator({
  getValues,
  setSendAmount,
  setExchangeRateLabel,
  defaultLabel = "USD1 - NGN1500",
  skipInitialFetch = false,
}: UseAgentTransactionRateCalculatorOptions) {
  const [displayRate, setDisplayRate] = useState(defaultLabel);
  const { mutateAsync, isPending } = useCreateData(agentApi.rates.calculate);

  const getValuesRef = useRef(getValues);
  const setSendAmountRef = useRef(setSendAmount);
  const setExchangeRateLabelRef = useRef(setExchangeRateLabel);

  useLayoutEffect(() => {
    getValuesRef.current = getValues;
    setSendAmountRef.current = setSendAmount;
    setExchangeRateLabelRef.current = setExchangeRateLabel;
  }, [getValues, setSendAmount, setExchangeRateLabel]);

  const recalculate = useCallback(
    async (
      overrideAmount?: string,
      overrideFromCurrency?: string,
      overrideToCurrency?: string
    ) => {
      const { receiveAmount, receiveCurrency, sendCurrency } = getValuesRef.current();

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
        });

        const data = response.data;
        if (!data) return;

        const converted = Number(data.convertedAmount);
        const sellRate = Number(data.sellRate);

        if (hasValidAmount && Number.isFinite(converted)) {
          setSendAmountRef.current(converted.toString());
        }

        if (Number.isFinite(sellRate)) {
          const label = `${fromCurrency}1 - ${sellRate} ${toCurrency}`;
          setDisplayRate(label);
          setExchangeRateLabelRef.current?.(label);
        }
      } catch {
        // Network / API error — keep previous displayRate
      }
    },
    [mutateAsync]
  );

  const didBootstrap = useRef(false);
  useEffect(() => {
    if (skipInitialFetch || didBootstrap.current) return;
    didBootstrap.current = true;
    queueMicrotask(() => {
      void recalculate();
    });
  }, [skipInitialFetch, recalculate]);

  return {
    displayRate,
    recalculate,
    isCalculating: isPending,
  };
}
