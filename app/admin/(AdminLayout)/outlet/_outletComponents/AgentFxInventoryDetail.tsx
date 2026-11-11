"use client";

import DisbursementTab from "./agentFxInventory/DisbursementTab";
import InventoryPositionTab from "./agentFxInventory/InventoryPositionTab";
import LodgmentTab from "./agentFxInventory/LodgmentTab";
import OverviewTab from "./agentFxInventory/OverviewTab";
import TransactionsTab from "./agentFxInventory/TransactionsTab";

type DetailTab = "overview" | "inventory-position" | "transactions" | "disbursement" | "lodgment";

export default function AgentFxInventoryDetail({
  agentId,
  tab,
}: {
  agentId: string;
  tab: DetailTab;
}) {
  if (tab === "inventory-position") return <InventoryPositionTab />;
  if (tab === "transactions") return <TransactionsTab agentId={agentId} />;
  if (tab === "disbursement") return <DisbursementTab />;
  if (tab === "lodgment") return <LodgmentTab />;
  return <OverviewTab agentId={agentId} />;
}
