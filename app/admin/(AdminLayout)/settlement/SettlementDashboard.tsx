"use client";

import React from "react";
import {
  Card,
  Text,
  Group,
  Badge,
  Stack,
  Grid,
  ActionIcon,
} from "@mantine/core";
import {
  Coins,
  ScrollText,
  Wallet,
  ArrowUpRight,
  ChevronRight,
  Clock,
} from "lucide-react";
import DynamicTableSection from "../../_components/DynamicTableSection";

// --- COMPONENTS ---

// 1. StatCard (Matches your snippet structure)
const StatCard = ({
  title,
  value,
  icon,
  iconBg,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg: string;
}) => {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${iconBg}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h4 className="text-xl font-bold text-gray-900">{value}</h4>
      </div>
    </div>
  );
};

// --- MOCK DATA ---

const discrepancyData = [
  { id: "ID:9023", title: "Balance mismatch", outlet: "Abuja", type: "Franchise", date: "Nov 16 2025", time: "11:00 am", priority: "High" },
  { id: "ID:9025", title: "Withdrawal Issues", outlet: "PortHarcourt", type: "Branch", date: "Nov 21 2025", time: "4:30 pm", priority: "Medium" },
  { id: "ID:9026", title: "Samuel Olubanki", outlet: "Lekki Phase 1", type: "Franchise", date: "Nov 17 2025", time: "12:30 pm", priority: "High" },
  { id: "ID:9024", title: "Ibrahim Dantata", outlet: "Abuja", type: "Franchise", date: "Nov 20 2025", time: "9:00 am", priority: "High" },
  { id: "ID:9027", title: "Mfon Ubot", outlet: "Egbeda", type: "Branch", date: "Nov 22 2025", time: "10:00 am", priority: "Low" },
];

const pendingReconData = [
  { id: "#23374", location: "Abuja (franchise)", priority: "High", time: "Overdue 2 hours", isOverdue: true },
  { id: "#23374", location: "Abuja (franchise)", priority: "Medium", time: "12:00 pm, Friday", isOverdue: false },
  { id: "#23374", location: "Abuja (franchise)", priority: "Low", time: "12:00 pm, Friday", isOverdue: false },
  { id: "#23374", location: "Abuja (franchise)", priority: "Low", time: "12:00 pm, Friday", isOverdue: false },
];

const transactionData = [
  { id: "GHA67AGHA", amount: "$400", date: "Nov 16 2025", time: "11:00 am", status: "Confirmed" },
  { id: "GHA67AGHA", amount: "$500", date: "Nov 21 2025", time: "4:30 pm", status: "Pending approval" },
  { id: "GHA67AGHA", amount: "$600", date: "Nov 17 2025", time: "12:30 pm", status: "Confirmed" },
  { id: "GHA67AGHA", amount: "$550", date: "Nov 20 2025", time: "9:00 am", status: "Confirmed" },
  { id: "GHA67AGHA", amount: "$450", date: "Nov 22 2025", time: "10:00 am", status: "Pending approval" },
];

const escrowData = [
  { name: "Sohchatoa Settlement 1", bank: "GT Bank", number: "0099716" },
  { name: "Sohchatoa Settlement 1", bank: "GT Bank", number: "0099716" },
];

// --- HELPER COMPONENTS ---

const SectionHeader = ({ title }: { title: string }) => (
  <Group justify="space-between" mb="lg">
    <Text fw={700} size="lg" c="dark">{title}</Text>
    <Group gap={4} className="text-orange-600 cursor-pointer hover:text-orange-700">
      <Text size="sm" fw={600}>View all</Text>
      <ArrowUpRight size={16} />
    </Group>
  </Group>
);

const PriorityBadge = ({ level }: { level: string }) => {
  let styles = { bg: "bg-gray-100", c: "text-gray-600", color: "gray" };
  if (level === "High") styles = { bg: "bg-red-50", c: "text-red-600", color: "red" };
  if (level === "Medium") styles = { bg: "bg-orange-50", c: "text-orange-600", color: "orange" };
  if (level === "Low") styles = { bg: "bg-blue-50", c: "text-blue-600", color: "blue" };

  return (
    <Badge variant="light" radius="sm" color={styles.color} className={`${styles.bg} ${styles.c} capitalize`}>
      {level}
    </Badge>
  );
};

// --- TABLES RENDER LOGIC ---

const DiscrepancyTable = () => {
  const headers = [
    { label: "Title/ID", key: "title" },
    { label: "Outlet", key: "outlet" },
    { label: "Flagged Date", key: "date" },
    { label: "Priority", key: "priority" },
    { label: "", key: "action" },
  ];

  const renderItems = (item: any) => [
    <div key="title">
      <Text size="sm" fw={600} c="dark">{item.title}</Text>
      <Text size="xs" c="dimmed">{item.id}</Text>
    </div>,
    <div key="outlet">
      <Text size="sm" fw={500} c="dark">{item.outlet}</Text>
      <Text size="xs" c="dimmed">{item.type}</Text>
    </div>,
    <div key="date">
      <Text size="sm" fw={500} c="dark">{item.date}</Text>
      <Text size="xs" c="dimmed">{item.time}</Text>
    </div>,
    <PriorityBadge key="priority" level={item.priority} />,
    <ActionIcon key="action" variant="subtle" color="orange" radius="xl" size="sm" className="bg-orange-50 text-orange-500">
        <ChevronRight size={16} />
    </ActionIcon>
  ];

  return (
    <DynamicTableSection
      headers={headers}
      data={discrepancyData}
      renderItems={renderItems}
      pagination={{ page: 1, totalPages: 5, onNext: () => {}, onPrevious: () => {} }}
    />
  );
};

