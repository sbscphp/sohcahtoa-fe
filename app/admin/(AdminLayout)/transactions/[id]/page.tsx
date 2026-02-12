"use client";

import { useState, useMemo } from "react";
import { useSetHeaderContent } from "../../../_hooks/useSetHeaderContent";
import { HeaderTabs } from "../../../_components/HeaderTabs";
import Overview from "./Overview";
import Receipt from "./Receipt";
import Settlement from "./Settlement";

export const TRANSACTION_TABS = [
  { value: "overview", label: "Overview" },
  { value: "receipt", label: "Receipt of Payment" },
  { value: "transaction-settlement", label: "Transaction Settlement" },
] as const;

export type TransactionTabValue = (typeof TRANSACTION_TABS)[number]["value"];

export default function ViewTransactionPage() {
  const [activeTab, setActiveTab] = useState<TransactionTabValue>("overview");

  const headerContent = useMemo(
    () => (
      <HeaderTabs
        value={activeTab}
        onChange={(v) => setActiveTab(v as TransactionTabValue)}
        tabs={[...TRANSACTION_TABS]}
      />
    ),
    [activeTab]
  );

  useSetHeaderContent(headerContent);

  return (
    <div>
      {activeTab === "overview" && <Overview />}
      {activeTab === "receipt" && <Receipt />}
      {activeTab === "transaction-settlement" && <Settlement />}
    </div>
  );
}
