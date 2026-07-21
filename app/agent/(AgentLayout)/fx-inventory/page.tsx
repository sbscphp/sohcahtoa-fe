"use client";

import { useMemo, useState } from "react";
import { Group, Select } from "@mantine/core";
import { ListFilter } from "lucide-react";
import { CurrencySelectorWithSearch } from "@/app/agent/(AgentLayout)/rate-calculator/_components/CurrencySelectorWithSearch";
import {
  CURRENCIES,
  formatCurrencyAmount,
  getCurrencyByCode,
  type Currency,
} from "@/app/(customer)/_lib/currency";
import { useFetchData } from "@/app/_lib/api/hooks";
import { agentKeys } from "@/app/_lib/api/query-keys";
import type { AgentDashboardCashStatsPeriod } from "@/app/_lib/api/types";
import { agentApi } from "@/app/agent/_services/agent-api";
import {
  AGENT_DASHBOARD_PERIOD_OPTIONS,
  DEFAULT_AGENT_DASHBOARD_PERIOD,
} from "@/app/agent/_lib/dashboard-period";
import { SummaryCards } from "./_components/SummaryCards";
import { CashInventoryTable } from "./_components/CashInventoryTable";
import { SELECT_WIDTH } from "../../utils/constants";

const EMPTY_SUMMARY = {
  cashReceivedFromCustomer: "—",
  cashReceivedFromAdmin: "—",
  cashDisbursedToAgent: "—",
  cashDisbursed: "—",
} as const;

export default function FXInventoryPage() {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(
    getCurrencyByCode("NGN") ?? CURRENCIES[0],
  );
  const [period, setPeriod] = useState<AgentDashboardCashStatsPeriod>(
    DEFAULT_AGENT_DASHBOARD_PERIOD,
  );

  const statsQueryKey = useMemo(
    () =>
      agentKeys.dashboard.cashStats(period, selectedCurrency.code) as unknown as unknown[],
    [period, selectedCurrency.code],
  );

  const { data: cashStatsData, isLoading: statsLoading } = useFetchData(
    statsQueryKey,
    () => agentApi.dashboard.cashStats(period, selectedCurrency.code),
    true,
  );

  const stats = cashStatsData?.data;
  const currencyCode = stats?.currency ?? selectedCurrency.code;

  const summary = useMemo(() => {
    if (!stats) return EMPTY_SUMMARY;

    return {
      cashReceivedFromCustomer: formatCurrencyAmount(
        stats.totalCashDisbursedFromCustomer,
        currencyCode,
      ),
      cashReceivedFromAdmin: formatCurrencyAmount(
        stats.totalCashDisbursedFromAdmin,
        currencyCode,
      ),
      cashDisbursedToAgent: formatCurrencyAmount(
        stats.totalCashDisbursedToAgent,
        currencyCode,
      ),
      cashDisbursed: formatCurrencyAmount(stats.totalCashDisbursed, currencyCode),
    };
  }, [stats, currencyCode]);

  return (
    <div className="space-y-6">
      <Group justify="flex-end" gap="md">
        <CurrencySelectorWithSearch
          selectedCurrency={selectedCurrency}
          onCurrencyChange={setSelectedCurrency}
        />
        <Select
          size="sm"
          w={SELECT_WIDTH}
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
      </Group>

      <SummaryCards {...summary} isLoading={statsLoading} />

      <CashInventoryTable />
    </div>
  );
}
