"use client";

import { useMemo, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Tabs } from "@mantine/core";
import { IconWallet, IconWalletAdd, IconRecieve } from "@/components/icons";
import { formatCurrency } from "../../_lib/formatCurrency";
import { useSelectedCurrencyCode } from "../../_lib/selected-currency-atom";
import SectionCard from "./SectionCard";
import CurrencySelector from "./CurrencySelector";
import FxActionButton from "./FxActionButton";
import { FilterTabs } from "../common";
import { useRouter } from "next/navigation";
import { useFetchData } from "@/app/_lib/api/hooks";
import { customerKeys } from "@/app/_lib/api/query-keys";
import { customerApi } from "@/app/(customer)/_services/customer-api";
import type {
  TransactionOverviewData,
  TransactionOverviewGroupSummary,
  TransactionOverviewRequest,
} from "@/app/_lib/api/types";
import type { Currency } from "../../_lib/constants";

const FX_TABS = [
  { value: "bought", label: "FX bought" },
  { value: "sold", label: "FX sold" },
  { value: "others", label: "Others" },
] as const;

type FxOverviewPanelContentProps = {
  tabValue: string;
  amountVisible: boolean;
  onToggleVisible: () => void;
  summary?: TransactionOverviewGroupSummary;
};

function FxOverviewPanelContent({
  tabValue,
  amountVisible,
  onToggleVisible,
  summary,
}: Readonly<FxOverviewPanelContentProps>) {
  const currencyCode = useSelectedCurrencyCode();
  const title = tabValue === "bought" ? "FX bought" : tabValue === "sold" ? "FX sold" : "Others";
  const amount = summary?.totalAmount ?? 0;
  const { symbol, value } = formatCurrency(amount, currencyCode);
  const displayValue = amountVisible ? value.split(".")[0] : "••••••••";
  const router = useRouter();
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col justify-center gap-2.5">
        <div className="flex items-center gap-1">
          <span className="text-sm font-normal leading-[120%] text-gray-900">{title}</span>
          <button
            type="button"
            onClick={onToggleVisible}
            className="text-gray-900 hover:opacity-70"
            aria-label={amountVisible ? "Hide amount" : "Show amount"}
          >
            {amountVisible ? <Eye className="size-5" /> : <EyeOff className="size-5" />}
          </button>
        </div>
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
        </div>
      </div>
      <div className="flex flex-wrap gap-5">
        <FxActionButton icon={<IconWallet className="size-5 text-gray-900" />} label="Buy FX"  onClick={() => router.push("/transactions/new/buy")}/>
        <FxActionButton icon={<IconWalletAdd className="size-5 text-gray-900" />} label="Sell FX"  onClick={() => router.push("/transactions/new/sell")}/>
        <FxActionButton icon={<IconRecieve className="size-5 text-gray-900" />} label="Receive money"  onClick={() => router.push("/transactions/receive/imto")}/>
      </div>
    </div>
  );
}

export default function FxOverviewCard() {
  const [activeTab, setActiveTab] = useState("bought");
  const [amountVisible, setAmountVisible] = useState(true);
  const [overrideOverview, setOverrideOverview] = useState<TransactionOverviewData | undefined>(undefined);

  const { data: overviewResponse } = useFetchData<TransactionOverviewData>(
    [...customerKeys.transactions.overview()],
    async () => {
      const res = await customerApi.transactions.overview();
      return res.data as TransactionOverviewData;
    },
    true
  );

  const effectiveOverview = overrideOverview ?? overviewResponse;

  const summariesByTab = useMemo<Record<string, TransactionOverviewGroupSummary | undefined>>(
    () => ({
      bought: effectiveOverview?.buy,
      sold: effectiveOverview?.sell,
      others: effectiveOverview?.remittance,
      total: effectiveOverview?.all,
    }),
    [effectiveOverview]
  );

  const handleCurrencyChange = async (currency: Currency) => {
    const body: TransactionOverviewRequest = {
      customRates: [
        {
          currency: currency?.code ?? "",
          rate: currency?.rate ?? 1,
        },
      ],
    };

    const res = await customerApi.transactions.overview(body);
    if (res.data) {
      setOverrideOverview(res.data);
    }
  };

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
          <div className="flex flex-wrap items-center gap-5">
            <FilterTabs items={FX_TABS} value={activeTab} />
            <CurrencySelector onChange={handleCurrencyChange} />
          </div>

          {FX_TABS.map((tab) => (
            <Tabs.Panel key={tab.value} value={tab.value}>
              <FxOverviewPanelContent
                tabValue={tab.value}
                amountVisible={amountVisible}
                onToggleVisible={() => setAmountVisible((v) => !v)}
                summary={summariesByTab[tab.value]}
              />
            </Tabs.Panel>
          ))}
        </div>
      </Tabs>
    </SectionCard>
  );
}
