"use client";

import { Menu } from "@mantine/core";
import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import Image from "next/image";
import { CURRENCIES } from "../_lib/constants";
import { getCurrencyFlagUrl } from "../_lib/currency";

type CurrencyCode = (typeof CURRENCIES)[number]["code"];

interface CurrencySelectorProps {
  value?: CurrencyCode | null;
  onChange?: (value: CurrencyCode) => void;
}

export default function CurrencySelector({ value, onChange }: CurrencySelectorProps) {
  const [internalSelected, setInternalSelected] = useState<(typeof CURRENCIES)[number]>(
    CURRENCIES[0]
  );

  const selected = useMemo(() => {
    if (value) {
      return CURRENCIES.find((currency) => currency.code === value) ?? CURRENCIES[0];
    }
    return internalSelected;
  }, [internalSelected, value]);

  const handleSelect = (currency: (typeof CURRENCIES)[number]) => {
    if (!value) {
      setInternalSelected(currency);
    }
    onChange?.(currency.code);
  };

  return (
    <Menu position="bottom-end" width={220} closeOnItemClick>
      <Menu.Target>
        <button
          type="button"
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-gray-100 bg-white px-2.5 py-2.5 text-xs font-normal leading-4 text-body-text-400 transition-opacity hover:opacity-90"
        >
          <span className="text-base leading-none" aria-hidden>
            <Image
              src={getCurrencyFlagUrl(selected.code) ?? ""}
              alt={selected.name}
              width={24}
              height={24}
            />
          </span>
          <span>{selected.code}</span>
          <ChevronDown className="size-3 shrink-0" aria-hidden />
        </button>
      </Menu.Target>
      <Menu.Dropdown className="max-h-[250px] overflow-y-auto">
        {CURRENCIES.map((currency) => (
          <Menu.Item
            key={currency.code}
            onClick={() => handleSelect(currency)}
            className={selected.code === currency.code ? "bg-primary-25" : undefined}
          >
            <div className="flex items-center gap-2">
              <span className="text-base leading-none" aria-hidden>
                <Image
                  src={getCurrencyFlagUrl(currency.code ?? CURRENCIES[0].code) ?? ""}
                  alt={currency.name ?? CURRENCIES[0].name}
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
