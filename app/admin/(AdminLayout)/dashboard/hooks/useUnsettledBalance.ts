"use client";

import { useMemo } from "react";
import type { ApiResponse } from "@/app/_lib/api/client";
import { useFetchData } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import { CURRENCIES } from "@/app/admin/_lib/constants";
import {
  adminApi,
  type AdminUnsettledBalanceData,
} from "@/app/admin/_services/admin-api";
import {
  getUnsettledNopUtilization,
  mapApiColorToStatus,
  type NopComplianceStatus,
} from "../nopCompliance";

type CurrencyCode = (typeof CURRENCIES)[number]["code"];

const KNOWN_CURRENCY_CODES = new Set<string>(
  CURRENCIES.map((currency) => currency.code)
);

function isKnownCurrencyCode(code: string): code is CurrencyCode {
  return KNOWN_CURRENCY_CODES.has(code);
}

function pickDefaultCurrency(currencyCodes: CurrencyCode[]): CurrencyCode | null {
  if (currencyCodes.length === 0) return null;
  if (currencyCodes.includes("NGN")) return "NGN";
  return currencyCodes[0];
}

export function useUnsettledBalance() {
  const query = useFetchData<ApiResponse<AdminUnsettledBalanceData>>(
    [...adminKeys.transactions.unsettledBalance()],
    () => adminApi.transactions.getUnsettledBalance(),
    true
  );

  const raw = query.data?.data ?? null;

  const mapped = useMemo(() => {
    if (!raw) {
      return {
        currencyCodes: [] as CurrencyCode[],
        balancesByCurrency: {} as Record<CurrencyCode, number>,
        totalNopNgn: 0,
        comparisonLimit: 0,
        utilizationPercent: 0,
        colorStatus: "green" as NopComplianceStatus,
        defaultCurrency: null as CurrencyCode | null,
      };
    }

    const currencyCodes = raw.breakdown
      .map((item) => item.currency?.trim().toUpperCase())
      .filter((code): code is CurrencyCode => Boolean(code) && isKnownCurrencyCode(code));

    const balancesByCurrency = raw.breakdown.reduce<Record<CurrencyCode, number>>(
      (acc, item) => {
        const code = item.currency?.trim().toUpperCase();
        if (code && isKnownCurrencyCode(code)) {
          acc[code] = item.totalForeignAmount ?? 0;
        }
        return acc;
      },
      {} as Record<CurrencyCode, number>
    );

    const utilizationPercent = getUnsettledNopUtilization(
      raw.totalUnsettledNairaBalance,
      raw.comparisonLimit
    );

    const colorStatus = mapApiColorToStatus(raw.color, utilizationPercent);

    return {
      currencyCodes,
      balancesByCurrency,
      totalNopNgn: raw.totalUnsettledNairaBalance ?? 0,
      comparisonLimit: raw.comparisonLimit ?? 0,
      utilizationPercent,
      colorStatus,
      defaultCurrency: pickDefaultCurrency(currencyCodes),
    };
  }, [raw]);

  return {
    ...mapped,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
  };
}
