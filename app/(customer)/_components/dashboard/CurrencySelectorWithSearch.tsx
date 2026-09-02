"use client";

import CurrencySelector from "@/app/(customer)/_components/dashboard/CurrencySelector";
import type { Currency } from "@/app/(customer)/_lib/currency";

interface CurrencySelectorWithSearchProps {
  selectedCurrency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  currencies?: readonly Currency[];
}

/**
 * Agent-facing alias for the compact dashboard currency pill.
 * Kept for existing imports; search is not needed for the short currency list.
 */
export function CurrencySelectorWithSearch({
  selectedCurrency,
  onCurrencyChange,
  currencies,
}: CurrencySelectorWithSearchProps) {
  return (
    <CurrencySelector
      value={selectedCurrency.code}
      onChange={onCurrencyChange}
      currencies={currencies}
    />
  );
}
