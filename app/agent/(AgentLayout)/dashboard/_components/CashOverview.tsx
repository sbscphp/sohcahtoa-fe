"use client";

import { useMemo, useState } from "react";
import { Eye, EyeOff, ListFilter } from "lucide-react";
import { Select, Skeleton } from "@mantine/core";
import { IconWallet, IconWalletAdd, IconRecieve } from "@/components/icons";
import { formatCurrency } from "@/app/(customer)/_lib/currency";
import SectionCard from "@/app/(customer)/_components/dashboard/SectionCard";
import FxActionButton from "@/app/(customer)/_components/dashboard/FxActionButton";
import { CurrencySelectorWithSearch } from "@/app/agent/(AgentLayout)/rate-calculator/_components/CurrencySelectorWithSearch";
import {
  CURRENCIES,
  getCurrencyByCode,
  type Currency,
} from "@/app/(customer)/_lib/currency";
import { useRouter } from "next/navigation";
import { SELECT_WIDTH } from "@/app/agent/utils/constants";
import { useFetchData } from "@/app/_lib/api/hooks";
import { agentKeys } from "@/app/_lib/api/query-keys";
import type { AgentDashboardCashStatsPeriod } from "@/app/_lib/api/types";
import { agentApi } from "@/app/agent/_services/agent-api";
import {
  AGENT_DASHBOARD_PERIOD_OPTIONS,
  DEFAULT_AGENT_BALANCE_PERIOD,
} from "@/app/agent/_lib/dashboard-period";

type BalanceMetric = {
  label: string;
  value: number | null | undefined;
  bordered?: boolean;
};

function formatAmountDisplay(
  amount: number | null | undefined,
  currencyCode: string,
  visible: boolean
): { symbol: string; whole: string; fraction: string; formatted: string } {
  if (!visible) {
    return {
      symbol: "•",
      whole: "••••••••",
      fraction: "••",
      formatted: "••••••••",
    };
  }
  if (amount == null || Number.isNaN(Number(amount))) {
    return { symbol: "—", whole: "—", fraction: "00", formatted: "—" };
  }
  const { symbol, value, formatted } = formatCurrency(Number(amount), currencyCode);
  const [whole, fraction = "00"] = value.split(".");
  return { symbol, whole, fraction, formatted };
}

type CashOverviewContentProps = {
  amountVisible: boolean;
  onToggleVisible: () => void;
  currencyCode: string;
  currentBalance: number | null | undefined;
  metrics: BalanceMetric[];
  isLoading: boolean;
};

function CashOverviewContent({
  amountVisible,
  onToggleVisible,
  currencyCode,
  currentBalance,
  metrics,
  isLoading,
}: CashOverviewContentProps) {
  const { symbol, whole, fraction } = formatAmountDisplay(
    currentBalance,
    currencyCode,
    amountVisible
  );
  const router = useRouter();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col justify-center gap-2.5">
        <p className="text-sm text-gray-600">Current Balance</p>
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {isLoading ? (
            <Skeleton height={36} width={220} radius="sm" />
          ) : (
            <>
              <span className="flex h-8 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-base font-medium leading-[120%] text-gray-900">
                {symbol}
              </span>
              <span className="min-w-0 break-all text-2xl font-bold leading-[120%] text-gray-900 sm:text-3xl">
                {whole}
                <span className="text-sm font-semibold leading-[120%] text-gray-900">
                  .{fraction}
                </span>
              </span>
              <button
                type="button"
                onClick={onToggleVisible}
                className="text-gray-900 hover:opacity-70"
                aria-label={amountVisible ? "Hide amount" : "Show amount"}
              >
                {amountVisible ? (
                  <Eye className="size-5" />
                ) : (
                  <EyeOff className="size-5" />
                )}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 py-3 lg:grid-cols-2 xl:grid-cols-3">
        {metrics.map((option) => (
          <div
            className={`space-y-2 ${option.bordered ? "border-x-2 border-gray-200 px-2" : ""}`}
            key={option.label}
          >
            <p className="text-sm text-gray-600">{option.label}</p>
            {isLoading ? (
              <Skeleton height={28} width={160} radius="sm" />
            ) : (
              <p className="text-xl font-bold text-black">
                {formatAmountDisplay(option.value, currencyCode, amountVisible).formatted}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-5">
        <FxActionButton
          icon={<IconWallet className="size-5 text-gray-900" />}
          label="Buy FX"
          onClick={() => router.push("/agent/transactions/new/buy")}
        />
        <FxActionButton
          icon={<IconWalletAdd className="size-5 text-gray-900" />}
          label="Sell FX"
          onClick={() => router.push("/agent/transactions/new/sell")}
        />
        <FxActionButton
          icon={<IconRecieve className="size-5 text-gray-900" />}
          label="Receive money"
          onClick={() => router.push("/agent/transactions/new/receive")}
        />
      </div>
    </div>
  );
}

export function CashOverview() {
  const [amountVisible, setAmountVisible] = useState(true);
  const [currency, setCurrency] = useState<Currency>(
    getCurrencyByCode("NGN") ?? CURRENCIES[0],
  );
  const [period, setPeriod] = useState<AgentDashboardCashStatsPeriod>(
    DEFAULT_AGENT_BALANCE_PERIOD,
  );

  const balanceQueryKey = useMemo(
    () => agentKeys.dashboard.balance(period, currency.code) as unknown as unknown[],
    [period, currency.code],
  );

  const { data: balanceResponse, isLoading } = useFetchData(
    balanceQueryKey,
    () => agentApi.dashboard.balance(period, currency.code),
    true,
  );

  const balance = balanceResponse?.data;
  const currencyCode = balance?.currency ?? currency.code;

  const metrics: BalanceMetric[] = useMemo(
    () => [
      { label: "Opening Balance", value: balance?.openingBalance },
      {
        label: "Total Cash Received",
        value: balance?.totalReceived,
        bordered: true,
      },
      { label: "Amount Disbursed", value: balance?.totalDisbursed },
    ],
    [balance?.openingBalance, balance?.totalDisbursed, balance?.totalReceived],
  );

  return (
    <SectionCard className="rounded-2xl p-4">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-5">
          <div className="min-w-0 shrink-0">
            <h3 className="text-body-heading-300 text-lg font-medium sm:text-xl">
              Cash Overview
            </h3>
          </div>
          <div className="flex min-w-0 w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
            <CurrencySelectorWithSearch
              selectedCurrency={currency}
              onCurrencyChange={setCurrency}
            />
            <Select
              size="xs"
              w={{ base: "100%", sm: SELECT_WIDTH }}
              className="custom-select min-w-0"
              data={AGENT_DASHBOARD_PERIOD_OPTIONS.map((o) => ({
                value: o.value,
                label: o.label,
              }))}
              value={period}
              onChange={(v) => {
                if (v) setPeriod(v as AgentDashboardCashStatsPeriod);
              }}
              rightSection={<ListFilter className="size-4" />}
              rightSectionPointerEvents="none"
              radius="2xl"
            />
          </div>
        </div>

        <CashOverviewContent
          amountVisible={amountVisible}
          onToggleVisible={() => setAmountVisible((v) => !v)}
          currencyCode={currencyCode}
          currentBalance={balance?.currentBalance}
          metrics={metrics}
          isLoading={isLoading}
        />
      </div>
    </SectionCard>
  );
}
