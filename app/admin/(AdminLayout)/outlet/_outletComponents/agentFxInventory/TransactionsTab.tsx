"use client";

import AgentTransactionsTable from "../../../agent/_agentComponents/AgentTransactionsTable";

export default function TransactionsTab({ agentId }: { agentId: string }) {
  return <AgentTransactionsTable agentId={agentId} />;
}
