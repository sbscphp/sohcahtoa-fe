"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useAtomValue } from "jotai";
import { useSetHeaderContent } from "../../../_hooks/useSetHeaderContent";
import { HeaderTabs } from "../../../_components/HeaderTabs";
import Overview from "./Overview";
import Receipt from "./Receipt";
import Settlement from "./Settlement";
import { useTransactionDetails } from "./hooks/useTransactionDetails";
import { adminUserAtom } from "@/app/admin/_lib/atoms/admin-auth-atom";

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
  const adminUser = useAtomValue(adminUserAtom);
  const {
    overview,
    receipt,
    settlement,
    actionDocuments,
    workflowHistory,
    isApprovalOfficer,
    canActOnTransactionFooter,
    approvalState,
    approvalProcessName,
    approvalType,
    isLoading,
    isError,
  } = useTransactionDetails(transactionId, { adminUserId: adminUser?.id });

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
          isApprovalOfficer={isApprovalOfficer}
          canActOnTransactionFooter={canActOnTransactionFooter}
          approvalState={approvalState}
          approvalProcessName={approvalProcessName}
          approvalType={approvalType}
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
          isApprovalOfficer={isApprovalOfficer}
          canActOnTransactionFooter={canActOnTransactionFooter}
          approvalState={approvalState}
          approvalProcessName={approvalProcessName}
          approvalType={approvalType}
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
          isApprovalOfficer={isApprovalOfficer}
          canActOnTransactionFooter={canActOnTransactionFooter}
          approvalState={approvalState}
          approvalProcessName={approvalProcessName}
          approvalType={approvalType}
        />
      )}
    </div>
  );
}
