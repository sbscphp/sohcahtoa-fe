"use client";

import { useMemo, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Tabs } from "@mantine/core";
import { IconWallet, IconWalletAdd, IconRecieve } from "@/components/icons";
import { formatCurrency } from "../../_lib/formatCurrency";
import {
  FX_DASHBOARD_TAB_CONFIG,
  FX_DASHBOARD_TABS,
  type FxDashboardTab,
} from "../../_lib/fx-dashboard-tabs";
import { useFxDashboardTab } from "../../_lib/fx-dashboard-tab-atom";
import { useSelectedCurrencyCode } from "../../_lib/selected-currency-atom";
import { buildTransactionOverviewRequest } from "../../_lib/transaction-overview-request";
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
} from "@/app/_lib/api/types";

type FxOverviewPanelContentProps = {
  tabValue: string;
  amountVisible: boolean;
  onToggleVisible: () => void;
  summary?: TransactionOverviewGroupSummary;
  currencyCode: string;
};

function FxOverviewPanelContent({
  tabValue,
  amountVisible,
  onToggleVisible,
  summary,
  currencyCode,
}: Readonly<FxOverviewPanelContentProps>) {
  const title = FX_DASHBOARD_TAB_CONFIG[tabValue as FxDashboardTab]?.overviewTitle ?? "FX";
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
        <FxActionButton
          icon={<IconWallet className="size-5 text-gray-900" />}
          label="Buy FX"
          onClick={() => router.push("/transactions/new/buy")}
        />
        <FxActionButton
          icon={<IconWalletAdd className="size-5 text-gray-900" />}
          label="Sell FX"
          onClick={() => router.push("/transactions/new/sell")}
        />
        <FxActionButton
          icon={<IconRecieve className="size-5 text-gray-900" />}
          label="Receive money"
          onClick={() => router.push("/transactions/receive/imto")}
        />
      </div>
    </div>
  );
}

export default function FxOverviewCard() {
  const [activeTab, setActiveTab] = useFxDashboardTab();
  const [amountVisible, setAmountVisible] = useState(true);
  const currencyCode = useSelectedCurrencyCode();
  const overviewRequest = useMemo(
    () => buildTransactionOverviewRequest(currencyCode),
    [currencyCode]
  );

  const { data: overviewResponse } = useFetchData<TransactionOverviewData>(
    [...customerKeys.transactions.overview(currencyCode)],
    async () => {
      const res = await customerApi.transactions.overview(overviewRequest);
      return res.data as TransactionOverviewData;
    },
    Boolean(currencyCode)
  );

  const summariesByTab = useMemo<Record<string, TransactionOverviewGroupSummary | undefined>>(
    () => ({
      bought: overviewResponse?.buy,
      sold: overviewResponse?.sell,
      others: overviewResponse?.remittance,
      total: overviewResponse?.all,
    }),
    [overviewResponse]
  );

  return (
    <SectionCard className="rounded-2xl p-4">
      <Tabs
        value={activeTab}
        onChange={(v) => {
          if (v != null) setActiveTab(v as typeof activeTab);
        }}
        variant="pills"
      >
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-5">
            <FilterTabs items={FX_DASHBOARD_TABS} value={activeTab} />
            <CurrencySelector />
          </div>

          {FX_DASHBOARD_TABS.map((tab) => (
            <Tabs.Panel key={tab.value} value={tab.value}>
              <FxOverviewPanelContent
                tabValue={tab.value}
                amountVisible={amountVisible}
                onToggleVisible={() => setAmountVisible((v) => !v)}
                summary={summariesByTab[tab.value]}
                currencyCode={currencyCode}
              />
            </Tabs.Panel>
          ))}
        </div>
      </Tabs>
    </SectionCard>
  );
}
