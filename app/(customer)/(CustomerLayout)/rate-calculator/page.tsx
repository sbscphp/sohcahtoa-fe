"use client";

import { useMemo, useState } from "react";
import CurrencyAmountInput from "@/app/(customer)/_components/forms/CurrencyAmountInput";
import { CURRENCIES, getCurrencyByCode } from "@/app/(customer)/_lib/currency";
import { HugeiconsIcon } from "@hugeicons/react";
import { CoinsSwapFreeIcons } from "@hugeicons/core-free-icons";
import {
  PaginatedTable,
  type PaginatedTableColumn,
} from "@/app/(customer)/_components/common";
import { useFetchData } from "@/app/_lib/api/hooks";
import { customerApi } from "@/app/(customer)/_services/customer-api";
import { customerKeys } from "@/app/_lib/api/query-keys";
import type { TransactionRate } from "@/app/_lib/api/types";
import { useTransactionRateCalculator } from "@/app/(customer)/_hooks/use-transaction-rate";
import { Loader2 } from "lucide-react";

export interface CurrencyRateRow {
  id: string;
  currencyName: string;
  code: string;
  weBuyAt: string;
  weSellAt: string;
  lastUpdated: string;
}

function formatUpdatedAt(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function toRateRows(rates: TransactionRate[]): CurrencyRateRow[] {
  return rates.map((r) => {
    const from = getCurrencyByCode(r.fromCurrency);
    const to = getCurrencyByCode(r.toCurrency);
    return {
      id: r.id,
      currencyName: `${from?.name ?? r.fromCurrency} → ${to?.name ?? r.toCurrency}`,
      code: `${r.fromCurrency}/${r.toCurrency}`,
      weBuyAt: `${r.buyRate} ${r.toCurrency} / 1 ${r.fromCurrency}`,
      weSellAt: `${r.sellRate} ${r.toCurrency} / 1 ${r.fromCurrency}`,
      lastUpdated: formatUpdatedAt(r.validFrom),
    };
  });
}

export default function RateCalculatorPage() {
  const [receiveAmount, setReceiveAmount] = useState("1000");
  const [receiveCurrency, setReceiveCurrency] = useState("USD");
  const [sendCurrency, setSendCurrency] = useState("NGN");
  const [sendAmount, setSendAmount] = useState("");

  const { displayRate, recalculate, isCalculating } = useTransactionRateCalculator({
    getValues: () => ({
      receiveAmount,
      receiveCurrency,
      sendAmount,
      sendCurrency,
    }),
    setSendAmount,
    defaultLabel: "USD1 - NGN1500",
  });

  const handleSwap = () => {
    const nextReceiveAmount = sendAmount;
    const nextReceiveCurrency = sendCurrency;
    const nextSendCurrency = receiveCurrency;

    setReceiveAmount(nextReceiveAmount);
    setReceiveCurrency(nextReceiveCurrency);
    setSendCurrency(nextSendCurrency);
    // Recalculate after swapping using new values
    recalculate(nextReceiveAmount, nextReceiveCurrency, nextSendCurrency);
  };

  const { data: ratesResponse } = useFetchData(
    [...customerKeys.transactions.all, "rates"],
    () => customerApi.transactionRates.list(),
    true
  );

  const rateRows = useMemo(
    () => toRateRows(((ratesResponse as any)?.data ?? []) as TransactionRate[]),
    [ratesResponse]
  );

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
      {/* Rate calculator block */}
      <div className="bg-white rounded-2xl md:p-8 p-2 w-full md:max-w-[800px] mx-auto space-y-4">
     <div>
     <div className="flex flex-col items-center p-6 gap-6 w-full bg-[#F9F9F9] rounded-t-3xl">
          <CurrencyAmountInput
            label="From"
            value={receiveAmount}
            onChange={(v) => {
              setReceiveAmount(v);
              recalculate(v);
            }}
            currency={getCurrencyByCode(receiveCurrency) ?? CURRENCIES[0]}
            currencies={CURRENCIES}
            onCurrencyChange={(c) => {
              const code = c?.code ?? CURRENCIES[0].code;
              setReceiveCurrency(code);
              recalculate(undefined, code);
            }}
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
              value={sendAmount}
              onChange={(v) => setSendAmount(v)}
              currency={getCurrencyByCode(sendCurrency) ?? CURRENCIES[0]}
              currencies={CURRENCIES}
              onCurrencyChange={(c) => {
                const code = c?.code ?? CURRENCIES[0].code;
                setSendCurrency(code);
                recalculate(undefined, undefined, code);
              }}
              placeholder="0"
              disabled
            />
          </div>
          <div className="flex flex-row justify-between items-center py-4 px-6 gap-6 w-full min-h-[56px] bg-black rounded-b-3xl">
            <span className="font-normal text-base leading-6 text-white">
              Exchange Rate
            </span>
            <span className="font-normal text-base leading-6 text-white">
              {isCalculating ? <Loader2 className="animate-spin" /> : displayRate}
            </span>
          </div>
        </div>
     </div>
    

      {/* Currency exchange table */}
      <div className="space-y-2">
        <h2 className="text-primary-400 text-lg font-semibold">
          Currency Exchange
        </h2>
        <p className="text-body-text-200 text-sm">
          List of other currency exchange based on your FX transaction
        </p>
        <PaginatedTable<CurrencyRateRow>
          data={rateRows}
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
