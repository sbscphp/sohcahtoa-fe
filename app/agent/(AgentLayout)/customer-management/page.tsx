"use client";

import type {
  AgentCustomerListResponse,
  AgentCustomerStatsResponse,
} from "@/app/_lib/api/types";
import { useFetchData } from "@/app/_lib/api/hooks";
import { agentApi } from "@/app/agent/_services/agent-api";
import { useMemo } from "react";
import { CustomerStatCards } from "./_components/CustomerStatCards";
import CustomerTable from "./_components/CustomerTable";

export default function CustomerManagementPage() {
  const { data: customerResponse, isLoading } =
    useFetchData<AgentCustomerListResponse>(
    ["agent", "customers"],
    () => agentApi.customers.list(),
    true
  );

  const { data: statsResponse } = useFetchData<AgentCustomerStatsResponse>(
    ["agent", "customers", "stats"],
    () => agentApi.customers.stats(),
    true
  );

  const customers = useMemo(
    () => customerResponse?.data ?? [],
    [customerResponse]
  );
  const stats = statsResponse?.data;

  const totalCustomers = stats?.totalCustomers;
  const verifiedCustomers = stats?.verifiedCustomers
  const repeatCustomers = stats?.repeatCustomers;
  const pendingKYC = stats?.pendingKyc;

  return (
    <div className="space-y-6">
      <CustomerStatCards
        totalCustomers={totalCustomers}
        verifiedCustomers={verifiedCustomers}
        repeatCustomers={repeatCustomers}
        pendingKYC={pendingKYC}
      />
      <CustomerTable customers={customers} loading={isLoading} />
    </div>
  );
}
