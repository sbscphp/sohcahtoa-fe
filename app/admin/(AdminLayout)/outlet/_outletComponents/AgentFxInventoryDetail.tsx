"use client";

import type { AgentFxInventoryDetail as AgentFxDetail } from "../_data/agentFxInventoryMock";
import DisbursementTab from "./agentFxInventory/DisbursementTab";
import InventoryPositionTab from "./agentFxInventory/InventoryPositionTab";
import LodgmentTab from "./agentFxInventory/LodgmentTab";
import OverviewTab from "./agentFxInventory/OverviewTab";
import TransactionsTab from "./agentFxInventory/TransactionsTab";

type DetailTab = "overview" | "inventory-position" | "transactions" | "disbursement" | "lodgment";

export default function AgentFxInventoryDetail({
  detail,
  tab,
}: {
  detail: AgentFxDetail;
  tab: DetailTab;
}) {
  if (tab === "inventory-position") return <InventoryPositionTab />;
  if (tab === "transactions") return <TransactionsTab />;
  if (tab === "disbursement") return <DisbursementTab />;
  if (tab === "lodgment") return <LodgmentTab />;
  return <OverviewTab detail={detail} />;
}
