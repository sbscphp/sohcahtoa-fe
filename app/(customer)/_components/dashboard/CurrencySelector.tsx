"use client";

import { Menu } from "@mantine/core";
import { ChevronDown } from "lucide-react";
import { CURRENCIES } from "../../_lib/constants";
import { getCurrencyByCode, getCurrencyFlagUrl } from "../../_lib/currency";
import { useSelectedCurrencyCode, useSetSelectedCurrencyCode } from "../../_lib/selected-currency-atom";
import Image from "next/image";

export default function CurrencySelector() {
  const selectedCode = useSelectedCurrencyCode();
  const setSelectedCode = useSetSelectedCurrencyCode();
  const selected = getCurrencyByCode(selectedCode) ?? CURRENCIES[0];

  return (
    <Menu position="bottom-end" width={220} closeOnItemClick>
      <Menu.Target>
        <button
          type="button"
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-gray-900 bg-gray-900 px-2.5 py-2.5 text-xs font-normal leading-4 text-white transition-opacity hover:opacity-90"
        >
          <span className="text-base leading-none" aria-hidden>
            <Image src={getCurrencyFlagUrl(selected.code) ?? ""} alt={selected.name} width={24} height={24} />
          </span>
          <span>
            {selected.code}
          </span>
          <ChevronDown className="size-3 shrink-0" aria-hidden />
        </button>
      </Menu.Target>
      <Menu.Dropdown className="max-h-[250px] overflow-y-auto">
        {CURRENCIES.map(currency =>
          <Menu.Item
            key={currency.code}
            onClick={() => setSelectedCode(currency.code)}
            className={
              selected.code === currency.code ? "bg-primary-25" : undefined
            }
          >
            <div className="flex items-center gap-2">
              <span className="text-base leading-none" aria-hidden>
                <Image src={getCurrencyFlagUrl(currency.code) ?? ""} alt={currency.name} width={24} height={24} />
              </span>
              <span className="shrink-0 font-medium">
                {currency.code}
              </span>
              <span className="min-w-0 truncate text-gray-500">
                {currency.name}
              </span>
            </div>
          </Menu.Item>
        )}
      </Menu.Dropdown>
    </Menu>
  );
}
