"use client";

import { useState } from "react";
import { FranchiseBranchesTable } from "./FranchiseBranchesTable";
import { FranchiseTransactionsTable } from "./FranchiseTransactionsTable";

type TabKey = "branches" | "transactions";

interface FranchiseDetailTabbedTablesProps {
  franchiseId: string;
}

export function FranchiseDetailTabbedTables({ franchiseId }: FranchiseDetailTabbedTablesProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("branches");

  return (
    <div className="rounded-2xl bg-white shadow-sm p-6">
      <div className="flex gap-6 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab("branches")}
          className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
            activeTab === "branches"
              ? "text-primary-500 font-semibold"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Branches
          {activeTab === "branches" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500" />
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("transactions")}
          className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
            activeTab === "transactions"
              ? "text-primary-500 font-semibold"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Transactions
          {activeTab === "transactions" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500" />
          )}
        </button>
      </div>

      {activeTab === "branches" ? (
        <FranchiseBranchesTable franchiseId={franchiseId} />
      ) : (
        <FranchiseTransactionsTable franchiseId={franchiseId} />
      )}
    </div>
  );
}
