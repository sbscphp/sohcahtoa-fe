"use client";

import { useMemo, useState } from "react";
import { Group, Select } from "@mantine/core";
import { ListFilter } from "lucide-react";
import { CurrencySelectorWithSearch } from "@/app/agent/(AgentLayout)/rate-calculator/_components/CurrencySelectorWithSearch";
import {
  CURRENCIES,
  getCurrencyByCode,
  type Currency,
} from "@/app/(customer)/_lib/currency";
import { useFetchData } from "@/app/_lib/api/hooks";
import { agentKeys } from "@/app/_lib/api/query-keys";
import type {
  AgentDashboardCashStatsPeriod,
  AgentDashboardCashStatsResponse,
} from "@/app/_lib/api/types";
import { agentApi } from "@/app/agent/_services/agent-api";
import {
  AGENT_DASHBOARD_PERIOD_OPTIONS,
  DEFAULT_AGENT_DASHBOARD_PERIOD,
} from "@/app/agent/_lib/dashboard-period";
import { SummaryCards } from "./_components/SummaryCards";
import { CashInventoryTable } from "./_components/CashInventoryTable";
import { SELECT_WIDTH } from "../../utils/constants";
import { formatCurrencyAmount } from "@/app/(customer)/_lib/currency";

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

  const stats = cashStatsData as AgentDashboardCashStatsResponse | undefined;
  const s = stats?.data;
  const currencyCode = s?.currency ?? selectedCurrency.code;

  const summary = useMemo(() => {
    if (!s) {
      return {
        cashReceivedFromCustomer: "—",
        cashReceivedFromAdmin: "—",
        cashDisbursed: "—",
      };
    }
    return {
      cashReceivedFromCustomer: formatCurrencyAmount(
        s.totalCashReceivedFromCustomer,
        currencyCode,
      ),
      cashReceivedFromAdmin: formatCurrencyAmount(
        s.totalCashReceivedFromAdmin,
        currencyCode,
      ),
      cashDisbursed: formatCurrencyAmount(s.totalCashDisbursed, currencyCode),
    };
  }, [s, currencyCode]);

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

      <SummaryCards
        cashReceivedFromCustomer={summary.cashReceivedFromCustomer}
        cashReceivedFromAdmin={summary.cashReceivedFromAdmin}
        cashDisbursed={summary.cashDisbursed}
        isLoading={statsLoading}
      />

      <CashInventoryTable />
    </div>
  );
}
