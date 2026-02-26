"use client";

import { useState, useMemo } from "react";
import { Menu, TextInput } from "@mantine/core";
import { Search, ChevronDown } from "lucide-react";
import Image from "next/image";
import {
  CURRENCIES,
  getCurrencyByCode,
  type Currency,
} from "@/app/(customer)/_lib/currency";
import { getCurrencyFlagUrl } from "@/app/(customer)/_lib/currency";

interface CurrencySelectorWithSearchProps {
  selectedCurrency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  currencies?: readonly Currency[];
}

export function CurrencySelectorWithSearch({
  selectedCurrency,
  onCurrencyChange,
  currencies = CURRENCIES,
}: CurrencySelectorWithSearchProps) {
  const [search, setSearch] = useState("");

  const filteredCurrencies = useMemo(() => {
    if (!search.trim()) return currencies;
    const q = search.toLowerCase().trim();
    return currencies.filter(
      (currency) =>
        currency.code.toLowerCase().includes(q) ||
        currency.name.toLowerCase().includes(q),
    );
  }, [search, currencies]);

  return (
    <Menu
      shadow="md"
      width={320}
      position="bottom-start"
      withArrow
      closeOnItemClick
    >
      <Menu.Target>
        <button
          type="button"
          className="flex items-center gap-2 px-3 py-2 border border-gray-200  bg-black text-white hover:bg-gray-500 transition-colors rounded-3xl"
        >
          <Image
            src={getCurrencyFlagUrl(selectedCurrency.code) ?? ""}
            alt={selectedCurrency.name}
            width={24}
            height={24}
            className="rounded-full"
          />
          <span className="font-medium text-sm">{selectedCurrency.code}</span>
          <ChevronDown size={16} className="text-gray-400" />
        </button>
      </Menu.Target>

      <Menu.Dropdown>
        <div className="p-2">
          <TextInput
            placeholder="Search"
            // leftSection={<Search size={16} className="text-orange-500" />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            size="sm"
            radius="md"
            className="mb-2"
          />
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {filteredCurrencies.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              No currencies found
            </div>
          ) : (
            filteredCurrencies.map((currency) => (
              <Menu.Item
                key={currency.code}
                onClick={() => {
                  onCurrencyChange(currency);
                  setSearch("");
                }}
                className={
                  selectedCurrency.code === currency.code
                    ? "bg-primary-50"
                    : undefined
                }
              >
                <div className="flex items-center gap-3">
                  <Image
                    src={getCurrencyFlagUrl(currency.code) ?? ""}
                    alt={currency.name}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{currency.code}</div>
                    <div className="text-xs text-gray-500">{currency.name}</div>
                  </div>
                </div>
              </Menu.Item>
            ))
          )}
        </div>
      </Menu.Dropdown>
    </Menu>
  );
}
