"use client";

import { useMemo, useState } from "react";
import {
  Button,
  Divider,
  Group,
  Menu,
  Select,
  Skeleton,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useParams, useRouter } from "next/navigation";
import { Download, Search } from "lucide-react";
import DynamicTableSection, {
  Header,
} from "@/app/admin/_components/DynamicTableSection";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { DetailItem } from "@/app/admin/_components/DetailItem";
import FormModal, {
  FormField,
} from "@/app/admin/_components/FormModal";
import { ConfirmationModal } from "@/app/admin/_components/ConfirmationModal";
import { SuccessModal } from "@/app/admin/_components/SuccessModal";
import RowActionIcon from "@/app/admin/_components/RowActionIcon";
import EmptySection from "@/app/admin/_components/EmptySection";
import { useAgentDetails } from "../hooks/useAgentDetails";
import { adminRoutes } from "@/lib/adminRoutes";
import { usePatchData } from "@/app/_lib/api/hooks";
import {
  adminApi,
  type UpdateAgentStatusPayload,
} from "@/app/admin/_services/admin-api";
import { useQueryClient } from "@tanstack/react-query";
import { adminKeys } from "@/app/_lib/api/query-keys";
import { notifications } from "@mantine/notifications";
import type { ApiError, ApiResponse } from "@/app/_lib/api/client";

type AgentStatus = "Active" | "Deactivated";

interface AgentDetails {
  id: string;
  name: string;
  status: AgentStatus;
  createdAt: string;
  createdTime: string;
  email: string;
  phone: string;
  branch: string;
  totalTransactions: number;
  transactionValue: number;
  lastTransaction: string;
  documentLabel: string;
}

type TransactionStatus = "Posted" | "Pending" | "Rejected";

interface AgentTransaction {
  id: string;
  actionDate: string;
  actionTime: string;
  type: string;
  transactionValue: number;
  status: TransactionStatus;
}

