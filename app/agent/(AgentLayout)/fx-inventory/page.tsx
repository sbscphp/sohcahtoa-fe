"use client";

import { useMemo, useState } from "react";
import { Group, Select } from "@mantine/core";
import { CurrencySelectorWithSearch } from "@/app/agent/(AgentLayout)/rate-calculator/_components/CurrencySelectorWithSearch";
import {
  CURRENCIES,
  getCurrencyByCode,
  type Currency,
} from "@/app/(customer)/_lib/currency";
import { useFetchData } from "@/app/_lib/api/hooks";
import { agentKeys } from "@/app/_lib/api/query-keys";
import type { AgentDashboardCashStatsResponse } from "@/app/_lib/api/types";
import { agentApi } from "@/app/agent/_services/agent-api";
import { SummaryCards } from "./_components/SummaryCards";
import { CashInventoryTable } from "./_components/CashInventoryTable";
import { SELECT_WIDTH } from "../../utils/constants";
import { dateRangeLabelToCashStatsPeriod, formatNgnAmount } from "./_lib/format-inventory";

export default function FXInventoryPage() {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(
    getCurrencyByCode("USD") ?? CURRENCIES[0],
  );
  const [dateRange, setDateRange] = useState("last 3 months");

  const period = useMemo(() => dateRangeLabelToCashStatsPeriod(dateRange), [dateRange]);

  const statsQueryKey = useMemo(
    () => agentKeys.dashboard.cashStats(period) as unknown as unknown[],
    [period]
  );

  const { data: cashStatsData, isLoading: statsLoading } = useFetchData(
    statsQueryKey,
    () => agentApi.dashboard.cashStats(period),
    true
  );

  const stats = cashStatsData as AgentDashboardCashStatsResponse | undefined;
  const s = stats?.data;
  const currencyCode = s?.currency ?? "NGN";

  const summary = useMemo(() => {
    if (!s) {
      return {
        cashReceivedFromCustomer: "—",
        cashReceivedFromAdmin: "—",
        cashDisbursed: "—",
      };
    }
    return {
      cashReceivedFromCustomer: formatNgnAmount(
        s.totalCashReceivedFromCustomer,
        currencyCode
      ),
      cashReceivedFromAdmin: formatNgnAmount(
        s.totalCashReceivedFromAdmin,
        currencyCode
      ),
      cashDisbursed: formatNgnAmount(s.totalCashDisbursed, currencyCode),
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
          placeholder="Date: last 3 months"
          data={[
            "last 7 days",
            "last 30 days",
            "last 3 months",
            "last 6 months",
            "last year",
          ]}
          value={dateRange}
          onChange={(v) => setDateRange(v || "last 3 months")}
          size="sm"
          w={SELECT_WIDTH}
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
