"use client";

import { useState } from "react";
import AgentTransactionsTable from "../../../agent/_agentComponents/AgentTransactionsTable";
import { TransactionOverview, type FxPeriodFilters } from "./detailShared";

export default function TransactionsTab({ agentId }: { agentId: string }) {
  const [period, setPeriod] = useState<FxPeriodFilters>({});

  return (
    <div className="space-y-4">
      <TransactionOverview agentId={agentId} onPeriodChange={setPeriod} />
      <AgentTransactionsTable
        agentId={agentId}
        dateFrom={period.dateFrom}
        dateTo={period.dateTo}
      />
    </div>
  );
}
