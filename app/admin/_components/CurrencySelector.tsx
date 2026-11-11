"use client";

import { Menu } from "@mantine/core";
import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import Image from "next/image";
import { CURRENCIES } from "../_lib/constants";
import { getCurrencyFlagUrl } from "../_lib/currency";

type CurrencyCode = (typeof CURRENCIES)[number]["code"];

type CurrencySelectorMode = "primary" | "secondary";

interface CurrencySelectorProps {
  value?: CurrencyCode | null;
  onChange?: (value: CurrencyCode) => void;
  disabled?: boolean;
  readOnly?: boolean;
  currencyCodes?: CurrencyCode[];
  mode?: CurrencySelectorMode;
}

const TRIGGER_BASE_CLASS =
  "flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-2.5 text-xs font-normal leading-4";

const TRIGGER_MODE_CLASS: Record<CurrencySelectorMode, string> = {
  primary: "border-gray-100 bg-white text-body-text-400",
  secondary: "border-gray-900 bg-gray-900 text-white",
};

const TRIGGER_INTERACTIVE_CLASS =
  "transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50";

const TRIGGER_READONLY_CLASS = "cursor-default";

export default function CurrencySelector({
  value,
  onChange,
  disabled,
  readOnly,
  currencyCodes,
  mode = "primary",
}: CurrencySelectorProps) {
  const currencies = useMemo(() => {
    if (currencyCodes && currencyCodes.length > 0) {
      return CURRENCIES.filter((c) => currencyCodes.includes(c.code));
    }
    return CURRENCIES;
  }, [currencyCodes]);

  const [internalSelected, setInternalSelected] = useState<(typeof CURRENCIES)[number]>(
    currencies[0] ?? CURRENCIES[0]
  );

  const selected = useMemo(() => {
    if (value) {
      return currencies.find((currency) => currency.code === value) ?? currencies[0] ?? CURRENCIES[0];
    }
    return internalSelected;
  }, [internalSelected, value, currencies]);

  const handleSelect = (currency: (typeof CURRENCIES)[number]) => {
    if (readOnly) return;
    if (!value) {
      setInternalSelected(currency);
    }
    onChange?.(currency.code);
  };

  const triggerClassName = [
    TRIGGER_BASE_CLASS,
    TRIGGER_MODE_CLASS[mode],
    readOnly ? TRIGGER_READONLY_CLASS : TRIGGER_INTERACTIVE_CLASS,
  ].join(" ");

  return (
    <Menu
      position="bottom-end"
      width={220}
      closeOnItemClick
      disabled={disabled || readOnly}
    >
      <Menu.Target>
        <button
          type="button"
          disabled={disabled}
          className={triggerClassName}
        >
          {mode === "secondary" ? (
            <span className="size-6 shrink-0 overflow-hidden rounded-full" aria-hidden>
              <Image
                src={getCurrencyFlagUrl(selected.code) ?? ""}
                alt={selected.name}
                width={24}
                height={24}
                className="size-full object-cover"
              />
            </span>
          ) : (
            <span className="text-base leading-none" aria-hidden>
              <Image
                src={getCurrencyFlagUrl(selected.code) ?? ""}
                alt={selected.name}
                width={24}
                height={24}
              />
            </span>
          )}
          <span>{selected.code}</span>
          {!readOnly && <ChevronDown className="size-3 shrink-0" aria-hidden />}
        </button>
      </Menu.Target>
      <Menu.Dropdown className="max-h-62.5 overflow-y-auto">
        {currencies.map((currency) => (
          <Menu.Item
            key={currency.code}
            onClick={() => handleSelect(currency)}
            className={selected.code === currency.code ? "bg-primary-25" : undefined}
          >
            <div className="flex items-center gap-2">
              <span className="text-base leading-none" aria-hidden>
                <Image
                  src={getCurrencyFlagUrl(currency.code) ?? ""}
                  alt={currency.name}
                  width={24}
                  height={24}
                />
              </span>
              <span className="shrink-0 font-medium">{currency.code}</span>
              <span className="min-w-0 truncate text-gray-500">{currency.name}</span>
            </div>
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}