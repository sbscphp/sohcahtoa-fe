"use client";

import { useState } from "react";
import { ArrowLeftRight, ArrowUp } from "lucide-react";
import CurrencySelector from "@/app/admin/_components/CurrencySelector";
import { CURRENCIES } from "@/app/admin/_lib/constants";
import { formatCurrency } from "@/app/utils/helper/formatCurrency";
import {
  DUMMY_BALANCES_BY_CURRENCY,
  DUMMY_NOP_NGN,
} from "../dashboardDummyData";
import {
  getNopCompliance,
  NOP_BADGE_STYLES,
} from "../nopCompliance";

type CurrencyCode = (typeof CURRENCIES)[number]["code"];

export function BalanceAndNopSection() {
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>("USD");

  const balance = DUMMY_BALANCES_BY_CURRENCY[selectedCurrency] ?? 0;
  const { status, utilizationPercent } = getNopCompliance(DUMMY_NOP_NGN);
  const badgeStyles = NOP_BADGE_STYLES[status];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Total Balance */}
      <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <CurrencySelector
          value={selectedCurrency}
          onChange={setSelectedCurrency}
        />
        <div>
          <p className="text-sm text-gray-500">Total Balance</p>
          <p className="text-lg font-semibold text-gray-900">
            {formatCurrency(balance, selectedCurrency)}
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
            {formatCurrency(DUMMY_NOP_NGN, "NGN")}
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
  );
}
