"use client";

import { useEffect, useMemo, useState } from "react";
import { Tabs } from "@mantine/core";
import { formatCurrency } from "../../_lib/formatCurrency";
import { useSelectedCurrencyCode } from "../../_lib/selected-currency-atom";
import {
  buildDashboardTransactionListParams,
  FX_DASHBOARD_TAB_CONFIG,
  FX_TRANSACTION_SUB_FILTERS,
  getDefaultSubFilter,
  getSubFilterDef,
} from "../../_lib/fx-dashboard-tabs";
import { useFxDashboardTab } from "../../_lib/fx-dashboard-tab-atom";
import SectionCard from "./SectionCard";
import SectionHeader from "./SectionHeader";
import SeeAllButton from "./SeeAllButton";
import { FilterTabs } from "../common";
import TransactionListItem from "./TransactionListItem";
import { useRouter } from "next/navigation";
import { useFetchData } from "@/app/_lib/api/hooks";
import { customerKeys } from "@/app/_lib/api/query-keys";
import { customerApi } from "@/app/(customer)/_services/customer-api";
import type { TransactionsListApiResponse } from "@/app/_lib/api/types";
import { formatHeaderDateTime } from "@/app/utils/helper/formatLocalDate";

export default function FxTransactionsCard() {
  const [overviewTab] = useFxDashboardTab();
  const [activeSubFilter, setActiveSubFilter] = useState(() =>
    getDefaultSubFilter(overviewTab)
  );
  const router = useRouter();
  const currencyCode = useSelectedCurrencyCode();

  const subFilterTabs = FX_TRANSACTION_SUB_FILTERS[overviewTab];
  const activeSubFilterDef = getSubFilterDef(overviewTab, activeSubFilter);

  useEffect(() => {
    setActiveSubFilter(getDefaultSubFilter(overviewTab));
  }, [overviewTab]);

  const listParams = useMemo(
    () => buildDashboardTransactionListParams(overviewTab, activeSubFilter),
    [overviewTab, activeSubFilter]
  );

  const { data: apiResponse, isLoading } = useFetchData<TransactionsListApiResponse>(
    [...customerKeys.transactions.list(listParams)],
    () => customerApi.transactions.list(listParams),
    true
  );

  const transactions = useMemo(() => apiResponse?.data ?? [], [apiResponse?.data]);

  return (
    <SectionCard>
      <SectionHeader
        title="FX transactions"
        action={<SeeAllButton onClick={() => router.push("/transactions")} />}
      />
      <Tabs
        value={activeSubFilter}
        onChange={(v) => {
          if (v != null) setActiveSubFilter(v);
        }}
        variant="pills"
        key={overviewTab}
      >
        <div className="mb-4">
          <FilterTabs
            items={subFilterTabs.map((t) => ({ value: t.value, label: t.label }))}
            value={activeSubFilter}
          />
        </div>
        {subFilterTabs.map((tab) => (
          <Tabs.Panel key={tab.value} value={tab.value} className="min-h-[300px]">
            {tab.value === activeSubFilter ? (
              <div>
                {isLoading ? (
                  <p className="py-8 text-center text-sm text-gray-500">Loading transactions…</p>
                ) : transactions.length === 0 ? (
                  <p className="py-8 text-center text-sm text-gray-500">
                    {tab.value === "all"
                      ? FX_DASHBOARD_TAB_CONFIG[overviewTab].emptyMessage
                      : `No ${activeSubFilterDef.label.toLowerCase()} transactions`}
                  </p>
                ) : (
                  transactions.map((tx, i) => (
                    <TransactionListItem
                      key={`${tx.id}-${i}`}
                      primaryText={tx.referenceNumber ?? tx.id}
                      secondaryText={formatHeaderDateTime(tx.createdAt)}
                      amount={formatCurrency(Number(tx.foreignAmount ?? 0), currencyCode).formatted}
                    />
                  ))
                )}
              </div>
            ) : null}
          </Tabs.Panel>
        ))}
      </Tabs>
    </SectionCard>
  );
}
