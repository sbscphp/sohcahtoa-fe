"use client";

import { useState } from "react";
import { Stack, Group, Select } from "@mantine/core";
import { CurrencySelectorWithSearch } from "@/app/agent/(AgentLayout)/rate-calculator/_components/CurrencySelectorWithSearch";
import { CURRENCIES, getCurrencyByCode, type Currency } from "@/app/(customer)/_lib/currency";
import { SummaryCards } from "./_components/SummaryCards";
import { BalanceSection } from "./_components/BalanceSection";
import { CashInventoryTable } from "./_components/CashInventoryTable";

export default function FXInventoryPage() {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(
    getCurrencyByCode("USD") ?? CURRENCIES[0]
  );
  const [dateRange, setDateRange] = useState("last 3 months");

  // Mock data - replace with actual API calls
  const cashReceivedFromCustomer = "$ 13,700,075";
  const cashReceivedFromAdmin = "$ 13,700,075";
  const cashDisbursed = "$ 13,700,075";
  const totalFxUnits = "67,048.00";

  return (
    <div className="space-y-6">
      {/* Header Controls */}
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
          style={{ width: 180 }}
        />
      </Group>

      {/* Summary Cards */}
      <SummaryCards
        cashReceivedFromCustomer={cashReceivedFromCustomer}
        cashReceivedFromAdmin={cashReceivedFromAdmin}
        cashDisbursed={cashDisbursed}
      />

      {/* Balance Section */}
      <BalanceSection
        totalFxUnits={totalFxUnits}
        currency={selectedCurrency}
        onCurrencyChange={setSelectedCurrency}
        onBuyFx={() => {
          // Handle buy FX action
          console.log("Buy FX clicked");
        }}
        onSellFx={() => {
          // Handle sell FX action
          console.log("Sell FX clicked");
        }}
        onReceiveMoney={() => {
          // Handle receive money action
          console.log("Receive money clicked");
        }}
      />

      {/* Cash Inventory Table */}
      <CashInventoryTable />
    </div>
  );
}
