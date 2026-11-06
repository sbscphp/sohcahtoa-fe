export interface AgentFxInventoryRow {
  id: string;
  agentName: string;
  agentId: string;
  phone: string;
  email: string;
  totalDisbursement: number;
  totalLodgment: number;
}

export const AGENT_FX_INVENTORY_STATS = {
  totalDisbursement: 1627,
  totalLodgments: 240,
  pendingApprovals: 8,
  approvedDisbursement: 24,
} as const;

export const AGENT_FX_INVENTORY_ROWS: AgentFxInventoryRow[] = [
  {
    id: "agent-fx-1",
    agentName: "Tunde Bashorun",
    agentId: "9023",
    phone: "+234 90 2323 4545",
    email: "tunde@eternalglobal.com",
    totalDisbursement: 209,
    totalLodgment: 10,
  },
  {
    id: "agent-fx-2",
    agentName: "Queen Omotola",
    agentId: "9025",
    phone: "+234 90 5858 3939",
    email: "queen@kudimata.com",
    totalDisbursement: 9,
    totalLodgment: 18,
  },
  {
    id: "agent-fx-3",
    agentName: "Samuel Olubanki",
    agentId: "9026",
    phone: "+234 91 2222 4545",
    email: "olubankisamuel@gmail.com",
    totalDisbursement: 120,
    totalLodgment: 16,
  },
  {
    id: "agent-fx-4",
    agentName: "Ibrahim Dantata",
    agentId: "9024",
    phone: "+234 90 5858 3939",
    email: "ibrahim@sultan.com",
    totalDisbursement: 50,
    totalLodgment: 17,
  },
  {
    id: "agent-fx-5",
    agentName: "Mfon Ubot",
    agentId: "9027",
    phone: "+234 90 2323 4545",
    email: "mubot@greenfield.com",
    totalDisbursement: 60,
    totalLodgment: 60,
  },
  {
    id: "agent-fx-6",
    agentName: "Sariki Sudan",
    agentId: "9023",
    phone: "+234 81 0000 3456",
    email: "nagode@gmail.com",
    totalDisbursement: 98,
    totalLodgment: 98,
  },
];
