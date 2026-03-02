"use client";

import { useState } from "react";
import { Eye, EyeOff, ListFilter } from "lucide-react";
import { Select, Tabs } from "@mantine/core";
import { IconWallet, IconWalletAdd, IconRecieve } from "@/components/icons";
import { formatCurrency } from "@/app/(customer)/_lib/formatCurrency";
import SectionCard from "@/app/(customer)/_components/dashboard/SectionCard";
import FxActionButton from "@/app/(customer)/_components/dashboard/FxActionButton";
import { CurrencySelectorWithSearch } from "@/app/agent/(AgentLayout)/rate-calculator/_components/CurrencySelectorWithSearch";
import {
  CURRENCIES,
  getCurrencyByCode,
  type Currency,
} from "@/app/(customer)/_lib/currency";
import { useRouter } from "next/navigation";
import { SELECT_WIDTH } from "@/app/agent/utils/constants";

const FX_TABS = [
  { value: "bought", label: "FX bought" },
  { value: "sold", label: "FX sold" },
  { value: "others", label: "Others" },
] as const;

const MOCK_AMOUNTS: Record<string, { title: string; amount: number }> = {
  bought: { title: "FX bought", amount: 67048 },
};

type FxOverviewPanelContentProps = {
  tabValue: string;
  amountVisible: boolean;
  onToggleVisible: () => void;
  currency: Currency;
};

function FxOverviewPanelContent({
  tabValue,
  amountVisible,
  onToggleVisible,
  currency,
}: FxOverviewPanelContentProps) {
  const { amount } = MOCK_AMOUNTS[tabValue] ?? { title: "", amount: 0 };
  const { symbol, value } = formatCurrency(amount, currency.code);
  const displayValue = amountVisible ? value.split(".")[0] : "••••••••";
  const router = useRouter();

  const amountOptions = [
    { label: "Opening Balance", value: 137000075, currencyCode: "USD" },
    { label: "Total Cash Received", value: 137000075, currencyCode: "USD" },
    { label: "Amount Disbursed", value: 137000075, currencyCode: "USD" },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col justify-center gap-2.5">
        <div className="flex items-center gap-1"></div>
        <div className="flex items-center gap-2">
          <span className="flex w-6 h-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-base font-medium leading-[120%] text-gray-900">
            {symbol}
          </span>
          <span className="text-3xl font-bold leading-[120%] text-gray-900">
            {displayValue}
            <span className="text-sm font-semibold leading-[120%] text-gray-900">
              .{value.split(".")[1]}
            </span>
          </span>
          <button
            type="button"
            onClick={onToggleVisible}
            className="text-gray-900 hover:opacity-70"
            aria-label={amountVisible ? "Hide amount" : "Show amount"}
          >
            {amountVisible ? (
              <Eye className="size-5" />
            ) : (
              <EyeOff className="size-5" />
            )}
          </button>
        </div>
      </div>
      <div className="grid lg:grid-cols-3 grid-cols-1 gap-5 py-3">
        {amountOptions.map((option) => (
          <div
            className={`${option.label === "Total Cash Received" ? "border-x-2 border-gray-200 px-2" : ""} space-y-2`}
            key={option.label}
          >
            <p className=" text-gray-600 text-sm">{option.label}</p>
            <p className=" text-black font-bold text-xl">
              {formatCurrency(option.value, option.currencyCode).formatted}
            </p>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-5">
        <FxActionButton
          icon={<IconWallet className="size-5 text-gray-900" />}
          label="Buy FX"
          onClick={() => router.push("/agent/transactions")}
        />
        <FxActionButton
          icon={<IconWalletAdd className="size-5 text-gray-900" />}
          label="Sell FX"
          onClick={() => router.push("/agent/transactions")}
        />
        <FxActionButton
          icon={<IconRecieve className="size-5 text-gray-900" />}
          label="Receive money"
          onClick={() => router.push("/agent/fx-inventory")}
        />
      </div>
    </div>
  );
}

export function CashOverview() {
  const [activeTab, setActiveTab] = useState("bought");
  const [amountVisible, setAmountVisible] = useState(true);
  const [currency, setCurrency] = useState<Currency>(
    getCurrencyByCode("USD") ?? CURRENCIES[0],
  );

  return (
    <SectionCard className="rounded-2xl p-4">
      <Tabs
        value={activeTab}
        onChange={(v) => {
          if (v != null) setActiveTab(v);
        }}
        variant="pills"
      >
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-5 justify-between">
            {/* <FilterTabs items={FX_TABS} value={activeTab} /> */}
            <div className="">
              <h3 className="text-body-heading-300 text-xl font-medium">
                Cash Overview
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <CurrencySelectorWithSearch
                selectedCurrency={currency}
                onCurrencyChange={setCurrency}
              />
              <Select
                size="xs"
                w={SELECT_WIDTH}
                data={["Today", "Last 7 Days", "Last 30 Days", "Last 90 Days"]}
                defaultValue="Today"
                rightSection={<ListFilter className="size-4" />}
                rightSectionPointerEvents="none"
                radius="2xl"
                className="custom-select"
              />
            </div>
          </div>

          {FX_TABS.map((tab) => (
            <Tabs.Panel key={tab.value} value={tab.value}>
              <FxOverviewPanelContent
                tabValue={tab.value}
                amountVisible={amountVisible}
                onToggleVisible={() => setAmountVisible((v) => !v)}
                currency={currency}
              />
            </Tabs.Panel>
          ))}
        </div>
      </Tabs>
    </SectionCard>
  );
}
