"use client";

import { useCallback, useState } from "react";
import { useCreateData } from "@/app/_lib/api/hooks";
import { agentApi } from "@/app/agent/_services/agent-api";

export interface AgentTransactionRateFormSlice {
  receiveAmount: string;
  receiveCurrency: string;
  sendAmount: string;
  sendCurrency: string;
}

interface UseAgentTransactionRateCalculatorOptions {
  getValues: () => AgentTransactionRateFormSlice;
  setSendAmount: (value: string) => void;
  setExchangeRateLabel?: (label: string) => void;
  defaultLabel?: string;
}

export function useAgentTransactionRateCalculator({
  getValues,
  setSendAmount,
  setExchangeRateLabel,
  defaultLabel = "USD1 - NGN1500",
}: UseAgentTransactionRateCalculatorOptions) {
  const [displayRate, setDisplayRate] = useState(defaultLabel);
  const calculateRate = useCreateData(agentApi.rates.calculate);

  const recalculate = useCallback(
    (
      overrideAmount?: string,
      overrideFromCurrency?: string,
      overrideToCurrency?: string
    ) => {
      const { receiveAmount, receiveCurrency, sendCurrency } = getValues();

      const fromCurrency = overrideFromCurrency ?? receiveCurrency;
      const toCurrency = overrideToCurrency ?? sendCurrency;
      const rawAmount = overrideAmount ?? receiveAmount;
      const numericAmount = Number(rawAmount ?? "");

      if (
        !fromCurrency ||
        !toCurrency ||
        !Number.isFinite(numericAmount) ||
        numericAmount <= 0
      ) {
        setSendAmount("");
        return;
      }

      calculateRate.mutate(
        {
          fromCurrency,
          toCurrency,
          amount: numericAmount,
        },
        {
          onSuccess: (response) => {
            const data = response.data;
            if (!data) return;

            if (Number.isFinite(data.convertedAmount)) {
              setSendAmount(data.convertedAmount.toString());
            }

            if (Number.isFinite(data.sellRate)) {
              const label = `${fromCurrency}1 - ${data.sellRate} ${toCurrency}`;
              setDisplayRate(label);
              setExchangeRateLabel?.(label);
            }
          },
        }
      );
    },
    [calculateRate, getValues, setSendAmount, setExchangeRateLabel]
  );

  return {
    displayRate,
    recalculate,
    isCalculating: calculateRate.isPending,
  };
}
