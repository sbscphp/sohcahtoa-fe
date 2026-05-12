"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useSetHeaderContent } from "../../../_hooks/useSetHeaderContent";
import { HeaderTabs } from "../../../_components/HeaderTabs";
import Overview from "./Overview";
import Receipt from "./Receipt";
import Settlement from "./Settlement";
import { useTransactionDetails } from "./hooks/useTransactionDetails";

export const TRANSACTION_TABS = [
  { value: "overview", label: "Overview" },
  { value: "receipt", label: "Receipt of Payment" },
  { value: "transaction-settlement", label: "Transaction Settlement" },
] as const;

export type TransactionTabValue = (typeof TRANSACTION_TABS)[number]["value"];

export default function ViewTransactionPage() {
  const [activeTab, setActiveTab] = useState<TransactionTabValue>("overview");
  const params = useParams<{ id: string }>();
  const transactionId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const {
    overview,
    receipt,
    settlement,
    actionDocuments,
    workflowHistory,
    isLoading,
    isError,
  } =
    useTransactionDetails(transactionId);

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
      {activeTab === "overview" && (
        <Overview
          transaction={overview}
          actionDocuments={actionDocuments}
          workflowHistory={workflowHistory}
          transactionId={transactionId}
          isLoading={isLoading}
          isError={isError}
        />
      )}
      {activeTab === "receipt" && (
        <Receipt
          transaction={receipt}
          actionDocuments={actionDocuments}
          workflowHistory={workflowHistory}
          transactionId={transactionId}
          isLoading={isLoading}
          isError={isError}
        />
      )}
      {activeTab === "transaction-settlement" && (
        <Settlement
          transaction={settlement}
          actionDocuments={actionDocuments}
          workflowHistory={workflowHistory}
          transactionId={transactionId}
          isLoading={isLoading}
          isError={isError}
        />
      )}
    </div>
  );
}
