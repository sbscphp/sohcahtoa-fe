"use client";

import { useMemo, useState } from "react";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import FormModal, { FormField } from "@/app/admin/_components/FormModal";
import { SuccessModal } from "@/app/admin/_components/SuccessModal";
import { ConfirmationModal } from "@/app/admin/_components/ConfirmationModal";
import {
  ActionIcon,
  Button,
  Group,
  Select,
  Text,
  TextInput,
} from "@mantine/core";
import { ChevronRight, ListFilter, Plus, Search, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";

/* --------------------------------------------
 Types
--------------------------------------------- */
interface Agent {
  agentName: string;
  id: string;
  phone: string;
  email: string;
  totalTransactions: number;
  transactionVolume: number;
  status: "Active" | "Deactivated";
}

/* --------------------------------------------
 Mock Data
--------------------------------------------- */
const generateAgents = (): Agent[] => [
  {
    agentName: "Tunde Bashorun",
    id: "9023",
    phone: "+234 90 2323 4545",
    email: "tunde@eternalglobal.com",
    totalTransactions: 209,
    transactionVolume: 1250000,
    status: "Active",
  },
  {
    agentName: "Queen Omotola",
    id: "9025",
    phone: "+234 90 5858 3939",
    email: "queen@kudimata.com",
    totalTransactions: 9,
    transactionVolume: 875000,
    status: "Active",
  },
  {
    agentName: "Samuel Olubanki",
    id: "9026",
    phone: "+234 91 2222 4545",
    email: "olubankisamuel@gmail.com",
    totalTransactions: 120,
    transactionVolume: 930500,
    status: "Active",
  },
  {
    agentName: "Ibrahim Dantata",
    id: "9024",
    phone: "+234 90 5858 3939",
    email: "ibrahim@sultan.com",
    totalTransactions: 50,
    transactionVolume: 1100000,
    status: "Deactivated",
  },
  {
    agentName: "Mfon Ubot",
    id: "9027",
    phone: "+234 90 2323 4545",
    email: "mubot@greenfield.com",
    totalTransactions: 60,
    transactionVolume: 790000,
    status: "Active",
  },
  {
    agentName: "Sarik Sudan",
    id: "9023",
    phone: "+234 81 0000 3456",
    email: "nagode@gmail.com",
    totalTransactions: 98,
    transactionVolume: 980000,
    status: "Deactivated",
  },
];

/* --------------------------------------------
 Helpers
--------------------------------------------- */
const formatNaira = (amount: number): string =>
  `₦ ${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

/* --------------------------------------------
 Component
--------------------------------------------- */
export default function AgentTable() {
  const router = useRouter();

  const [page, setPage] = useState(1);
  const pageSize = 5;

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Filter By");
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmModalOpened, setConfirmModalOpened] = useState(false);
  const [successModalOpened, setSuccessModalOpened] = useState(false);
  const [pendingAgentData, setPendingAgentData] =
    useState<Record<string, any> | null>(null);

  const allAgents = useMemo(() => generateAgents(), []);

  const filteredData = useMemo(() => {
    return allAgents.filter((agent) => {
      const matchesSearch =
        agent.agentName.toLowerCase().includes(search.toLowerCase()) ||
        agent.id.includes(search) ||
        agent.email.toLowerCase().includes(search.toLowerCase()) ||
        agent.phone.includes(search);

      const matchesFilter =
        filter === "Filter By" || filter === "All" || agent.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [search, filter, allAgents]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredData.slice(start, end);
  }, [page, filteredData]);

  const agentHeaders = [
    { label: "Agent", key: "agent" },
    { label: "Contact", key: "contact" },
    { label: "Total Transactions", key: "totalTransactions" },
    { label: "Transaction Volume", key: "transactionVolume" },
    { label: "Status", key: "status" },
    { label: "Action", key: "action" },
  ];

  // Form fields for creating a new agent
  const createAgentFields: FormField[] = useMemo(
    () => [
      {
        name: "agentName",
        label: "Agent Name",
        type: "text",
        required: true,
        placeholder: "Enter agent name",
      },
      {
        name: "email",
        label: "Email Address",
        type: "email",
        required: true,
        placeholder: "example@email.com",
      },
      {
        name: "branch",
        label: "Branch",
        type: "select",
        required: true,
        placeholder: "Select an Option",
        options: [
          { value: "lagos", label: "Lagos" },
          { value: "abuja", label: "Abuja" },
          { value: "port-harcourt", label: "Port Harcourt" },
          { value: "kano", label: "Kano" },
          { value: "ibadan", label: "Ibadan" },
        ],
      },
      {
        name: "phone",
        label: "Phone Number",
        type: "tel",
        required: true,
        placeholder: "+234 00 0000 0000",
      },
      {
        name: "kycDocument",
        label: "Additional Document",
        type: "file",
        required: true,
        accept: ".pdf,.jpg,.jpeg,.png",
        maxSize: 2,
        description: "Upload KYC document (Max: 2 MB)",
      },
    ],
    []
  );

  const performCreateAgent = async (data: Record<string, any>) => {
    try {
      setLoading(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("Creating agent with data:", data);

      // Here you would make the actual API call
      // const response = await fetch("/api/agents", {
      //   method: "POST",
      //   body: formData,
      // });

      setCreateModalOpened(false);
      setConfirmModalOpened(false);
      setSuccessModalOpened(true);
      setPendingAgentData(null);
      // Optionally refresh the agents list
    } catch (error) {
      console.error("Error creating agent:", error);
      notifications.show({
        title: "Error",
        message: "Failed to create agent. Please try again.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenConfirm = (data: Record<string, any>) => {
    setPendingAgentData(data);
    setConfirmModalOpened(true);
  };

  const renderAgentRow = (item: Agent) => [
    // Agent
    <div key="agent">
      <Text fw={500} size="sm">
        {item.agentName}
      </Text>
      <Text size="xs" c="dimmed">
        ID:{item.id}
      </Text>
    </div>,

    // Contact
    <div key="contact">
      <Text fw={500} size="sm">
        {item.phone}
      </Text>
      <Text size="xs" c="dimmed">
        {item.email}
      </Text>
    </div>,

    // Total Transactions
    <Text key="totalTransactions" size="sm">
      {item.totalTransactions}
    </Text>,

    // Transaction Volume
    <Text key="transactionVolume" size="sm" fw={500}>
      {formatNaira(item.transactionVolume)}
    </Text>,

    // Status
    <StatusBadge key="status" status={item.status} />,

    // Action
    <ActionIcon
      key="action"
      radius="xl"
      variant="light"
      color="orange"
      onClick={() => router.push(`/admin/agent/${item.id}`)}
    >
      <ChevronRight size={14} />
    </ActionIcon>,
  ];

  return (
    <div className="my-5 rounded-lg bg-white p-5">
      <div>
        <Group justify="space-between" mb="md" wrap="nowrap">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">Agents</h2>
            <TextInput
              placeholder="Enter keyword"
              leftSection={<Search size={16} color="#DD4F05" />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              w={320}
              radius="xl"
            />
          </div>

          <Group>
            <Select
              value={filter}
              onChange={(value) => setFilter(value!)}
              data={["Filter By", "All", "Active", "Deactivated"]}
              radius="xl"
              w={120}
              rightSection={<ListFilter size={16} />}
            />

            <Button
              variant="outline"
              color="#E36C2F"
              radius="xl"
              rightSection={<Upload size={16} />}
            >
              Export
            </Button>

            <Button
              variant="filled"
              color="#DD4F05"
              radius="xl"
              leftSection={<Plus size={16} />}
              onClick={() => setCreateModalOpened(true)}
            >
              Add New
            </Button>
          </Group>
        </Group>
      </div>

      <FormModal
        opened={createModalOpened}
        size="lg"
        onClose={() => setCreateModalOpened(false)}
        title="Create New Agent"
        description="Fill out the basic information of the agent"
        fields={createAgentFields}
        onSubmit={handleOpenConfirm}
        submitLabel="Create Agent"
        loading={loading}
      />

      <ConfirmationModal
        opened={confirmModalOpened}
        onClose={() => setConfirmModalOpened(false)}
        title="Create Agent ?"
        message="Are you sure you want to create this agent? An invite will be sent to the agent’s email address."
        primaryButtonText="Yes, Create"
        secondaryButtonText="No, Close"
        loading={loading}
        onPrimary={async () => {
          if (!pendingAgentData) return;
          await performCreateAgent(pendingAgentData);
        }}
        onSecondary={() => setConfirmModalOpened(false)}
      />

      <SuccessModal
        opened={successModalOpened}
        onClose={() => setSuccessModalOpened(false)}
        title="New Agent Created"
        message="The new agent has been successfully created. You can now manage the agent or close this dialog."
        primaryButtonText="Manage Agents"
        onPrimaryClick={() => {
          setSuccessModalOpened(false);
        }}
      />

      <DynamicTableSection
        headers={agentHeaders}
        data={paginatedData}
        loading={false}
        renderItems={renderAgentRow}
        emptyTitle="No Agents Found"
        emptyMessage="There are currently no agents to display. Agents will appear here once they are created."
        pagination={{
          page,
          totalPages,
          onNext: () => setPage((p) => Math.min(p + 1, totalPages)),
          onPrevious: () => setPage((p) => Math.max(p - 1, 1)),
          onPageChange: setPage,
        }}
      />
    </div>
  );
}

