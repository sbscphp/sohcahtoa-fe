"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TransactionSummaryCards from "@/app/(customer)/_components/transactions/TransactionSummaryCards";
import TransactionTableOverview, { type Transaction } from "@/app/(customer)/_components/transactions/table/TransactionTableOverview";
import { MOCK_TRANSACTIONS } from "@/app/(customer)/_lib/mock-transactions";

export default function TransactionsPage() {
  const router = useRouter();
  const [activeType, setActiveType] = useState<string>("Buy FX");
  const [transactions] = useState<Transaction[]>(MOCK_TRANSACTIONS as Transaction[]);

  // Filter transactions by transaction_type
  const filteredTransactions = transactions.filter((tx) => {
    return tx.transaction_type === activeType;
  });

  // Calculate summary stats
  const totalTransactions = transactions.length;
  const completed = transactions.filter((t) => t.status === "Completed" || t.status === "Approved").length;
  const rejected = transactions.filter((t) => t.status === "Rejected").length;
  const pending = transactions.filter((t) => t.status === "Pending" || t.status === "Request More Info").length;

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
      {/* Summary Cards */}
      <div  className="bg-white rounded-2xl p-4">
      <TransactionSummaryCards
        totalTransactions={totalTransactions}
        completed={completed}
        rejected={rejected}
        pending={pending}
      />
      </div>

      {/* Transaction Table Overview */}
      <div className="bg-white rounded-2xl p-4">
      <TransactionTableOverview
        activeType={activeType}
        onTypeChange={setActiveType}
        onFilterClick={handleFilterClick}
        onExportClick={handleExportClick}
        transactions={filteredTransactions}
        pageSize={10}
        onRowClick={handleRowClick}
      />
      </div>
    </div>
  );
}
