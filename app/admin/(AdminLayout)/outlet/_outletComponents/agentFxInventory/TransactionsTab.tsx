"use client";

import AgentTransactionsTable from "../../../agent/_agentComponents/AgentTransactionsTable";
import { TransactionOverview } from "./detailShared";

export default function TransactionsTab({ agentId }: { agentId: string }) {
  return (
    <div className="space-y-4">
      <TransactionOverview />
      <AgentTransactionsTable agentId={agentId} />
    </div>
  );
}
