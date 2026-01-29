"use client";

import { ChevronDown } from "lucide-react";
import Image from "next/image";
import { Menu, NumberInput } from "@mantine/core";
import {
  CURRENCIES,
  getCurrencyFlagUrl,
  getCurrencySymbol,
  type Currency,
} from "@/app/(customer)/_lib/currency";

function CurrencyFlag({ currency }: { currency: Currency }) {
  const url = getCurrencyFlagUrl(currency.code);
  if (url) {
    return (
      <Image
        src={url}
        alt={currency.name}
        title={currency.name}
        width={24}
        height={24}
        className="flex-none rounded-full object-cover bg-gray-200 w-6 h-6"
      />
    );
  }
  return (
    <span className="flex-none w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 font-medium text-xs text-gray-600">
      {currency.code.slice(0, 2)}
    </span>
  );
}

interface CurrencyAmountInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  currency: Currency;
  onCurrencyChange?: (currency: Currency) => void;
  currencies?: readonly Currency[];
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  showDropdown?: boolean;
}

export default function CurrencyAmountInput({
  label,
  value,
  onChange,
  currency,
  onCurrencyChange,
  currencies = CURRENCIES,
  error,
  placeholder = "0",
  disabled = false,
  showDropdown = true,
}: CurrencyAmountInputProps) {
  const symbol = getCurrencySymbol(currency.code);
  const list = currencies.length > 0 ? currencies : CURRENCIES;
  const canChangeCurrency = showDropdown && onCurrencyChange && list.length > 0;

  return (
    <div className="flex flex-col gap-6 w-full max-w-[688px]">
      <div className="flex flex-row items-center gap-2 w-full min-h-10">
        <span className="flex-1 min-w-0 font-medium text-base leading-6 text-[#4D4B4B]">
          {label}
        </span>

        {canChangeCurrency ? (
          <Menu shadow="md" width={200} position="bottom-end" withArrow>
            <Menu.Target>
              <button
                type="button"
                className="box-border flex flex-row items-center py-2 px-2 gap-1 h-10 min-w-[102px] bg-white border border-gray-100 rounded-full flex-none"
              >
                <CurrencyFlag currency={currency} />
                <span className="font-medium text-base leading-6 text-[#1F1E1E]">
                  {currency.code}
                </span>
                <ChevronDown
                  size={20}
                  className="flex-none text-[#8F8B8B]"
                  strokeWidth={1.67}
                />
              </button>
            </Menu.Target>
            <Menu.Dropdown className="max-h-[250px] overflow-y-auto">
              {list.map((c) => (
                <Menu.Item
                  key={c.code}
                  onClick={() => onCurrencyChange?.(c)}
                  leftSection={
                    <span className="flex items-center justify-center w-6 h-6 rounded-full overflow-hidden">
                      <CurrencyFlag currency={c} />
                    </span>
                  }
                >
                  {c.code} · {c.name}
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>
        ) : (
          <div className="box-border flex flex-row items-center py-2 px-2 gap-1 h-10 min-w-[80px] bg-white border border-gray-100 rounded-full flex-none">
            <CurrencyFlag currency={currency} />
            <span className="font-medium text-base leading-6 text-[#1F1E1E]">
              {currency.code}
            </span>
          </div>
        )}
      </div>

      <NumberInput
        value={value ? Number(value) : undefined}
        onChange={(v) => onChange(String(v ?? ""))}
        leftSection={
          <span className="font-semibold text-xl leading-7 text-[#1F1E1E]">
            {symbol}
          </span>
        }
        leftSectionWidth={36}
        placeholder={placeholder}
        disabled={disabled}
        error={error}
        decimalScale={2}
        thousandSeparator=","
        decimalSeparator="."
        min={0}
        hideControls
        classNames={{
          input:
            "h-[60px]! border! border-[#CCCACA]! rounded-lg! bg-white! font-semibold! text-xl! leading-7! text-[#1F1E1E]! shadow-[0px_1px_2px_rgba(16,24,40,0.05)]!",
        }}
        aria-label={label}
      />
    </div>
  );
}
