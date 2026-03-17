"use client";

import { useCallback, useState } from "react";
import { useCreateData } from "@/app/_lib/api/hooks";
import { customerApi } from "@/app/(customer)/_services/customer-api";

export interface TransactionRateFormSlice {
  receiveAmount: string;
  receiveCurrency: string;
  sendAmount: string;
  sendCurrency: string;
  exchangeRate?: string;
}

interface UseTransactionRateCalculatorOptions {
  getValues: () => TransactionRateFormSlice;
  setSendAmount: (value: string) => void;
  setExchangeRateLabel?: (label: string) => void;
  defaultLabel?: string;
}

export function useTransactionRateCalculator({
  getValues,
  setSendAmount,
  setExchangeRateLabel,
  defaultLabel = "USD1 - NGN1500",
}: UseTransactionRateCalculatorOptions) {
  const [displayRate, setDisplayRate] = useState(defaultLabel);
  const calculateRate = useCreateData(customerApi.transactionRates.calculate);

  const recalculate = useCallback(
    (overrideAmount?: string, overrideFromCurrency?: string, overrideToCurrency?: string) => {
      const { receiveAmount, receiveCurrency, sendCurrency } = getValues();

      const fromCurrency = overrideFromCurrency ?? receiveCurrency;
      const toCurrency = overrideToCurrency ?? sendCurrency;
      const rawAmount = overrideAmount ?? receiveAmount;
      const numericAmount = Number(rawAmount ?? "");

      if (!fromCurrency || !toCurrency || !Number.isFinite(numericAmount) || numericAmount <= 0) {
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
            const data = (response as any).data;
            if (!data) return;

            const converted = data.convertedAmount as number;
            const sellRate = data.sellRate as number;

            if (Number.isFinite(converted)) {
              setSendAmount(converted.toString());
            }

            if (Number.isFinite(sellRate)) {
              const label = `${fromCurrency}1 - ${sellRate} ${toCurrency}`;
              setDisplayRate(label);
              setExchangeRateLabel?.(label);
            }
          },
        },
      );
    },
    [calculateRate, getValues, setSendAmount, setExchangeRateLabel],
  );

  return {
    displayRate,
    recalculate,
    isCalculating: calculateRate.isPending,
  };
}

