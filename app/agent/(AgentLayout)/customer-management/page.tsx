"use client";

import { CustomerStatCards } from "./_components/CustomerStatCards";
import CustomerTable from "./_components/CustomerTable";
import { useMemo } from "react";
import { useFetchData } from "@/app/_lib/api/hooks";
import { agentApi } from "@/app/agent/_services/agent-api";

interface AgentCustomerSummary {
  userId: string;
  fullName: string;
  customerType: string;
  lastTransactionType: string | null;
  registeredAt: string;
  kycStatus: string;
}

export default function CustomerManagementPage() {
  const { data, isLoading } = useFetchData(
    ["agent", "customers"],
    () => agentApi.customers.list(),
    true
  );

  const customers = useMemo(
    () => ((data?.data as AgentCustomerSummary[]) || []),
    [data]
  );

  const totalCustomers = customers.length;
  const verifiedCustomers = customers.filter(
    (item) => item.kycStatus === "VERIFIED"
  ).length;
  const pendingKYC = customers.filter(
    (item) => item.kycStatus !== "VERIFIED"
  ).length;

  return (
    <div className="space-y-6">
      <CustomerStatCards
        totalCustomers={totalCustomers}
        verifiedCustomers={verifiedCustomers}
        pendingKYC={pendingKYC}
      />
      <CustomerTable customers={customers} loading={isLoading} />
    </div>
  );
}