const TransactionsTable = () => {
  const headers = [
    { label: "Reference ID", key: "id" },
    { label: "Amount Sent", key: "amount" },
    { label: "Fund Date", key: "date" },
    { label: "Status", key: "status" },
    { label: "", key: "action" },
  ];

  const renderItems = (item: any) => [
    <Text key="id" size="sm" fw={600} c="gray.7">{item.id}</Text>,
    <Text key="amount" size="sm" fw={600} c="dark">{item.amount}</Text>,
    <div key="date">
      <Text size="sm" fw={500} c="dark">{item.date}</Text>
      <Text size="xs" c="dimmed">{item.time}</Text>
    </div>,
    <Badge 
        key="status"
        variant="light" 
        radius="sm"
        color={item.status === "Confirmed" ? "green" : "orange"}
        className={item.status === "Confirmed" ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"}
    >
        {item.status}
    </Badge>,
    <ActionIcon key="action" variant="subtle" color="orange" radius="xl" size="sm" className="bg-orange-50 text-orange-500">
        <ChevronRight size={16} />
    </ActionIcon>
  ];

  return (
    <DynamicTableSection
      headers={headers}
      data={transactionData}
      renderItems={renderItems}
      pagination={{ page: 1, totalPages: 5, onNext: () => {}, onPrevious: () => {} }}
    />
  );
};

// --- MAIN COMPONENT ---

export default function SettlementDashboard() {
  return (
    <div className="m-5 space-y-6">
      
      {/* 1. Summary Stats (Updated to your requested layout) */}
      <div className="w-full p-4 bg-white shadow-sm rounded-xl">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            title="Current Balance"
            value="₦54,768,000.07"
            icon={<Coins className="w-5 h-5 text-orange-600" />}
            iconBg="bg-orange-100"
          />

          <StatCard
            title="Pending Reconciliation"
            value="8"
            icon={<ScrollText className="w-5 h-5 text-yellow-600" />}
            iconBg="bg-yellow-100"
          />

          <StatCard
            title="Total Escrow Accounts"
            value="24"
            icon={<Wallet className="w-5 h-5 text-blue-600" />}
            iconBg="bg-blue-100"
          />
        </div>
      </div>

      <Grid gutter="lg">
        {/* 2. Discrepancy Reports (Left - Wider) */}
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Card padding="lg" radius="md" withBorder className="h-full bg-white">
            <SectionHeader title="Discrepancy Reports" />
            <DiscrepancyTable />
          </Card>
        </Grid.Col>

        {/* 3. Pending Reconciliation (Right - Narrower) */}
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Card padding="lg" radius="md" withBorder className="h-full bg-white">
            <SectionHeader title="Pending Reconciliation" />
            
            <Stack gap="md">
              {pendingReconData.map((item, idx) => (
                <div key={idx} className="p-4 transition-colors border border-gray-100 rounded-lg hover:border-gray-200">
                  <Group justify="space-between" mb="xs">
                    <div>
                        <Text size="sm" fw={700} c="dark">{item.id}</Text>
                        <Text size="xs" c="dimmed">{item.location}</Text>
                    </div>
                    <PriorityBadge level={item.priority} />
                  </Group>
                  <Group gap="xs">
                    {item.isOverdue ? (
                        <Clock size={14} className="text-red-500" />
                    ) : (
                        <Clock size={14} className="text-gray-400" />
                    )}
                    <Text size="xs" c={item.isOverdue ? "red.6" : "dimmed"} fw={item.isOverdue ? 600 : 400}>
                        {item.time}
                    </Text>
                  </Group>
                </div>
              ))}
            </Stack>
          </Card>
        </Grid.Col>

        {/* 4. Escrow Accounts (Bottom Left) */}
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Card padding="lg" radius="md" withBorder className="h-full bg-white">
            <Text fw={700} size="lg" mb="lg">Escrow Accounts</Text>
            
            <Stack gap="md">
                {escrowData.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start p-4 border border-gray-200 rounded-lg">
                        <div>
                            <Text size="sm" fw={700} c="dark" mb={4}>{item.name}</Text>
                            <Text size="xs" c="dimmed">{item.bank} - {item.number}</Text>
                        </div>
                        <Badge color="green" variant="light" size="xs" className="text-green-600 bg-green-50">Active</Badge>
                    </div>
                ))}
            </Stack>
          </Card>
        </Grid.Col>

        {/* 5. Recent Funding Transactions (Bottom Right) */}
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Card padding="lg" radius="md" withBorder className="h-full bg-white">
            <SectionHeader title="Recent Funding Transactions" />
            <TransactionsTable />
          </Card>
        </Grid.Col>
      </Grid>
    </div>
  );
}