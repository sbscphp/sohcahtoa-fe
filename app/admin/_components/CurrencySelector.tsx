"use client";

import { Menu } from "@mantine/core";
import { ChevronDown, Globe, X } from "lucide-react";
import { useMemo, useState } from "react";
import Image from "next/image";
import { CURRENCIES } from "../_lib/constants";
import { getCurrencyFlagUrl } from "../_lib/currency";

type Currency = (typeof CURRENCIES)[number];
type CurrencyCode = Currency["code"];

type CurrencySelectorMode = "primary" | "secondary";

interface CurrencySelectorProps {
  /**
   * - `undefined` -> uncontrolled (legacy behaviour): starts on the first currency.
   * - `null`      -> controlled, empty selection: no default currency is applied.
   * - a code      -> controlled, that currency is selected.
   */
  value?: CurrencyCode | null;
  /** Signature intentionally unchanged so existing consumers keep type-checking. */
  onChange?: (value: CurrencyCode) => void;
  disabled?: boolean;
  readOnly?: boolean;
  currencyCodes?: CurrencyCode[];
  mode?: CurrencySelectorMode;
  /** Shows a "Clear selection" item in the dropdown while a currency is selected. */
  clearable?: boolean;
  /** Called when the selection is cleared. Parents using `value` should set it to `null` here. */
  onClear?: () => void;
  /** Text shown in the trigger when nothing is selected. */
  placeholder?: string;
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

// Same 24x24 footprint as the flag, so the trigger height never shifts between states.
const EMPTY_ICON_BASE_CLASS =
  "flex size-6 shrink-0 items-center justify-center rounded-full";

const EMPTY_ICON_MODE_CLASS: Record<CurrencySelectorMode, string> = {
  primary: "bg-gray-100",
  secondary: "bg-white/15",
};

export default function CurrencySelector({
  value,
  onChange,
  disabled,
  readOnly,
  currencyCodes,
  mode = "primary",
  clearable = false,
  onClear,
  placeholder = "Currency",
}: CurrencySelectorProps) {
  const currencies = useMemo(() => {
    if (currencyCodes && currencyCodes.length > 0) {
      return CURRENCIES.filter((c) => currencyCodes.includes(c.code));
    }
    return CURRENCIES;
  }, [currencyCodes]);

  // `null` or a real code means the parent owns the state.
  // `undefined` (or any other falsy value, as before) means we own it.
  const isControlled = value === null || Boolean(value);

  const [internalSelected, setInternalSelected] = useState<Currency | null>(
    currencies[0] ?? CURRENCIES[0]
  );

  const selected = useMemo<Currency | null>(() => {
    if (value === null) return null;
    if (value) {
      return currencies.find((currency) => currency.code === value) ?? currencies[0] ?? CURRENCIES[0];
    }
    return internalSelected;
  }, [internalSelected, value, currencies]);

  const handleSelect = (currency: Currency) => {
    if (readOnly) return;
    if (!isControlled) {
      setInternalSelected(currency);
    }
    onChange?.(currency.code);
  };

  const handleClear = () => {
    if (readOnly) return;
    if (!isControlled) {
      setInternalSelected(null);
    }
    onClear?.();
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
          {selected === null ? (
            <span
              className={`${EMPTY_ICON_BASE_CLASS} ${EMPTY_ICON_MODE_CLASS[mode]}`}
              aria-hidden
            >
              <Globe className="size-3.5" />
            </span>
          ) : mode === "secondary" ? (
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
          <span className={selected === null ? "opacity-70" : undefined}>
            {selected ? selected.code : placeholder}
          </span>
          {!readOnly && <ChevronDown className="size-3 shrink-0" aria-hidden />}
        </button>
      </Menu.Target>
      <Menu.Dropdown className="max-h-62.5 overflow-y-auto">
        {clearable && selected !== null && (
          <>
            <Menu.Item onClick={handleClear}>
              <div className="flex items-center gap-2">
                <span className="flex size-6 shrink-0 items-center justify-center" aria-hidden>
                  <X className="size-4 text-gray-500" />
                </span>
                <span className="min-w-0 truncate text-gray-500">Clear selection</span>
              </div>
            </Menu.Item>
            <Menu.Divider />
          </>
        )}
        {currencies.map((currency) => (
          <Menu.Item
            key={currency.code}
            onClick={() => handleSelect(currency)}
            className={selected?.code === currency.code ? "bg-primary-25" : undefined}
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