const formatNaira = (amount: number): string =>
  `₦ ${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const MOCK_TRANSACTIONS: AgentTransaction[] = [
  {
    id: "7844gAGA563A",
    actionDate: "September 12, 2025",
    actionTime: "11:00 am",
    type: "BTA Buy",
    transactionValue: 1250000,
    status: "Posted",
  },
  {
    id: "7844gAGA563B",
    actionDate: "September 12, 2025",
    actionTime: "11:00 am",
    type: "PTA Buy",
    transactionValue: 875000,
    status: "Pending",
  },
  {
    id: "7844gAGA563C",
    actionDate: "September 12, 2025",
    actionTime: "11:00 am",
    type: "PTA Buy",
    transactionValue: 930500,
    status: "Rejected",
  },
  {
    id: "7844gAGA563D",
    actionDate: "September 12, 2025",
    actionTime: "11:00 am",
    type: "Export Proceeds",
    transactionValue: 1100000,
    status: "Posted",
  },
  {
    id: "7844gAGA563E",
    actionDate: "September 12, 2025",
    actionTime: "11:00 am",
    type: "BTA Buy",
    transactionValue: 790000,
    status: "Pending",
  },
  {
    id: "7844gAGA563F",
    actionDate: "September 12, 2025",
    actionTime: "11:00 am",
    type: "PTA Sell",
    transactionValue: 980000,
    status: "Posted",
  },
];

export default function AgentDetailsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useParams<{ id: string }>();
  const agentId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const { agent: agentData, isLoading: isAgentLoading, isNotFound } =
    useAgentDetails(agentId);
  const [statusOverride, setStatusOverride] = useState<AgentStatus | null>(null);
  const currentStatus: AgentStatus =
    statusOverride ?? (agentData?.isActive ? "Active" : "Deactivated");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>("All");
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const [loading, setLoading] = useState(false);

  const [editModalOpened, setEditModalOpened] = useState(false);
  const [editConfirmOpened, setEditConfirmOpened] = useState(false);
  const [editSuccessOpened, setEditSuccessOpened] = useState(false);

  const [statusAction, setStatusAction] = useState<
    "deactivate" | "reactivate" | null
  >(null);
  const [statusConfirmOpened, setStatusConfirmOpened] = useState(false);
  const [statusSuccessOpened, setStatusSuccessOpened] = useState(false);

  const formatDate = (iso?: string | null) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (iso?: string | null) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleTimeString("en-NG", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const agent = useMemo<AgentDetails>(
    () => ({
      id: agentData?.id ?? "—",
      name: agentData?.name ?? "—",
      status: currentStatus,
      createdAt: formatDate(agentData?.createdAt),
      createdTime: formatTime(agentData?.createdAt),
      email: agentData?.email ?? "—",
      phone: agentData?.phoneNumber ?? "—",
      branch: "—",
      totalTransactions: 0,
      transactionValue: 0,
      lastTransaction: "—",
      documentLabel: "N/A",
    }),
    [agentData, currentStatus]
  );

  const headers: Header[] = [
    { label: "Transaction ID", key: "transactionId" },
    { label: "Action Date", key: "actionDate" },
    { label: "Type", key: "type" },
    { label: "Transaction Value", key: "transactionValue" },
    { label: "Action Effect", key: "actionEffect" },
    { label: "Action", key: "action" },
  ];

  const filteredTransactions = useMemo(() => {
    return MOCK_TRANSACTIONS.filter((tx) => {
      const matchesSearch =
        tx.id.toLowerCase().includes(search.toLowerCase()) ||
        tx.type.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        !statusFilter ||
        statusFilter === "All" ||
        tx.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / pageSize));

  const paginatedTransactions = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredTransactions.slice(start, end);
  }, [filteredTransactions, page, pageSize]);

  const renderTransactionRow = (tx: AgentTransaction) => [
    <Text key="transactionId" size="sm" fw={500}>
      {tx.id}
    </Text>,
    <div key="actionDate" className="flex flex-col">
      <Text size="sm">{tx.actionDate}</Text>
      <Text size="xs" c="dimmed">
        {tx.actionTime}
      </Text>
    </div>,
    <Text key="type" size="sm">
      {tx.type}
    </Text>,
    <Text key="transactionValue" size="sm" fw={500}>
      {formatNaira(tx.transactionValue)}
    </Text>,
    <StatusBadge key="actionEffect" status={tx.status} />,
    <RowActionIcon
      key="action"
      onClick={() => {
        router.push(adminRoutes.adminAgentTransactions(tx.id));
      }}
    />,
  ];

  const editAgentFields: FormField[] = useMemo(
    () => [
      {
        name: "agentName",
        label: "Agent Name",
        type: "text",
        required: true,
        placeholder: "Enter agent name",
      },
      {
        name: "branch",
        label: "Branch",
        type: "select",
        required: true,
        placeholder: "Select branch",
        options: [
          { value: "Chevron Drive, Lekki", label: "Chevron Drive, Lekki" },
          { value: "Victoria Island, Lagos", label: "Victoria Island, Lagos" },
          { value: "Yaba", label: "Yaba" },
        ],
      },
      {
        name: "email",
        label: "Email Address",
        type: "email",
        required: true,
        placeholder: "example@email.com",
      },
      {
        name: "phone",
        label: "Phone Number 1",
        type: "tel",
        required: true,
        placeholder: "+234 00 0000 0000",
      },
      {
        name: "internationalPassport",
        label: "International Passport",
        type: "file",
        required: true,
        accept: ".pdf,.jpg,.jpeg,.png",
        maxSize: 2,
      },
      {
        name: "additionalDocument",
        label: "Additional Document",
        type: "file",
        required: true,
        accept: ".pdf,.jpg,.jpeg,.png",
        maxSize: 2,
      },
    ],
    []
  );

  const handleEditSubmit = () => {
    // Here you could persist the edited values before confirming
    // For now we just open the confirmation modal to simulate the flow
    setEditConfirmOpened(true);
  };

  const performEditAgent = async () => {
    try {
      setLoading(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setEditModalOpened(false);
      setEditConfirmOpened(false);
      setEditSuccessOpened(true);
    } finally {
      setLoading(false);
    }
  };

  const isCurrentlyActive = currentStatus === "Active";

  const toggleStatusMutation = usePatchData(
    (payload: UpdateAgentStatusPayload) =>
      adminApi.agent.updateStatus(agentId!, payload),
    {
      onSuccess: async (_response, variables) => {
        notifications.show({
          title: "Status Updated",
          message: `Agent has been ${
            variables.isActive ? "reactivated" : "deactivated"
          } successfully.`,
          color: "green",
        });
        setStatusOverride(variables.isActive ? "Active" : "Deactivated");
        setStatusConfirmOpened(false);
        setStatusSuccessOpened(true);
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: [...adminKeys.agent.all],
          }),
          ...(agentId
            ? [
                queryClient.invalidateQueries({
                  queryKey: [...adminKeys.agent.detail(agentId)],
                }),
              ]
            : []),
        ]);
      },
      onError: (error) => {
        const apiResponse = (error as unknown as ApiError).data as ApiResponse;
        notifications.show({
          title: "Update Failed",
          message:
            apiResponse?.error?.message ??
            error.message ??
            "Unable to update agent status. Please try again.",
          color: "red",
        });
      },
    }
  );

  const performStatusChange = async () => {
    if (!statusAction || !agentId || toggleStatusMutation.isPending) return;
    toggleStatusMutation.mutate({
      isActive: statusAction === "reactivate",
    });
  };

  if (!isAgentLoading && (!agentData || isNotFound)) {
    return (
      <div className="space-y-6">
        <EmptySection
          title="Agent Not Found"
          description="The requested agent could not be found or may have been removed."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header + Agent Details Card */}
      <div className="rounded-xl bg-white p-5 shadow-sm space-y-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Stack gap={4} className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              {isAgentLoading ? (
                <Skeleton height={24} width={220} />
              ) : (
                <>
                  <Text size="xl" fw={600}>
                    {agent.name}
                  </Text>
                  <StatusBadge status={currentStatus} />
                </>
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-[#6B7280]">
              <span>
                <span className="font-medium text-[#111827]">
                  Date Created:
                </span>{" "}
                {agent.createdAt} | {agent.createdTime}
              </span>
              {!isAgentLoading && (
                <span className="inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="text-emerald-700 font-medium">
                    {currentStatus}
                  </span>
                </span>
              )}
            </div>
          </Stack>

          <Menu position="bottom-end" shadow="md" width={160}>
            <Menu.Target>
              <Button
                radius="xl"
                size="md"
                color="#DD4F05"
                className="self-start md:self-auto"
                disabled={!agentData || isAgentLoading || toggleStatusMutation.isPending}
              >
                Take Action
              </Button>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item onClick={() => setEditModalOpened(true)}>
                Edit
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                onClick={() => {
                  setStatusAction(isCurrentlyActive ? "deactivate" : "reactivate");
                  setStatusConfirmOpened(true);
                }}
              >
                {isCurrentlyActive ? "Deactivate" : "Reactivate"}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </div>

        <Divider />

        {/* Agent Details Summary */}
        <div>
          <Text fw={600} className="mb-4! text-orange-500!">
            Agent Details
          </Text>

          <div className="grid gap-6 md:grid-cols-4">
            <DetailItem label="Agent ID" value={agent.id} loading={isAgentLoading} />
            <DetailItem label="Email Address" value={agent.email} loading={isAgentLoading} />
            <DetailItem label="Phone Number" value={agent.phone} loading={isAgentLoading} />
            <DetailItem label="Branch" value={agent.branch} loading={isAgentLoading} />
            <DetailItem
              label="Total Transactions"
              value={String(agent.totalTransactions)}
              loading={isAgentLoading}
            />
            <DetailItem
              label="Transaction Value"
              value={formatNaira(agent.transactionValue)}
              loading={isAgentLoading}
            />
            <DetailItem
              label="Last Transaction"
              value={agent.lastTransaction}
              loading={isAgentLoading}
            />

            <div className="space-y-1">
              <Text size="xs" className="text-body-text-50!" mb={4}>
                Doc
              </Text>
              <Button
                variant="subtle"
                color="orange"
                size="xs"
                leftSection={<Download size={14} />}
                className="px-0"
              >
                {agent.documentLabel}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Agent Modal Flow */}
      <FormModal
        opened={editModalOpened}
        onClose={() => setEditModalOpened(false)}
        title="Edit Agent Details"
        description="View and manage agent details"
        fields={editAgentFields}
        submitLabel="Save Changes"
        cancelLabel="Close"
        loading={loading}
        size="lg"
        initialValues={{
          agentName: agent.name,
          branch: agent.branch,
          email: agent.email,
          phone: agent.phone,
        }}
        onSubmit={handleEditSubmit}
      />

      <ConfirmationModal
        opened={editConfirmOpened}
        onClose={() => setEditConfirmOpened(false)}
        title="Save Changes ?"
        message="Are you sure, save and update this changes? Kindly note that this new changes would override the existing data."
        primaryButtonText="Yes, Save and Update Changes"
        secondaryButtonText="No, Close"
        loading={loading}
        onPrimary={performEditAgent}
        onSecondary={() => setEditConfirmOpened(false)}
      />

      <SuccessModal
        opened={editSuccessOpened}
        onClose={() => setEditSuccessOpened(false)}
        title="New Changes Saved"
        message="New changes has been successfully saved and updated."
        primaryButtonText="Manage User"
        secondaryButtonText="No, Close"
        onPrimaryClick={() => {
          setEditSuccessOpened(false);
        }}
        onSecondaryClick={() => {
          setEditSuccessOpened(false);
        }}
      />

      {/* Deactivate / Reactivate Flow */}
      <ConfirmationModal
        opened={statusConfirmOpened}
        onClose={() => setStatusConfirmOpened(false)}
        title={
          statusAction === "deactivate"
            ? "Deactivate Agent ?"
            : "Reactivate Agent ?"
        }
        message={
          statusAction === "deactivate"
            ? "Are you sure, Deactivate this Agent? Kindly note that system access would be temporarily suspended, until the agent is reactivated"
            : "Are you sure, Reactivate this agent user? Kindly note that system access would be restored therefore this agent would now be able to access the system according to their role and related permissions"
        }
        primaryButtonText={
          statusAction === "deactivate"
            ? "Yes, Deactivate Agent"
            : "Yes, Reactivate Agent"
        }
        secondaryButtonText="No, Close"
        loading={toggleStatusMutation.isPending}
        onPrimary={performStatusChange}
        onSecondary={() => setStatusConfirmOpened(false)}
      />

      <SuccessModal
        opened={statusSuccessOpened}
        onClose={() => setStatusSuccessOpened(false)}
        title={
          statusAction === "deactivate"
            ? "Agent Deactivated"
            : "Agent Reactivated"
        }
        message={
          statusAction === "deactivate"
            ? "Agent has been successfully deactivated"
            : "Agent has been successfully Reactivated"
        }
        primaryButtonText="Manage Agent"
        secondaryButtonText="No, Close"
        onPrimaryClick={() => {
          setStatusSuccessOpened(false);
        }}
        onSecondaryClick={() => {
          setStatusSuccessOpened(false);
        }}
      />

      {/* Agent Transactions Table */}
      <div className="rounded-xl bg-white p-5 shadow-sm">
        <Group justify="space-between" mb="md" wrap="wrap">
          <Text fw={600} size="md">
            Agent Transactions
          </Text>

          <Group gap="sm" wrap="wrap">
            <TextInput
              placeholder="Enter keyword"
              leftSection={<Search size={16} color="#DD4F05" />}
              value={search}
              onChange={(e) => {
                setSearch(e.currentTarget.value);
                setPage(1);
              }}
              radius="xl"
              w={260}
            />

            <Select
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value);
                setPage(1);
              }}
              data={["All", "Posted", "Pending", "Rejected"]}
              radius="xl"
              w={140}
              placeholder="Filter By"
            />

            <Button
              variant="outline"
              color="#E36C2F"
              radius="xl"
            >
              Export
            </Button>
          </Group>
        </Group>

        <DynamicTableSection
          headers={headers}
          data={paginatedTransactions}
          renderItems={renderTransactionRow}
          emptyTitle="No Transactions Found"
          emptyMessage="There are currently no transactions for this agent."
          pagination={{
            page,
            totalPages,
            onNext: () => setPage((prev) => Math.min(prev + 1, totalPages)),
            onPrevious: () => setPage((prev) => Math.max(prev - 1, 1)),
            onPageChange: setPage,
          }}
        />
      </div>
    </div>
  );
}