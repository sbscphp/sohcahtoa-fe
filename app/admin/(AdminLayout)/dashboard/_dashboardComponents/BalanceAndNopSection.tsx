"use client";

import { useMemo, useState } from "react";
import { Alert, Skeleton } from "@mantine/core";
import { ArrowLeftRight, ArrowUp } from "lucide-react";
import CurrencySelector from "@/app/admin/_components/CurrencySelector";
import { CURRENCIES } from "@/app/admin/_lib/constants";
import { formatCurrency } from "@/app/utils/helper/formatCurrency";
import { useUnsettledBalance } from "../hooks/useUnsettledBalance";
import { NOP_BADGE_STYLES } from "../nopCompliance";

type CurrencyCode = (typeof CURRENCIES)[number]["code"];

function BalanceAndNopSectionSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <Skeleton circle height={44} width={44} />
        <div className="flex-1 space-y-2">
          <Skeleton height={14} width={90} radius="sm" />
          <Skeleton height={22} width={160} radius="sm" />
        </div>
      </div>

      <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <Skeleton height={40} width={40} radius="lg" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton height={14} width={220} radius="sm" />
          <Skeleton height={22} width={180} radius="sm" />
        </div>
        <Skeleton height={24} width={52} radius="xl" />
      </div>
    </div>
  );
}

export function BalanceAndNopSection() {
  const {
    currencyCodes,
    balancesByCurrency,
    totalNopNgn,
    utilizationPercent,
    colorStatus,
    defaultCurrency,
    isLoading,
    isFetching,
    isError,
    error,
  } = useUnsettledBalance();

  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>("NGN");

  const activeCurrency = useMemo(() => {
    if (currencyCodes.includes(selectedCurrency)) return selectedCurrency;
    return defaultCurrency ?? selectedCurrency;
  }, [currencyCodes, defaultCurrency, selectedCurrency]);

  if (isLoading) {
    return <BalanceAndNopSectionSkeleton />;
  }

  const badgeStyles = NOP_BADGE_STYLES[colorStatus];
  const balance = balancesByCurrency[activeCurrency] ?? 0;
  const isRefetching = isFetching && !isLoading;

  return (
    <div className="space-y-3">
      {isError && (
        <Alert title="Balance data could not be loaded" color="red">
          {error?.message ?? "Something went wrong. Try refreshing the page."}
        </Alert>
      )}

      <div
        className={`grid grid-cols-1 gap-4 lg:grid-cols-2 ${isRefetching ? "opacity-70 transition-opacity" : ""}`}
      >
        {/* Total Balance */}
        <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <CurrencySelector
            currencyCodes={currencyCodes}
            value={activeCurrency}
            onChange={setSelectedCurrency}
            disabled={currencyCodes.length === 0}
          />
          <div>
            <p className="text-sm text-gray-500">Total Transactions (Value)</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(balance, activeCurrency)}
            </p>
          </div>
        </div>

        {/* Net Open Position */}
        <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
            <ArrowLeftRight className="h-5 w-5 text-blue-600" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm text-gray-500">
              Net Open Position (30% of Shareholder funds)
            </p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(totalNopNgn, "NGN")}
            </p>
          </div>

          <div
            className={`ml-auto flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${badgeStyles.bg} ${badgeStyles.text}`}
          >
            <ArrowUp className="h-3 w-3" aria-hidden />
            <span>{utilizationPercent}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
