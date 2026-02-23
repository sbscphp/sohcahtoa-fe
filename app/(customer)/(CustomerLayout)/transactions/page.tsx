"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import TransactionSummaryCards from "@/app/(customer)/_components/transactions/TransactionSummaryCards";
import TransactionTableOverview, { type Transaction } from "@/app/(customer)/_components/transactions/table/TransactionTableOverview";
import { useFetchData } from "@/app/_lib/api/hooks";
import { customerKeys } from "@/app/_lib/api/query-keys";
import { customerApi } from "@/app/(customer)/_services/customer-api";
import type { TransactionListItem } from "@/app/_lib/api/types";

const TAB_TO_GROUP = {
  "Buy FX": "BUY" as const,
  "Sell FX": "SELL" as const,
  "Receive FX": "REMITTANCE" as const,
};

const GROUP_TO_LABEL: Record<string, "Buy FX" | "Sell FX" | "Receive FX"> = {
  BUY: "Buy FX",
  SELL: "Sell FX",
  REMITTANCE: "Receive FX",
};

type DisplayStatus = Transaction["status"];

function mapApiStatusToDisplay(apiStatus: string): DisplayStatus {
  const s = apiStatus?.toUpperCase() ?? "";
  if (s === "COMPLETED" || s === "APPROVED") return "Completed";
  if (s === "REJECTED") return "Rejected";
  if (s === "REQUEST_MORE_INFO") return "Request More Info";
  return "Pending";
}

function mapListItemToTransaction(item: TransactionListItem): Transaction {
  return {
    id: item.id,
    referenceNumber: item.referenceNumber,
    date: item.createdAt,
    type: item.type,
    stage: item.currentStep,
    status: mapApiStatusToDisplay(item.status),
    transaction_type: GROUP_TO_LABEL[item.group] ?? "Buy FX",
  };
}

export default function TransactionsPage() {
  const router = useRouter();
  const [activeType, setActiveType] = useState<string>("Buy FX");

  const listParams = useMemo(
    () => ({
      page: 1,
      limit: 20,
      group: TAB_TO_GROUP[activeType as keyof typeof TAB_TO_GROUP] ?? undefined,
      sortBy: "createdAt",
      sortOrder: "desc" as const,
    }),
    [activeType]
  );

  const { data: apiResponse, isLoading } = useFetchData(
    [...customerKeys.transactions.list(listParams)],
    () => customerApi.transactions.list(listParams),
    true
  );

  const tableRows: Transaction[] = useMemo(
    () => (apiResponse?.data ?? []).map(mapListItemToTransaction),
    [apiResponse?.data]
  );

  const totalTransactions = apiResponse?.pagination?.total ?? 0;
  const completed = tableRows.filter((t) => t.status === "Completed" || t.status === "Approved").length;
  const rejected = tableRows.filter((t) => t.status === "Rejected").length;
  const pending = tableRows.filter((t) => t.status === "Pending" || t.status === "Request More Info").length;

  const handleRowClick = (transaction: Transaction) => {
    router.push(`/transactions/detail/${transaction.id}`);
  };

  const handleFilterClick = () => {
    console.log("Open filter modal");
  };

  const handleExportClick = () => {
    console.log("Export transactions");
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-4">
        <TransactionSummaryCards
          totalTransactions={totalTransactions}
          completed={completed}
          rejected={rejected}
          pending={pending}
        />
      </div>

      <div className="bg-white rounded-2xl p-4">
        <TransactionTableOverview
          activeType={activeType}
          onTypeChange={setActiveType}
          onFilterClick={handleFilterClick}
          onExportClick={handleExportClick}
          transactions={isLoading ? [] : tableRows}
          pageSize={10}
          onRowClick={handleRowClick}
        />
      </div>
    </div>
  );
}
