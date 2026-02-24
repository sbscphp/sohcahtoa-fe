"use client";

import { useState, useMemo } from "react";
import CurrencyAmountInput from "@/app/(customer)/_components/forms/CurrencyAmountInput";
import { CURRENCIES, getCurrencyByCode } from "@/app/(customer)/_lib/currency";
import { HugeiconsIcon } from "@hugeicons/react";
import { CoinsSwapFreeIcons } from "@hugeicons/core-free-icons";
import {
  PaginatedTable,
  type PaginatedTableColumn,
} from "@/app/(customer)/_components/common";

// Simplified rate map: from USD to other (rate = units of second per 1 USD). NGN 1500 per 1 USD, etc.
const RATE_PER_USD: Record<string, number> = {
  NGN: 1500,
  EUR: 0.92,
  GBP: 0.79,
};

function getRate(fromCode: string, toCode: string): number {
  if (fromCode === toCode) return 1;
  if (fromCode === "USD" && RATE_PER_USD[toCode]) return RATE_PER_USD[toCode];
  if (toCode === "USD" && RATE_PER_USD[fromCode]) return 1 / RATE_PER_USD[fromCode];
  // Fallback USD-NGN for any pair
  return fromCode === "USD" ? 1500 : 1 / 1500;
}

function formatRate(fromCode: string, toCode: string): string {
  const rate = getRate(fromCode, toCode);
  return `${fromCode}1 - ${toCode}${rate >= 1 ? Math.round(rate).toLocaleString() : rate.toFixed(4)}`;
}

export interface CurrencyRateRow {
  id: string;
  currencyName: string;
  code: string;
  weBuyAt: string;
  weSellAt: string;
  lastUpdated: string;
}

const MOCK_RATES: CurrencyRateRow[] = [
  {
    id: "1",
    currencyName: "US Dollar",
    code: "USD",
    weBuyAt: "₦1,450 / $1",
    weSellAt: "₦1,450 / $1",
    lastUpdated: "12 Sep 2025, 11:00 am",
  },
  {
    id: "2",
    currencyName: "Nigerian Naira",
    code: "NGN",
    weBuyAt: "₦1,750 / £1",
    weSellAt: "₦1,750 / £1",
    lastUpdated: "13 Sep 2025, 1:30 pm",
  },
  {
    id: "3",
    currencyName: "Euro",
    code: "EUR",
    weBuyAt: "₦1,615 / €1",
    weSellAt: "₦1,615 / €1",
    lastUpdated: "14 Sep 2025, 3:45 pm",
  },
];

export default function RateCalculatorPage() {
  const [fromAmount, setFromAmount] = useState("1000");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("NGN");

  const rate = useMemo(
    () => getRate(fromCurrency, toCurrency),
    [fromCurrency, toCurrency]
  );
  const toAmount = useMemo(() => {
    const num = parseFloat(fromAmount.replace(/,/g, ""));
    if (Number.isNaN(num)) return "";
    const result = num * rate;
    return result >= 1 ? Math.round(result).toLocaleString() : result.toFixed(4);
  }, [fromAmount, rate]);

  const handleSwap = () => {
    setFromAmount(toAmount.replace(/,/g, ""));
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const exchangeRateDisplay = formatRate(fromCurrency, toCurrency);

  const columns: PaginatedTableColumn<CurrencyRateRow>[] = [
    {
      key: "currencyName",
      label: "Currency Name",
      render: (row) => (
        <span className="text-[#4D4B4B]">
          {row.currencyName} ({row.code})
        </span>
      ),
    },
    { key: "weBuyAt", label: "We buy at", render: (row) => row.weBuyAt },
    { key: "weSellAt", label: "We sell at", render: (row) => row.weSellAt },
    { key: "lastUpdated", label: "Last Updated", render: (row) => row.lastUpdated },
  ];

  return (
    <div className="space-y-8">
      {/* Rate calculator block + Currency exchange in same card */}
      <div className="bg-white rounded-2xl md:p-8 p-2 w-full md:max-w-[800px] mx-auto space-y-4">
        <div>
          <div className="flex flex-col items-center p-6 gap-6 w-full bg-[#F9F9F9] rounded-t-3xl">
            <CurrencyAmountInput
              label="From"
              value={fromAmount}
              onChange={setFromAmount}
              currency={getCurrencyByCode(fromCurrency) ?? CURRENCIES[0]}
              currencies={CURRENCIES}
              onCurrencyChange={(c) => setFromCurrency(c.code)}
              placeholder="0"
            />
          </div>

          <div className="flex justify-center -my-4 relative z-10">
            <button
              type="button"
              onClick={handleSwap}
              className="w-12 h-12 rounded-full bg-black hover:bg-gray-800 flex items-center justify-center transition-colors shadow-md"
              aria-label="Swap currencies"
            >
              <HugeiconsIcon
                icon={CoinsSwapFreeIcons}
                size={24}
                className="text-white"
              />
            </button>
          </div>

          <div className="flex flex-col w-full">
            <div className="flex flex-col items-center p-6 gap-6 w-full bg-[#F9F9F9] rounded-t-3xl">
              <CurrencyAmountInput
                label="To"
                value={toAmount}
                onChange={(v) => {
                  const num = parseFloat(v.replace(/,/g, ""));
                  if (Number.isNaN(num)) return;
                  const back = rate ? num / rate : 0;
                  setFromAmount(back >= 1 ? Math.round(back).toString() : back.toFixed(4));
                }}
                currency={getCurrencyByCode(toCurrency) ?? CURRENCIES[0]}
                currencies={CURRENCIES}
                onCurrencyChange={(c) => setToCurrency(c.code)}
                placeholder="0"
              />
            </div>
            <div className="flex flex-row justify-between items-center py-4 px-6 gap-6 w-full min-h-[56px] bg-black rounded-b-3xl">
              <span className="font-normal text-base leading-6 text-white">
                Exchange Rate
              </span>
              <span className="font-normal text-base leading-6 text-white">
                {exchangeRateDisplay}
              </span>
            </div>
          </div>
        </div>

        {/* Currency exchange table - inside same card */}
        <div className="space-y-2">
          <h2 className="text-primary-400 text-lg font-semibold">
            Currency Exchange
          </h2>
          <p className="text-body-text-200 text-sm">
            List of other currency exchange based on your FX transaction
          </p>
          <PaginatedTable<CurrencyRateRow>
            data={MOCK_RATES}
            columns={columns}
            pageSize={10}
            keyExtractor={(row) => row.id}
            emptyMessage="No rates available"
          />
        </div>
      </div>
    </div>
  );
}
