"use client";

import { useMemo, useState } from "react";
import { Tabs } from "@mantine/core";
import { formatCurrency } from "../../_lib/formatCurrency";
import { useSelectedCurrencyCode } from "../../_lib/selected-currency-atom";
import SectionCard from "./SectionCard";
import SectionHeader from "./SectionHeader";
import SeeAllButton from "./SeeAllButton";
import { FilterTabs } from "../common";
import TransactionListItem from "./TransactionListItem";
import { useRouter } from "next/navigation";
import { useFetchData } from "@/app/_lib/api/hooks";
import { customerKeys } from "@/app/_lib/api/query-keys";
import { customerApi } from "@/app/(customer)/_services/customer-api";
import type { TransactionListItem as ApiTransactionListItem, TransactionsListApiResponse } from "@/app/_lib/api/types";
import { formatHeaderDateTime } from "@/app/utils/helper/formatLocalDate";
const FILTER_TABS = [
  { value: "all", label: "All" },
  { value: "fx", label: "FX" },
  { value: "pta", label: "PTA" },
  { value: "bta", label: "BTA" },
  { value: "medicals", label: "Medicals" },
] as const;

type TxCategory = (typeof FILTER_TABS)[number]["value"];

export default function FxTransactionsCard() {
  const [activeFilter, setActiveFilter] = useState("all");
  const router = useRouter();
  const currencyCode = useSelectedCurrencyCode();

  const listParams = useMemo(
    () => ({
      page: 1,
      limit: 6,
      sortBy: "createdAt",
      sortOrder: "desc" as const,
    }),
    []
  );

  const { data: apiResponse, isLoading } = useFetchData<TransactionsListApiResponse>(
    [...customerKeys.transactions.list(listParams)],
    () => customerApi.transactions.list(listParams),
    true
  );

  const transactions: ApiTransactionListItem[] = useMemo(
    () => apiResponse?.data ?? [],
    [apiResponse]
  );

  return (
    <SectionCard>
      <SectionHeader title="FX transactions" action={<SeeAllButton onClick={() => router.push("/transactions")} />} />
      <Tabs
        value={activeFilter}
        onChange={(v) => {
          if (v != null) setActiveFilter(v);
        }}
        variant="pills"
      >
        <div className="mb-4">
          <FilterTabs items={FILTER_TABS} value={activeFilter} />
        </div>
        {FILTER_TABS.map((tab) => {
          const filtered: ApiTransactionListItem[] =
            tab.value === "all"
              ? transactions
              : tab.value === "fx"
              ? transactions.filter((tx) => tx.group === "BUY" || tx.group === "SELL")
              : tab.value === "pta"
              ? transactions.filter((tx) => tx.type === "PTA")
              : tab.value === "bta"
              ? transactions.filter((tx) => tx.type === "BTA")
              : transactions.filter((tx) => tx.type === "MEDICAL");
          return (
            <Tabs.Panel key={tab.value} value={tab.value} className="min-h-[300px]">
              <div className="">
                {isLoading ? (
                  <p className="py-8 text-center text-sm text-gray-500">Loading transactions…</p>
                ) : filtered.length === 0 ? (
                  <p className="py-8 text-center text-sm text-gray-500">
                    {tab.value === "all" ? "No transactions" : `No ${tab.label.toLowerCase()} transactions`}
                  </p>
                ) : (
                  filtered.map((tx, i) => (
                    <TransactionListItem
                      key={`${tx.id}-${i}`}
                      primaryText={tx.referenceNumber ?? tx.id}
                      secondaryText={formatHeaderDateTime(tx.createdAt)}
                      amount={formatCurrency(Number(tx.foreignAmount ?? 0), currencyCode).formatted}
                    />
                  ))
                )}
              </div>
            </Tabs.Panel>
          );
        })}
      </Tabs>
    </SectionCard>
  );
}
